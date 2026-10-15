# Eridanus WebUI

## 简介

- Eridanus WebUI 基于React与Ant Design Pro开发，旨在提供一个简单易用的界面，让用户能够轻松配置和管理Eridanus。
- 请注意，本仓库仅为Eridanus WebUI的前端代码，后端与机器人功能实现请移步至 [Eridanus 仓库](https://github.com/AOrbitron/Eridanus)

## 开发计划

### 总览

- [x] 服务器基本信息
- [ ] 机器人基本信息（目前仅有用户总数）
- [x] 用户排行榜

### 聊天

- [x] 基本的聊天
- [x] 图片预览
- [x] 语音消息
- [x] 视频预览
- [x] 是否@
- [x] 视频预览使用dplayer，优化体验
- [x] 转发消息浏览
- [ ] ~~消息撤回（没必要吧）~~
- [x] 聊天记录同步
- [x] 上传文件
- [ ] 聊天文件管理
- [ ] 修改气泡背景色，易于辨认
- [ ] 消息管理
- [ ] 聊天记录懒加载

### 修改配置文件

- [x] 修改yaml配置文件
- [ ] 重启服务端
- [ ] 文本编辑器模式

### 用户管理

- [x] 查看用户基本信息
- [x] 按用户ID搜索
- [x] 修改用户信息
- [x] 升降序排序
- [ ] 批量删除用户
- [ ] ~~新建用户~~

### 日志查看

- [x] 查看日志
- [ ] 实时日志
- [x] 按时间范围搜索
- [x] 按日志等级搜索
- [x] 按模块搜索
- [x] 下载日志
- [x] 按日志内容搜索

### 小工具

- [ ] 重启服务端
- [x] 导入导出配置文件

## 开发前的环境准备

- 请安装 Node.js 22+ 与 pnpm 10+
- 切换到项目目录下，执行：

```bash
pnpm install --frozen-lockfile
```

## 启动与配置

开发服务器默认运行在 `http://localhost:8000`。Umi 开发模式默认启用 `mock/` 下的本地接口；使用 `start:no-mock` 或 `start:test` 才会关闭 Mock。

| 命令                 | 环境标记                            | Mock | 用途                       |
| -------------------- | ----------------------------------- | ---- | -------------------------- |
| `pnpm start`         | `UMI_ENV=dev`                       | 启用 | 本地开发，默认入口         |
| `pnpm start:dev`     | `UMI_ENV=dev`, `REACT_APP_ENV=dev`  | 启用 | 本地开发，带 dev 标记      |
| `pnpm start:no-mock` | `UMI_ENV=dev`                       | 关闭 | 连接真实后端进行本地联调   |
| `pnpm start:remote`  | `UMI_ENV=dev`                       | 关闭 | 连接远程后端进行本地联调   |
| `pnpm start:pre`     | `UMI_ENV=dev`, `REACT_APP_ENV=pre`  | 启用 | 带 pre 标记的开发启动      |
| `pnpm start:test`    | `UMI_ENV=dev`, `REACT_APP_ENV=test` | 关闭 | 带 test 标记的真实后端联调 |

`REACT_APP_ENV` 当前只作为环境标记，`UMI_ENV` 用于选择 Umi 配置环境。本仓库目前没有按这些标记配置不同的代理或 API 主机；请求地址由 `UMI_APP_API_BASE_URL` 决定。未设置时使用同源 `/api` 地址，适合 Mock 或由 Web 服务器反向代理 API 的部署。`API_URL` 不会被前端读取。

### 连接真实后端

将 API 基础地址设为 Eridanus WebUI 后端地址。PowerShell 示例：

```powershell
$env:UMI_APP_API_BASE_URL = "http://192.168.1.100:5007"
pnpm start:remote
```

也可以通过一条命令启动。该命令同时设置正确的 API 地址和 `MOCK=none`，不会加载 `mock/` 接口：

```bash
pnpm exec cross-env MOCK=none UMI_APP_API_BASE_URL=http://192.168.1.100:5007 UMI_ENV=dev max dev
```

如果只执行 `pnpm start`，Umi 会按默认配置启用 `mock/`；远程联调必须使用 `pnpm start:remote` 或 `pnpm start:no-mock`，并设置 `UMI_APP_API_BASE_URL`。

API 基础地址不要附加 `/api`；页面会自动拼接接口路径。部署构建时也需要在构建命令前设置该变量，例如：

```bash
pnpm exec cross-env UMI_APP_API_BASE_URL=https://bot.example.com pnpm build
```

没有单独后端域名时，保持变量为空，并让部署服务器将 `/api` 与 `/api/ws` 转发到 Eridanus 后端。跨域部署还需要后端允许 WebUI 域名访问。

### 本地 Mock

Mock 定义在 `mock/user.ts` 和 `mock/chat.ts`。登录账号和密码均为 `eridanus`。聊天 Mock 提供两张历史音乐卡片、对应的音乐信息与本地生成的短音频，打开 `/chat` 后即可展开右下角播放列表查看。Mock 历史记录会跳过 WebSocket 连接；发送消息、文件上传和用户管理仍需真实后端。清空 Mock 历史记录后，重启开发服务器即可恢复。

PowerShell 中启动本地 Mock 前，清除上次远程联调留下的 API 地址和 Mock 开关：

```powershell
Remove-Item Env:UMI_APP_API_BASE_URL -ErrorAction SilentlyContinue
Remove-Item Env:MOCK -ErrorAction SilentlyContinue
pnpm start
```

## 编译

编译后的文件在`dist`目录下

```bash
pnpm build
```

## 提示

- 应用首次打开与页面 JS 分包下载时会显示全局加载指示。JS 分包请求超过 30 秒或下载失败后，等待 1 秒自动重试一次，并使用新的查询参数避开失败缓存；同一分包的并发请求共用这次重试。入口 JS 下载失败也会重试一次。再次失败时显示中文提示与“刷新页面”按钮，由用户手动刷新，避免自动刷新丢失未保存的配置。此机制只处理应用 JS 资源，不会自动重发保存配置、发送消息等业务请求。
- 发布时请尽量保留上一版本的带 hash 静态文件，避免已经打开的页面因旧分包被删除而持续出现 404；网络重试无法恢复已被删除的文件。
- `mock`目录下为模拟API的数据，用于本地调试，可根据需要修改
- `config`目录下为基础配置文件
- `src`目录下为源代码
- `public`目录下为静态资源，编译后位于根路由下

## 关于

- [Ant Design Pro Github 仓库](https://github.com/ant-design/ant-design-pro)
- [Ant Design Pro 文档](https://pro.ant.design)
- [Ant Design 文档](https://ant.design)
- [Ant Design X 文档](https://ant-design-x.antgroup.com/components/overview-cn)
