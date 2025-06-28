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
- [ ] 修改用户信息
- [x] 升降序排序
- [ ] 批量删除用户
- [ ] ~~新建用户~~


## 开发前的环境准备
- 请确认电脑已经安装好node.js
- 切换到项目目录下，执行：
---

换淘宝镜像源
```bash
 npm config set registry https://registry.npmmirror.com
```
安装环境
```bash
npm install
```

视网络环境，稍等10分钟左右，环境部署完成

## 运行
会在8000端口启动服务器，可以实时修改代码，查看效果
```bash
npm run start
```

## 编译
编译后的文件在`dist`目录下
```bash
npm run build
```
## 提示
- `mock`目录下为模拟API的数据，用于本地调试，可根据需要修改
- `config`目录下为基础配置文件
- `src`目录下为源代码
- `public`目录下为静态资源，编译后位于根路由下
## 关于
- [Ant Design Pro Github 仓库](https://github.com/ant-design/ant-design-pro)
- [Ant Design Pro 文档](https://pro.ant.design)
- [Ant Design 文档](https://ant.design)
- [Ant Design X 文档](https://ant-design-x.antgroup.com/components/overview-cn)
