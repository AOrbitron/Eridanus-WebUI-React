// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 获取当前用户 GET /api/profile */
export async function getCurrentUser() {
  return request<API.Profile>('/api/profile', {
    method: 'GET',
  });
}
//修改用户登录信息
export async function updateProfile(body: API.UpdateProfileParams) {
  return request<API.CommonResult>('/api/profile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}

//修改用户登录信息
export async function file2b64(body: string) {
  return request<API.file2b64Result>('/api/file2base64', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}

/** 退出登录接口 POST /api/logout */
export async function userLogout(options?: { [key: string]: any }) {
  return request<API.LogoutResult>('/api/logout', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 登录接口 POST /api/login */
export async function userLogin(body: API.LoginParams, options?: { [key: string]: any }) {
  return request<API.LoginResult>('/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

