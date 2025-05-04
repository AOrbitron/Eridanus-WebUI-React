# Eridanus WebUI
- Eridanus WebUI 基于React与Ant Design Pro开发，旨在提供一个简单易用的界面，让用户能够轻松配置和管理Eridanus。
- 目前仍在开发中。

## 开发计划
- [x] 对话
- [x] 修改yaml配置文件
- [x] 用户登录
- [x] 删除配置项二次确认
- [x] 修改登录信息
- [ ] 持久性登录
- [ ] 权限管理
- [ ] 对话上传文件
- [ ] 对话记录本地化归档/保存
- [ ] 安装流程（似乎不用了）
- [ ] 继续优化页面样式
- [ ] 更多message_components显示支持
## 准备环境
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
- `public`目录下为静态资源
## 关于
- [Ant Design Pro Github 仓库](https://github.com/ant-design/ant-design-pro)
- [Ant Design Pro 文档](https://pro.ant.design)
- [Ant Design 文档](https://pro.ant.design)
- [Ant Design X 文档](https://ant-design-x.antgroup.com/components/overview-cn)
