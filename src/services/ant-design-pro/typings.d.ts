// @ts-ignore
/* eslint-disable */
//需要特定值或者格式的API，集中在这里处理
declare namespace API {
  //系统信息
  type systemInfo = {
    OS: string; // 操作系统
    cpuUsage: number; // CPU使用率
    totalMemory: number; // 总内存
    usedMemory: number; // 已用内存
    totalDisk: number; // 磁盘(当前分区)总容量
    usedDisk: number; // 磁盘(当前分区)已用容量
  };
//机器人信息
  type botInfo = {
    botName: string; // 机器人名称
    totalUsers: number; // 用户总数
    totalFriends: number; // 好友总数
    totalGroups: number; // 群总数
  };
  //基本信息
  type BasicInfo = {
    //复用到API跟页面渲染
    loading?: boolean;
    systemInfo?: systemInfo;
    botInfo?: botInfo;
    ranks?: {
      tokenRank: Array<{
        //token排行榜前10
        user_id: number;
        ai_token_record: number;
      }>;
      signInRank: Array<{
        //签到排行榜前10
        user_id: number;
        days: number;
      }>;
    };
    error?: string;
  };
  //webUI用户信息
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
  // type file2b64Result = {
  //   base64?: string;
  //   error?: string;
  // };

  //登录参数
  type LoginParams = {
    account?: string;
    password?: string;
  };

  //登出参数
  type LogoutParams = {
    auth?: string;
  };

  type UpdateProfileParams = {
    account?: string;
    password?: string;
  };

  /**
   发来的json示例
  {
  'user_id': 114514,
   'nickname': '主人',
   'card': '00000',
   'sex': '0',
   'age': 0,
   'city': '通辽',
   'permission': 9999,
   'signed_days': '["2025-05-15"]',
   'registration_date': '2025-05-08',
   'ai_token_record': 2333,
   'user_portrait': '24岁是学生',
   'portrait_update_time': '2025-05-15T22:31:41.289849'
   }
  */

  type UserItem = {
    user_id: number; // 用户id
    nickname: string; // 昵称
    card: string; // ?
    sex: string; // 性别
    age: number; // 年龄
    city: string; // 城市
    permission: string; // 权限等级
    signed_days: Array<string>; // 签到天数
    registration_date: string; // 注册日期
    ai_token_record: number; // token统计
    user_portrait: string; // 用户画像
    portrait_update_time: string; // 画像更新时间
  };

  //API返回的用户列表
  type UserList = {
    data: UserItem[];
    /** 列表的内容总数 */
    total: number;
    success: boolean;
    pageSize: number;
    current: number;
  };
}
