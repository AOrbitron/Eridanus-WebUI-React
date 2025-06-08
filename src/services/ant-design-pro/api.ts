// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

// const requestURL = 'http://192.168.195.41:5007';

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

/** 添加用户 POST /api/usermgr/adduser */
export async function addUser(body: API.UserItem, options?: { [key: string]: any }) {
  return request<API.CommonResult>(`${requestURL}/api/usermgr/adduser`, {
    method: 'POST',
    data: body,
    ...(options || {}),
  });
}

/** 修改用户信息 POST /api/usermgr/moduser */
export async function modUser(body: API.UserItem, options?: { [key: string]: any }) {
  return request<API.CommonResult>(`${requestURL}/api/usermgr/moduser`, {
    method: 'POST',
    data: body,
    ...(options || {}),
  });
}

/** 删除用户 POST /api/usermgr/deluser */
export async function delUser(body: any, options?: { [key: string]: any }) {
  return request<API.CommonResult>(`${requestURL}/api/usermgr/deluser`, {
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
