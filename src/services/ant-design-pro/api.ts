// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

const requestURL = '';

//本地调试用
// const requestURL = 'http://192.168.195.41:5007';

//获取当前用户信息
export async function getCurrentUser() {
  return request<API.Profile>(`${requestURL}/api/profile`, {
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

//文件转b64接口（日后考虑通过send_staicfile发送）
export async function file2b64(body: string) {
  return request<API.file2b64Result>(`${requestURL}/api/file2base64`, {
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
  return request<API.LoginResult>(`${requestURL}/api/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

