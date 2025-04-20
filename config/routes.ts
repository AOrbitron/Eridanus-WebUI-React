export default [
  {
    path: '/user',
    layout: false,
    routes: [{ name: '登录', path: '/user/login', component: './User/Login' }],
  },
  { path: '/welcome', name: '总览', icon: 'compass', component: './Welcome' },
  { path: '/chat', name: '聊天', icon: 'comment', component: './Chat' },
  { path: '/setconfig', name: '修改配置文件', icon: 'form', component: './YamlEditor' },
  { path: '/manage',
    name: '权限管理',
    icon: 'crown',
    component: './Chat',
    routes: [
      { path: '/manage/blacklist', name: '黑名单管理', component: './Chat' },
      { path: '/manage/whitelist', name: '白名单管理', component: './Chat' },
    ],
  },
  { path: '/setup', name: '配置服务端', icon: 'setting', component: './Chat',
    routes: [
      { path: '/setup/initialize', name: '初始化服务端' , redirect: './Chat',

      },
      { path: '/setup/update', name: '更新服务端', component: './Chat' },
    ],
  },
  { name: '关于', icon: 'infoCircle', path: '/about', component: './About' },
  { name: 'Eridanus文档', icon: 'fileUnknown', path: 'https://eridanus-doc.netlify.app/' },
  { path: '/', redirect: '/welcome' },
  { path: '*', layout: false, component: './404' },
];
