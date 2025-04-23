// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 获取当前用户 GET /api/profile */
export async function currentUser() {
  const token = localStorage.getItem('auth');
  return request<API.Profile>('/api/profile', {
    method: 'GET',
  });
}

export async function updateProfile(body: API.UpdateProfileProfiles) {
  return request<{
  }>('/api/profile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}

/** 退出登录接口 POST /api/logout */
export async function accountLogout(body:API.LogoutParams,options?: { [key: string]: any }) {
  return request<API.LogoutResult>('/api/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 登录接口 POST /api/login */
export async function Login(body: API.LoginParams, options?: { [key: string]: any }) {
  return request<API.LoginResult>('/api/login/account', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}


/** 获取规则列表 GET /api/rule */
// export async function rule(
//   params: {
//     // query
//     /** 当前的页码 */
//     current?: number;
//     /** 页面的容量 */
//     pageSize?: number;
//   },
//   options?: { [key: string]: any },
// ) {
//   return request<API.RuleList>('/api/rule', {
//     method: 'GET',
//     params: {
//       ...params,
//     },
//     ...(options || {}),
//   });
// }

/** 更新规则 PUT /api/rule */
// export async function updateRule(options?: { [key: string]: any }) {
//   return request<API.RuleListItem>('/api/rule', {
//     method: 'POST',
//     data:{
//       method: 'update',
//       ...(options || {}),
//     }
//   });
// }

/** 新建规则 POST /api/rule */
// export async function addRule(options?: { [key: string]: any }) {
//   return request<API.RuleListItem>('/api/rule', {
//     method: 'POST',
//     data:{
//       method: 'post',
//       ...(options || {}),
//     }
//   });
// }

/** 删除规则 DELETE /api/rule */
export async function removeRule(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/rule', {
    method: 'POST',
    data:{
      method: 'delete',
      ...(options || {}),
    }
  });
}
