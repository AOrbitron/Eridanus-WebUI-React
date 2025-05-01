// @ts-ignore
/* eslint-disable */
//需要特定值或者格式的API，集中在这里处理
declare namespace API {
  //api/profile
  type Profile = {
    account?: string;
    error?: string;
  };
  //通用返回值
  type CommonResult = {
    message?: string;
    error?: string;
  };
  //api/login
  type LoginResult = {
    message?: string;
    auth_token?: string;
    error?: string;
  };
  //api/logout
  type LogoutResult = {
    message?: string;
    error?: string;
  };
  //api/clone
  type CloneResult = {
    message?: string;
    error?: string;
  };
  //api/file2base64
  type file2b64Result = {
    base64?: string;
    error?: string;
  };

  //登录参数
  type LoginParams = {
    account?: string;
    password?: string;
  };

  //登出参数
  type LogoutParams = {
    auth?: string;
  };

  type UpdateProfileProfiles = {
    account?: string;
    password?: string;
  };


  type ErrorResponse = {
    /** 业务约定的错误码 */
    errorCode: string;
    /** 业务上的错误信息 */
    errorMessage?: string;
    /** 业务上的请求是否成功 */
    success?: boolean;
  };

  type NoticeIconList = {
    data?: NoticeIconItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type NoticeIconItemType = 'notification' | 'message' | 'event';

  type NoticeIconItem = {
    id?: string;
    extra?: string;
    key?: string;
    read?: boolean;
    avatar?: string;
    title?: string;
    status?: string;
    datetime?: string;
    description?: string;
    type?: NoticeIconItemType;
  };
}
