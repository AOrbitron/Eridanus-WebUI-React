import type { Request, Response } from 'express';

const songs = [
  { id: '1', title: '本地示例音频 01', desc: '聊天记录 Mock', frequency: 440 },
  { id: '2', title: '本地示例音频 02', desc: '聊天记录 Mock', frequency: 523.25 },
];

const history = [
  {
    role: 'end',
    message_id: 101,
    message: [{ type: 'text', data: { text: '加载一组音乐卡片看看播放列表。' } }],
  },
  ...songs.map((song, index) => ({
    role: 'start',
    message_id: 102 + index,
    message: {
      action: 'send_group_msg',
      params: {
        group_id: 879886836,
        message: [{ type: 'music', data: { type: 'mock', id: song.id } }],
      },
      echo: `mock-music-${song.id}`,
    },
  })),
];

let currentHistory = history;

const makeTone = (frequency: number) => {
  const sampleRate = 22050;
  const sampleCount = sampleRate * 2;
  const bytes = Buffer.alloc(44 + sampleCount * 2);
  bytes.write('RIFF', 0);
  bytes.writeUInt32LE(bytes.length - 8, 4);
  bytes.write('WAVEfmt ', 8);
  bytes.writeUInt32LE(16, 16);
  bytes.writeUInt16LE(1, 20);
  bytes.writeUInt16LE(1, 22);
  bytes.writeUInt32LE(sampleRate, 24);
  bytes.writeUInt32LE(sampleRate * 2, 28);
  bytes.writeUInt16LE(2, 32);
  bytes.writeUInt16LE(16, 34);
  bytes.write('data', 36);
  bytes.writeUInt32LE(sampleCount * 2, 40);
  for (let i = 0; i < sampleCount; i++) {
    const fade = Math.min(1, i / 2205, (sampleCount - i) / 2205);
    bytes.writeInt16LE(Math.round(Math.sin((2 * Math.PI * frequency * i) / sampleRate) * 4000 * fade), 44 + i * 2);
  }
  return bytes;
};

export default {
  'GET /api/chat/get_history': (_req: Request, res: Response) => {
    res.send({
      mock: true,
      data: [...currentHistory].reverse().map((item) => [JSON.stringify(item)]),
    });
  },
  'POST /api/chat/music': (req: Request, res: Response) => {
    const song = songs.find((item) => item.id === String(req.body?.id));
    if (!song) {
      res.send({ error: 'Mock 音乐不存在' });
      return;
    }
    res.send({
      title: song.title,
      desc: song.desc,
      preview: '/eridanus.svg',
      musicUrl: `/api/chat/mock-tone.wav?id=${song.id}`,
    });
  },
  'GET /api/chat/mock-tone.wav': (req: Request, res: Response) => {
    const song = songs.find((item) => item.id === String(req.query.id));
    if (!song) {
      res.sendStatus(404);
      return;
    }
    res.type('audio/wav').send(makeTone(song.frequency));
  },
  'POST /api/chat/del_history': (_req: Request, res: Response) => {
    currentHistory = [];
    res.send({ message: 'Mock 聊天记录已清空，重启开发服务器可恢复' });
  },
};
