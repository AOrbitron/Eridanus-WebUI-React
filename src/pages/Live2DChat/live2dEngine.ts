/**
 * live2dEngine.ts —— 网页版 Live2D 桌宠引擎（移植自 run/live2d/desktop/renderer.js 的 IS_WEB 分支）。
 *
 * 负责：加载 pixi + cubism vendor、加载模型、口型同步、情绪→表情/动作、GPT-SoVITS 语音、
 * 与 WebUI 同源的 /api/ws 对话通道、历史加载。UI 无关，通过回调把状态/气泡/历史/连接态回传给 React。
 *
 * 复用后端现成端点：/live2dchat/config|llm|tts|model、/api/ws、/api/chat/get_history、/api/chat/file。
 * 鉴权：与主站同源，浏览器自带 auth_token cookie；后端 _require_token 已放行已登录 WebUI 用户。
 */

const VENDOR_SCRIPTS = [
  '/vendor/live2d/pixi.min.js',
  '/vendor/live2d/live2dcubismcore.min.js',
  '/vendor/live2d/cubism4.min.js',
];

export interface HistoryItem {
  role: 'user' | 'bot';
  kind: 'text' | 'image' | 'file';
  content: string;
  name?: string;
  url?: string;
  ts: number;
}

export interface EngineCallbacks {
  onStatus: (text: string) => void;
  onBubble: (text: string) => void;
  onHistory: (updater: (prev: HistoryItem[]) => HistoryItem[]) => void;
  onConnected: (connected: boolean) => void;
  onConfigLoaded?: (cfg: any) => void;
}

const HISTORY_MAX = 300;

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max);
}

function smooth(prev: number, next: number, factor: number) {
  return prev + (next - prev) * factor;
}

