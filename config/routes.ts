import { Component } from "react";

export default [
  {
    path: '/user',
    routes: [{ name: '登录', path: '/user/login', component: './User/Login' }],
  },
  { path: '/dashboard', name: '总览', icon: 'compass', component: './TBD' },
  { path: '/chat', name: '聊天', icon: 'comment', component: './Chat' },
  // { name: '聊天测试', icon: 'comment', path: '/chat-1', component: './chatDemo' },
  { path: '/setconfig', name: '修改配置文件', icon: 'form', component: './YamlEditor' },
  { path: '/manage',
    name: '权限管理',
    icon: 'crown',
    routes: [
      { path: '/manage', redirect: '/manage/blacklist' ,component: './TBD' },
      { path: '/manage/blacklist', name: '黑名单管理', component: './TBD' },
      { path: '/manage/whitelist', name: '白名单管理', component: './TBD' },
    ],
  },
  { path: '/setup', name: '配置服务端', icon: 'setting', component: './TBD',
    routes: [
      { path: '/setup/update', name: '更新服务端', component: './TBD' },
    ],
  },
  { name: '关于', icon: 'infoCircle', path: '/about', component: './About' },
  { name: 'Eridanus文档', icon: 'file', path: 'https://eridanus-doc.netlify.app/' },
  { path: '/', redirect: '/dashboard' },
  { path: '*', component: './404' },
];
