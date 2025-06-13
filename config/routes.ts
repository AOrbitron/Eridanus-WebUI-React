import { Component } from 'react';

export default [
  {
    path: '/user',
    routes: [{ name: '登录', path: '/user/login', component: './User/Login' }],
  },
  { path: '/dashboard', name: '总览', icon: 'compass', component: './Dashboard' },
  { path: '/chat', name: '聊天', icon: 'comment', component: './Chat' },
  { path: '/configEditor', name: '修改配置文件', icon: 'form', component: './YamlEditor' },
  {
    path: '/userManager',
    name: '用户管理',
    icon: 'crown',
    component: './userManager',
  },
  {
    path: '/pluginsMarket',
    name: '插件市场',
    icon: 'appstoreAdd',
    component: './TBD',
    hideInMenu:true
  },
  {
    path: '/webuiSettings',
    name: 'WebUI设置',
    icon: 'setting',
    component: './testPage',
    hideInMenu:true

  },
  // {
  //   path: '/setup', name: '配置服务端', icon: 'setting', component: './TBD',
  //   routes: [
  //     { path: '/setup/update', name: '更新服务端', component: './TBD' },
  //   ],
  // },
  { name: '关于', icon: 'infoCircle', path: '/about', component: './About' },
  { name: 'Eridanus文档', icon: 'file', path: 'https://eridanus.netlify.app/' },
  { path: '/', redirect: '/dashboard' },
  { path: '*', component: './404' },
];