function loadScriptOnce(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-live2d-src="${src}"]`) as HTMLScriptElement | null;
    if (existing) {
      if (existing.dataset.loaded === '1') resolve();
      else {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject(new Error('加载失败: ' + src)));
      }
      return;
    }
    const s = document.createElement('script');
    s.src = src;
    s.async = false; // 保持顺序：pixi -> cubismcore -> cubism4
    s.dataset.live2dSrc = src;
    s.onload = () => {
      s.dataset.loaded = '1';
      resolve();
    };
    s.onerror = () => reject(new Error('加载失败: ' + src));
    document.body.appendChild(s);
  });
}

export class Live2DEngine {
  private canvas: HTMLCanvasElement;
  private container: HTMLElement;
  private cb: EngineCallbacks;

  private config: any = null;
  private app: any = null;
  private model: any = null;
  private scale = 0.18;

  private currentMouthValue = 0;
  private lipSyncIds: string[] = ['ParamMouthOpenY'];
  private internalModel: any = null;
  private lipSyncHook: any = null;
  private motionManager: any = null;
  private motionFinishHook: any = null;

  private lastEmotion: string | null = null;
  private expressionResetTimer: any = 0;

  private audioContext: AudioContext | null = null;
  private audioQueue: ArrayBuffer[] = [];
  private audioPlaying = false;

  private ws: WebSocket | null = null;
  private tickerFn: any = null;
  private resizeObserver: ResizeObserver | null = null;
  private disposed = false;

  constructor(canvas: HTMLCanvasElement, container: HTMLElement, cb: EngineCallbacks) {
    this.canvas = canvas;
    this.container = container;
    this.cb = cb;
  }

  // ---------- 生命周期 ----------

  async start(): Promise<void> {
    try {
      this.cb.onStatus('正在加载渲染组件…');
      for (const src of VENDOR_SCRIPTS) await loadScriptOnce(src);
      if (this.disposed) return;

      this.cb.onStatus('正在读取配置…');
      const resp = await fetch('/live2dchat/config', { credentials: 'include' });
      if (resp.status === 503) {
        this.cb.onStatus('Live2D 网页版未开启：请在 live2d 配置里将 webui_enable 设为 true。');
        return;
      }
      if (resp.status === 401) {
        this.cb.onStatus('未授权：请先登录 WebUI（或在 live2d 配置里设置口令）。');
        return;
      }
      this.config = await resp.json();
      this.cb.onConfigLoaded?.(this.config);
      this.scale = (this.config.window && this.config.window.scale) || 0.18;
      if (Array.isArray(this.config.lip_sync_parameter_ids) && this.config.lip_sync_parameter_ids.length) {
        this.lipSyncIds = this.config.lip_sync_parameter_ids;
      }

      const PIXI = (window as any).PIXI;
      if (!PIXI || !PIXI.live2d) {
        this.cb.onStatus('渲染组件未就绪（PIXI.live2d 缺失）。');
        return;
      }

      const { w, h } = this.viewport();
      this.app = new PIXI.Application({
        view: this.canvas,
        backgroundAlpha: 0,
        antialias: true,
        width: w,
        height: h,
        autoDensity: true,
        resolution: window.devicePixelRatio || 1,
      });

      // 每帧手动驱动 Live2D 更新（模型以 autoUpdate:false 加载）
      this.tickerFn = () => {
        if (this.model) {
          try {
            this.model.update(this.app.ticker.deltaMS);
          } catch (e) {
            /* ignore */
          }
        }
      };
      this.app.ticker.add(this.tickerFn);

      await this.loadHistory();
      if (this.disposed) return;

      // 容器尺寸变化时自适应（面板展开/窗口缩放）
      this.resizeObserver = new ResizeObserver(() => this.resizeApp());
      this.resizeObserver.observe(this.container);

      await this.loadModel(this.config.model_url);
      this.connectWebui();
    } catch (err: any) {
      console.error('[live2d] 启动失败:', err);
      this.cb.onStatus('启动失败：' + (err && err.message ? err.message : String(err)));
    }
  }

  dispose(): void {
    this.disposed = true;
    if (this.expressionResetTimer) window.clearTimeout(this.expressionResetTimer);
    try {
      this.resizeObserver?.disconnect();
    } catch (e) {
      /* ignore */
    }
    try {
      this.ws?.close();
    } catch (e) {
      /* ignore */
    }
    this.ws = null;
    this.disposeModel();
    try {
      if (this.app) {
        if (this.tickerFn) this.app.ticker.remove(this.tickerFn);
        this.app.destroy(false, { children: true });
      }
    } catch (e) {
      /* ignore */
    }
    this.app = null;
    try {
      this.audioContext?.close();
    } catch (e) {
      /* ignore */
    }
    this.audioContext = null;
  }

  private viewport() {
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    return { w, h };
  }

  // ---------- 模型 ----------

  private async loadModel(url: string): Promise<boolean> {
    if (!url) {
      this.cb.onStatus('未配置模型路径（model_path / model）。');
      return false;
    }
    this.cb.onStatus('正在加载 Live2D 模型…');
    try {
      const PIXI = (window as any).PIXI;
      // model_url 已是同源 HTTP 路径（/live2dchat/model/...），原样使用
      const model = await PIXI.live2d.Live2DModel.from(url, { autoInteract: false, autoUpdate: false });
      if (this.disposed) {
        try {
          model.destroy({ children: true });
        } catch (e) {
          /* ignore */
        }
        return false;
      }
      this.disposeModel();
      this.model = model;
      this.app.stage.addChild(model);
      model.anchor.set(0.5, 0.5);
      this.layoutModel();
      this.fitModelToViewport();
      window.requestAnimationFrame(() => this.fitModelToViewport());
      this.attachLipSyncHook(model);
      this.attachMotionResetHook(model);
      this.cb.onStatus('');
      return true;
    } catch (err: any) {
      console.error('[live2d] 模型加载失败:', err);
      this.cb.onStatus('模型加载失败：' + (err && err.message ? err.message : String(err)));
      return false;
    }
  }

  private layoutModel() {
    if (!this.model || !this.app) return;
    this.model.scale.set(this.scale);
    const sw = this.app.screen.width;
    const sh = this.app.screen.height;
    // 宽屏让模型靠左给右侧聊天面板留位；窄屏基本居中略偏上
    const wide = this.container.clientWidth >= 768;
    const cx = wide ? sw * 0.34 : sw * 0.5;
    const cy = wide ? sh * 0.52 : sh * 0.44;
    this.model.position.set(cx, cy);
  }

  private fitModelToViewport() {
    if (!this.model || !this.app) return;
    let b;
    try {
      b = this.model.getBounds();
    } catch (e) {
      return;
    }
    if (!b || b.height <= 0) return;
    const wide = this.container.clientWidth >= 768;
    const target = this.app.screen.height * (wide ? 0.82 : 0.62);
    this.scale = clamp(this.scale * (target / b.height), 0.04, 1.2);
    this.layoutModel();
  }

  private resizeApp() {
    if (!this.app) return;
    const { w, h } = this.viewport();
    if (w <= 0 || h <= 0) return;
    this.app.renderer.resize(w, h);
    this.layoutModel();
  }

  zoom(delta: number) {
    this.scale = clamp(this.scale + delta, 0.04, 1.2);
    this.layoutModel();
  }

  private disposeModel() {
    this.detachLipSyncHook();
    this.detachMotionResetHook();
    if (this.model) {
      try {
        this.app.stage.removeChild(this.model);
        this.model.destroy({ children: true });
      } catch (err) {
        console.warn('[live2d] 销毁模型失败:', err);
      }
    }
    this.model = null;
  }

  // ---------- 口型同步 ----------

  private attachLipSyncHook(model: any) {
    this.detachLipSyncHook();
    const internalModel = model.internalModel;
    if (!internalModel || typeof internalModel.on !== 'function') return;
    this.lipSyncHook = () => {
      const coreModel = internalModel.coreModel;
      if (!coreModel || typeof coreModel.setParameterValueById !== 'function') return;
      this.lipSyncIds.forEach((id) => {
        try {
          coreModel.setParameterValueById(id, this.currentMouthValue);
        } catch (err) {
          /* 某些模型没有该参数 */
        }
      });
    };
    internalModel.on('beforeModelUpdate', this.lipSyncHook);
    this.internalModel = internalModel;
  }

  private detachLipSyncHook() {
    if (this.internalModel && this.lipSyncHook && typeof this.internalModel.off === 'function') {
      this.internalModel.off('beforeModelUpdate', this.lipSyncHook);
    }
    this.internalModel = null;
    this.lipSyncHook = null;
  }

  // ---------- 动作结束复位 ----------

  private attachMotionResetHook(model: any) {
    this.detachMotionResetHook();
    const mm = model.internalModel && model.internalModel.motionManager;
    if (!mm || typeof mm.on !== 'function') return;
    this.motionFinishHook = () => this.resetModelPose();
    mm.on('motionFinish', this.motionFinishHook);
    this.motionManager = mm;
  }

  private detachMotionResetHook() {
    if (this.motionManager && this.motionFinishHook && typeof this.motionManager.off === 'function') {
      this.motionManager.off('motionFinish', this.motionFinishHook);
    }
    this.motionManager = null;
    this.motionFinishHook = null;
  }

  private resetModelPose() {
    const core = this.model && this.model.internalModel && this.model.internalModel.coreModel;
    if (!core || typeof core.getParameterCount !== 'function') return;
    try {
      const n = core.getParameterCount();
      for (let i = 0; i < n; i += 1) {
        try {
          core.setParameterValueByIndex(i, core.getParameterDefaultValue(i));
        } catch (e) {
          /* ignore */
        }
      }
      if (typeof core.saveParameters === 'function') core.saveParameters();
    } catch (e) {
      /* ignore */
    }
  }

  // ---------- 语音播放 + 口型驱动 ----------

  private playAudioBuffer(arrayBuf: ArrayBuffer) {
    if (!arrayBuf) return;
    this.audioQueue.push(arrayBuf);
    this.drainAudioQueue();
  }

  private async drainAudioQueue() {
    if (this.audioPlaying) return;
    this.audioPlaying = true;
    try {
      while (this.audioQueue.length) {
        await this.playOneBuffer(this.audioQueue.shift() as ArrayBuffer);
      }
    } finally {
      this.audioPlaying = false;
    }
  }

  private async playOneBuffer(arrayBuf: ArrayBuffer) {
    if (!arrayBuf) return;
    let ctx: AudioContext;
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      ctx = this.audioContext;
      if (ctx.state === 'suspended') await ctx.resume();
    } catch (err) {
      console.error('[live2d] 音频上下文初始化失败:', err);
      return;
    }

    let audioBuf: AudioBuffer;
    try {
      audioBuf = await ctx.decodeAudioData(arrayBuf.slice(0));
    } catch (err) {
      console.error('[live2d] 音频解码失败:', err);
      return;
    }

    await new Promise<void>((resolve) => {
      const source = ctx.createBufferSource();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.buffer = audioBuf;
      source.connect(analyser);
      analyser.connect(ctx.destination);

      const data = new Uint8Array(analyser.frequencyBinCount);
      let raf = 0;
      const tick = () => {
        analyser.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i += 1) sum += data[i];
        const avg = sum / data.length / 255;
        this.currentMouthValue = smooth(this.currentMouthValue, clamp(avg * 1.8, 0, 1), 0.5);
        raf = window.requestAnimationFrame(tick);
      };
      source.onended = () => {
        window.cancelAnimationFrame(raf);
        this.currentMouthValue = 0;
        resolve();
      };
      try {
        source.start(0);
        tick();
      } catch (err) {
        console.error('[live2d] 音频播放失败:', err);
        resolve();
      }
    });
  }

  // ---------- TTS ----------

  private stripParenthetical(text: string) {
    return String(text || '')
      .replace(/（[^）]*）/g, '')
      .replace(/\([^)]*\)/g, '')
      .replace(/【[^】]*】/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private async synthesizeTTS(text: string): Promise<ArrayBuffer | null> {
    const cfg = (this.config && this.config.tts) || {};
    if (cfg.enable === false) return null;
    const t = String(text || '').trim();
    if (!t) return null;
    const resp = await fetch('/live2dchat/tts', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: t }),
    });
    if (!resp.ok) throw new Error('TTS HTTP ' + resp.status);
    return await resp.arrayBuffer();
  }

  // ---------- 情绪 → 表情/动作 ----------

  private applyExpression(name: string) {
    if (!this.model) return;
    try {
      if (name) {
        this.model.expression(name);
      } else {
        const em =
          this.model.internalModel &&
          this.model.internalModel.motionManager &&
          this.model.internalModel.motionManager.expressionManager;
        if (em && typeof em.resetExpression === 'function') em.resetExpression();
      }
    } catch (e) {
      /* 某些模型缺少该表情 */
    }
  }

  private playMotion(group: string) {
    if (!group || !this.model) return;
    const PIXI = (window as any).PIXI;
    try {
      this.model.motion(group, undefined, (PIXI.live2d.MotionPriority && PIXI.live2d.MotionPriority.NORMAL) || 2);
    } catch (e) {
      /* ignore */
    }
  }

  private keywordClassify(text: string) {
    const t = String(text || '');
    const has = (re: RegExp) => re.test(t);
    let emotion = '';
    let scene = '';
    if (has(/(你好|您好|早上好|早安|中午好|下午好|晚上好|在吗|在不在|嗨|哈喽|hello|hi)/i)) scene = 'greeting';
    else if (has(/(再见|拜拜|晚安|下次见|回头见|bye|goodbye)/i)) scene = 'farewell';
    if (has(/(呜呜|哭|泪流|想哭|伤心欲绝|哽咽)/)) emotion = 'cry';
    else if (has(/(难过|委屈|失落|遗憾|抱歉|对不起|可惜|心疼)/)) emotion = 'sad';
    else if (has(/(生气|讨厌|可恶|烦死|气死|哼!|怒)/)) emotion = 'angry';
    else if (has(/(尴尬|无语|无言|裂开|社死)/)) emotion = 'awkward';
    else if (has(/(困惑|疑惑|不懂|懵|啊\?|什么意思|为什么|怎么会)/)) emotion = 'confused';
    else if (has(/(喜欢你|爱你|么么|抱抱|亲亲|宝贝|想你)/)) emotion = 'love';
    else if (has(/(害羞|脸红|不好意思|羞)/)) emotion = 'shy';
    else if (has(/(哇|居然|竟然|不会吧|天哪|震惊|惊讶)/)) emotion = 'surprised';
    else if (has(/(嘿嘿|哼哼|得意|不过如此|小意思|略略)/)) emotion = 'smug';
    else if (has(/(嘻嘻|调皮|逗你|开玩笑|吐舌|皮一下)/)) emotion = 'playful';
    else if (has(/(太棒了|耶|好开心|开心|高兴|哈哈|嘿|爽|赞)/)) emotion = 'happy';
    else if (scene === 'greeting') emotion = 'happy';
    return { emotion, scene };
  }

  private buildEmotionPrompt(text: string, emotionKeys: string[], sceneKeys: string[]) {
    return [
      '你是 Live2D 桌宠的情绪识别器。阅读下面这句【角色台词】，判断说话者当前的情绪，并识别是否属于某种聊天场景。',
      '只输出一行 JSON，不要任何解释：{"emotion":"<情绪>","scene":"<场景或空字符串>"}',
      'emotion 只能从这些英文标签里精确选一个：' + emotionKeys.join(', '),
      'scene 只能为以下之一或空字符串：' + (sceneKeys.length ? sceneKeys.join(', ') + ', ""' : '""'),
      '若情绪不明显请用 neutral。',
      '【角色台词】' + text,
    ].join('\n');
  }

  private parseEmotionJson(raw: string, emotionKeys: string[], sceneKeys: string[]) {
    const m = String(raw || '').match(/\{[^{}]*\}/);
    if (!m) return { emotion: '', scene: '' };
    let obj: any;
    try {
      obj = JSON.parse(m[0]);
    } catch (e) {
      return { emotion: '', scene: '' };
    }
    let emotion = String(obj.emotion || '').trim().toLowerCase();
    let scene = String(obj.scene || '').trim().toLowerCase();
    if (emotionKeys.indexOf(emotion) < 0) emotion = '';
    if (sceneKeys.indexOf(scene) < 0) scene = '';
    return { emotion, scene };
  }

  private async fastLLM(prompt: string): Promise<string | null> {
    try {
      const resp = await fetch('/live2dchat/llm', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await resp.json();
      return data.choices[0].message.content;
    } catch (e) {
      return null;
    }
  }

  private async classifyEmotion(text: string) {
    const cfg = (this.config && this.config.expression) || {};
    if (cfg.enable === false) return null;
    const emotions = cfg.emotions || {};
    const scenes = cfg.scenes || {};
    const emotionKeys = Object.keys(emotions);
    if (!emotionKeys.length) return null;
    const t = (text || '').trim();
    if (!t) return null;

    let result: any = null;
    if (cfg.llm) {
      try {
        const raw = await this.fastLLM(this.buildEmotionPrompt(t, emotionKeys, Object.keys(scenes)));
        result = this.parseEmotionJson(raw || '', emotionKeys, Object.keys(scenes));
      } catch (e) {
        /* 走关键词兜底 */
      }
    }
    if (!result || (!result.emotion && !result.scene)) {
      result = this.keywordClassify(t);
    }
    let { emotion, scene } = result;
    if (emotion && emotionKeys.indexOf(emotion) < 0) emotion = '';
    if (scene && Object.keys(scenes).indexOf(scene) < 0) scene = '';
    return { emotion, scene };
  }

  private applyEmotionPlan(plan: { emotion?: string; scene?: string } | null) {
    const cfg = (this.config && this.config.expression) || {};
    const emotions = cfg.emotions || {};
    const scenes = cfg.scenes || {};
    const { emotion, scene } = plan || {};

    const sceneMotion = scene && scenes[scene] && scenes[scene].motion;
    if (sceneMotion) this.playMotion(sceneMotion);

    if (emotion && emotion !== this.lastEmotion) {
      this.lastEmotion = emotion;
      const map = emotions[emotion] || {};
      this.applyExpression(map.expression || '');
      if (map.motion && !sceneMotion) this.playMotion(map.motion);
      this.scheduleExpressionReset();
    }
  }

  private scheduleExpressionReset() {
    const cfg = (this.config && this.config.expression) || {};
    const delay = Number.isFinite(cfg.reset_delay_ms) ? cfg.reset_delay_ms : 6000;
    if (delay <= 0) return;
    if (this.expressionResetTimer) window.clearTimeout(this.expressionResetTimer);
    this.expressionResetTimer = window.setTimeout(() => {
      this.applyExpression('');
      this.lastEmotion = null;
    }, delay);
  }

  // ---------- 消息渲染 ----------

  private mediaUrl(fileOrUrl: string, name?: string) {
    const raw = fileOrUrl;
    if (!raw) return raw;
    if (/^https?:\/\//i.test(raw) || raw.startsWith('data:')) return raw;
    if (raw.startsWith('base64://')) return 'data:image/png;base64,' + raw.slice('base64://'.length);
    const p = raw.startsWith('file://') ? raw : 'file://' + raw;
    let q = 'path=' + encodeURIComponent(p);
    if (name) q += '&name=' + encodeURIComponent(name);
    return '/api/chat/file?' + q;
  }

  private extractBotSegments(m: any): any[] {
    const params = (m && m.params) || {};
    switch (m && m.action) {
      case 'send_group_msg':
        return Array.isArray(params.message) ? params.message : [];
      case 'send_group_forward_msg': {
        const out: any[] = [];
        for (const node of params.messages || []) {
          const content = node && node.data && node.data.content;
          if (Array.isArray(content)) out.push(...content);
        }
        return out;
      }
      case 'upload_group_file':
        return [{ type: 'file', data: { file: params.file || params.url, name: params.name || '' } }];
      default:
        return [];
    }
  }

  private segmentsToBuckets(segments: any[]) {
    const texts: string[] = [];
    const images: string[] = [];
    const files: { url: string; name: string }[] = [];
    const labels: string[] = [];
    for (const seg of segments || []) {
      if (!seg || !seg.type) continue;
      const data = seg.data || {};
      switch (seg.type) {
        case 'text':
          if (data.text) texts.push(String(data.text));
          break;
        case 'image': {
          const url = this.mediaUrl(data.file || data.url);
          if (url) images.push(url);
          break;
        }
        case 'video':
          labels.push('🎬 视频');
          break;
        case 'file': {
          const url = this.mediaUrl(data.file || data.url, data.name);
          if (url) files.push({ url, name: data.name || '' });
          break;
        }
        default:
          break;
      }
    }
    return { texts, images, files, labels };
  }

  private messageToHistoryItems(message: any): HistoryItem[] {
    const items: HistoryItem[] = [];
    if (Array.isArray(message)) {
      const { texts, images, files } = this.segmentsToBuckets(message);
      for (const url of images) items.push({ role: 'user', kind: 'image', content: url, ts: 0 });
      const joined = texts.join('\n');
      if (joined) items.push({ role: 'user', kind: 'text', content: joined, ts: 0 });
      for (const f of files) items.push({ role: 'user', kind: 'file', content: f.url, url: f.url, name: f.name, ts: 0 });
    } else if (message && typeof message === 'object') {
      const { texts, images, files, labels } = this.segmentsToBuckets(this.extractBotSegments(message));
      for (const url of images) items.push({ role: 'bot', kind: 'image', content: url, ts: 0 });
      for (const f of files) items.push({ role: 'bot', kind: 'file', content: f.url, url: f.url, name: f.name, ts: 0 });
      const joined = texts.join('\n');
      if (joined) items.push({ role: 'bot', kind: 'text', content: joined, ts: 0 });
      for (const lb of labels) items.push({ role: 'bot', kind: 'text', content: lb, ts: 0 });
    }
    return items;
  }

  private addHistory(role: 'user' | 'bot', kind: 'text' | 'image' | 'file', content: string, extra?: any) {
    const item: HistoryItem = { role, kind, content, ts: Date.now(), ...(extra || {}) };
    this.cb.onHistory((prev) => [...prev, item].slice(-HISTORY_MAX));
  }

  private async renderBotSegments(segments: any[]) {
    const { texts, images, files, labels } = this.segmentsToBuckets(segments);

    for (const url of images) {
      this.addHistory('bot', 'image', url);
    }
    for (const f of files) {
      this.addHistory('bot', 'file', f.url, { name: f.name, url: f.url });
    }

    const joined = texts.join('\n');
    if (joined) {
      const speakText = this.stripParenthetical(joined);
      const [audioBuf, plan] = await Promise.all([
        speakText
          ? this.synthesizeTTS(speakText).catch((e) => {
              console.error('[live2d] TTS 合成失败:', e);
              return null;
            })
          : Promise.resolve(null),
        this.classifyEmotion(joined).catch(() => null),
      ]);
      if (audioBuf) this.playAudioBuffer(audioBuf);
      this.cb.onBubble(joined);
      this.addHistory('bot', 'text', joined);
      if (plan) this.applyEmotionPlan(plan);
    }

    for (const label of labels) {
      this.cb.onBubble(label);
      this.addHistory('bot', 'text', label);
    }
  }

  // ---------- WebSocket 对话通道 ----------

  private connectWebui() {
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    let url = `${proto}://${location.host}/api/ws`;
    const host = location.hostname;
    if (host !== '127.0.0.1' && host !== 'localhost') {
      const m = document.cookie.match(/(?:^|;\s*)auth_token=([^;]+)/);
      if (m) url += '?auth_token=' + encodeURIComponent(m[1]);
    }

    const connect = () => {
      if (this.disposed) return;
      const ws = new WebSocket(url);
      this.ws = ws;
      ws.onopen = () => this.cb.onConnected(true);
      ws.onmessage = (msg) => {
        let frame: any;
        try {
          frame = JSON.parse(msg.data);
        } catch (err) {
          return;
        }
        if (!frame || !frame.message) return;
        const m = frame.message;
        if (Array.isArray(m)) return; // 其它客户端的用户消息，忽略
        const segs = this.extractBotSegments(m);
        if (segs.length) this.renderBotSegments(segs);
      };
      ws.onclose = () => {
        this.cb.onConnected(false);
        if (!this.disposed) window.setTimeout(connect, 2000);
      };
      ws.onerror = () => {
        try {
          ws.close();
        } catch (e) {
          /* ignore */
        }
      };
    };
    connect();
  }

  /** 发送用户消息；返回是否成功入队。*/
  sendChat(text: string): boolean {
    const t = (text || '').trim();
    if (!t) return false;
    const ws = this.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    // 与 WebUI 前端一致：msg_id + @机器人(qq=1000000 命中 mai_reply「被@必回」) + 文本
    const payload = [
      { msg_id: Date.now() },
      { type: 'at', data: { qq: '1000000', name: 'Eridanus' } },
      { type: 'text', data: { text: t } },
    ];
    ws.send(JSON.stringify(payload));
    this.addHistory('user', 'text', t);
    return true;
  }

  // ---------- 历史 ----------

  private async loadHistory() {
    try {
      const resp = await fetch('/api/chat/get_history?start=0&end=' + (HISTORY_MAX - 1), { credentials: 'include' });
      const data = await resp.json();
      const rows = (data && data.data) || [];
      const items: HistoryItem[] = [];
      for (const row of rows.slice().reverse()) {
        let rec: any;
        try {
          rec = JSON.parse(row[0]);
        } catch (e) {
          continue;
        }
        for (const it of this.messageToHistoryItems(rec.message)) {
          it.ts = rec.message_id || 0;
          items.push(it);
        }
      }
      const trimmed = items.slice(-HISTORY_MAX);
      this.cb.onHistory(() => trimmed);
    } catch (e) {
      console.warn('[live2d] 历史加载失败（可能未登录 WebUI）:', e);
    }
  }
}
