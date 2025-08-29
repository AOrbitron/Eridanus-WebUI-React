// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

// const requestURL = 'http://192.168.195.128:5007';
// const requestURL = 'http://192.168.195.41:5007';
// const requestURL = 'http://localhost:5007';
const requestURL = '';

//获取当前webui用户信息
export async function getCurrentUser() {
  return request<API.Profile>(`${requestURL}/api/profile`, {
    method: 'GET',
  });
}

//修改webui用户登录信息
export async function updateProfile(body: API.UpdateProfileParams) {
  return request<API.CommonResult>(`${requestURL}/api/profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}

/** 退出登录接口 POST /api/logout */
export async function userLogout(options?: { [key: string]: any }) {
  return request<API.LogoutResult>(`${requestURL}/api/logout`, {
    method: 'GET',
    ...(options || {}),
  });
}

/** 登录接口 POST /api/login */
export async function userLogin(body: API.LoginParams, options?: { [key: string]: any }) {
  return request<API.LoginResult>(`${requestURL}/api/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 添加用户 POST /api/usermgr/addUser */
export async function addUser(body: API.UserItem, options?: { [key: string]: any }) {
  return request<API.CommonResult>(`${requestURL}/api/usermgr/addUser`, {
    method: 'POST',
    data: body,
    ...(options || {}),
  });
}

/** 修改用户信息 POST /api/usermgr/modUser */
export async function modUser(body: API.UserItem, options?: { [key: string]: any }) {
  return request<API.CommonResult>(`${requestURL}/api/usermgr/modUser`, {
    method: 'POST',
    data: body,
    ...(options || {}),
  });
}

/** 删除用户 POST /api/usermgr/delUser */
export async function delUser(body: any, options?: { [key: string]: any }) {
  return request<API.CommonResult>(`${requestURL}/api/usermgr/delUser`, {
    method: 'POST',
    data: body,
    ...(options || {}),
  });
}

/** 获取用户列表 GET /api/usermgr/userlist */
export async function getUserList(
  params?: { [key: string]: any },
  options?: { [key: string]: any },
) {
  return request<API.UserList>(`${requestURL}/api/usermgr/userList`, {
    method: 'GET',
    params,
    ...(options || {}),
  });
}

/** 获取服务器基本信息 GET /api/dashboard/basicInfo */
export async function getBasicInfo(
  params?: { [key: string]: any },
  options?: { [key: string]: any },
) {
  return request<API.BasicInfo>(`${requestURL}/api/dashboard/basicInfo`, {
    method: 'GET',
    params,
    ...(options || {}),
  });
}

export async function getMusicInfo(body: { type: string; id?: string | number },options?: { [key: string]: any },) {
  return request<API.MusicInfo>(`${requestURL}/api/chat/music`, {
    method: 'POST',
    data: body,
    ...(options || {}),
  });
}

export async function getChatHistory(params?: { [key: string]: any },options?: { [key: string]: any }) {
  return request<any>(`${requestURL}/api/chat/get_history`, {
    method: 'GET',
    params,
    ...(options || {}),
  });
}
  export async function delChatHistory(body:any) {
    return request<any>(`${requestURL}/api/chat/del_history`, {
      method: 'POST',
      data: body,
    });
}

/** 获取日志文件列表 GET /api/diagnosis */
export async function getLogFiles(options?: { [key: string]: any }) {
  return request<any>(`${requestURL}/api/diagnosis`, {
    method: 'GET',
    ...(options || {}),
  });
}

/** 获取日志内容 POST /api/diagnosis */
export async function getLogContent(body: { file: string }, options?: { [key: string]: any }) {
  return request<any>(`${requestURL}/api/diagnosis`, {
    method: 'POST',
    data: body,
    ...(options || {}),
  });
}

/** 获取YAML文件列表 GET /api/files */
export async function getYamlFiles(options?: { [key: string]: any }) {
  return request<any>(`${requestURL}/api/files`, {
    method: 'GET',
    ...(options || {}),
  });
}

/** 加载YAML文件 GET /api/load/:fileName */
export async function loadYamlFile(fileName: string, options?: { [key: string]: any }) {
  return request<any>(`${requestURL}/api/load/${fileName}`, {
    method: 'GET',
    ...(options || {}),
  });
}

/** 保存YAML文件 POST /api/save/:fileName */
export async function saveYamlFile(fileName: string, body: any, options?: { [key: string]: any }) {
  return request<any>(`${requestURL}/api/save/${fileName}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
    ...(options || {}),
  });
}

/** 搜索YAML键名 POST /api/search_yaml */
export async function searchYamlKeys(keyword: string, options?: { [key: string]: any }) {
  return request<any>(`${requestURL}/api/search_yaml`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: { search: keyword },
    ...(options || {}),
  });
}

/** 重启服务端 GET /api/tools/restart */
export async function restartServer(options?: { [key: string]: any }) {
  return request<API.CommonResult>(`${requestURL}/api/tools/restart`, {
    method: 'GET',
    ...(options || {}),
  });
}

/** 导出配置文件 GET /api/tools/export_yaml */
export async function exportConfig(options?: { [key: string]: any }) {
  return request<any>(`${requestURL}/api/tools/export_yaml`, {
    method: 'GET',
    ...(options || {}),
  });
}

/** 上传文件 POST /api/chat/uploadFile */
export async function uploadFiles(body: FormData, options?: { [key: string]: any }) {
  return request<any>(`${requestURL}/api/chat/uploadFile`, {
    method: 'POST',
    data: body,
    ...(options || {}),
  });
}

/** 导入配置文件 POST /api/tools/import_yaml */
export async function importConfig(fileName: string, options?: { [key: string]: any }) {
  return request<any>(`${requestURL}/api/tools/import_yaml`, {
    method: 'POST',
    data: { file: fileName },
    ...(options || {}),
  });
}
