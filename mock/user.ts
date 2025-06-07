//这个是本地预览的时候伪装返回的API

const testToken = '114514'


import { Request, Response } from 'express';
import { random } from 'lodash';
const waitTime = (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};


const { ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION } = process.env;

/**
 * 当前用户的权限，如果为空代表没登录
 */
let access = ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION === 'site' ? 'admin' : '';

const getAccess = () => {
  return access;
};

// 代码中会兼容本地 service mock 以及部署站点的静态数据
export default {

  'GET /api/files': (req: Request, res: Response) => {
    if (!getAccess()) {
      res.status(400).send({
        error: 'Unauthorized',
      });
      return;
    }
    res.send({
      files: [
        "dev_test.yaml",
        "dev_test.yaml",
        "dev_test.yaml",
        "dev_test.yaml",
        "dev_test.yaml",
        "dev_test.yaml",
        "dev_test.yaml",
      ]
    });
  },


  'GET /api/profile': (req: Request, res: Response) => {
    if (!getAccess()) {
      res.send({
        error: 'Unauthorized',
      });
      return;
    }
    res.send({
      account: 'Eridanus',
    });
  },

  'POST /api/profile': (req: Request, res: Response) => {
    if (!getAccess()) {
      res.send({
        error: 'Unauthorized',
      });
      return;
    }
    res.send({
      message: 'Success',
    });
  },

  'POST /api/login': async (req: Request, res: Response) => {
    const { password, account } = req.body;
    await waitTime(200);
    if (password === 'f6074ac37e2f8825367d9ae118a523abf16924a86414242ae921466db1e84583' && account === 'eridanus') {
      res.send({
        message: "登录成功",
        auth_token: testToken
      });
      access = 'admin';
      return;
    }
    res.send({
      error: 'Failed',
    });
  },

  'GET /api/logout': (req: Request, res: Response) => {
    if (access) {
      access = '';
      res.send({ message: "Success" });
    } else {
      res.send({ error: 'Failed' });
    }
  },

  'GET /api/dashboard/basicInfo': (req: Request, res: Response) => {
    if (!getAccess()) {
      res.send({
        error: 'Unauthorized',
      });
      return;
    }
    res.send({
        "systemInfo": {
            "cpuUsage": Number(random(20, 80, true).toFixed(1)),
            "totalMemory": 17179869184,
            "usedMemory": random(8589934592, 10179869184),
            "totalDisk": 549755813888,
            "usedDisk": 322122547200
        },
        "botInfo": {
            "totalUsers": 16384,
            "totalFriends": 1024,
            "totalGroups": 2048
        },
        "ranks": {
            "tokenRank": [
                {
                    "user_id": 12345,
                    "ai_token_record": 66666,
                },
                {
                  "user_id": 13534,
                  "ai_token_record": 666,
              },

            ],
            "signInRank": [
                {
                    "userId": 567,
                    "days": 3
                },
                {
                    "userId": 87,
                    "days": 1
                },
            ]
        }
    })
  },

  'GET /api/load/dev_test.yaml': async (req: Request, res: Response) => {
    await waitTime(200);
    if (!getAccess()) {
      res.send({
        error: 'Unauthorized',
      });
      return;
    }
    res.send({
      "comments": {
        "bili_dynamic": "\u4e0b\u9762\u7684\u8bbe\u7f6e\u6682\u4e0d\u53ef\u7528\uff0c\u8bf7\u6682\u65f6\u4e0d\u8981\u4fee\u6539",
        "bili_dynamic.draw_type": "1\u4ee3\u8868\u7528playwright\uff08\u9700\u8981\u5b89\u88c5\u5176\u4f59\u7ec4\u4ef6\uff09\uff1b2\u4ee3\u8868\u672c\u5730Pillow\u7ed8\u56fe\uff08\u6709\u53ef\u80fd\u51fa\u9519\uff09",
        "bili_dynamic.dynamic_interval": "\u52a8\u6001\u63a8\u9001\u95f4\u9694\u65f6\u95f4\uff0c\u5355\u4f4d\u4e3a\u79d2",
        "bili_dynamic.enable": "\u662f\u5426\u5f00\u542f\u52a8\u6001\u63a8\u9001\u529f\u80fd",
        "bili_dynamic.is_QQ_chek": "\u662f\u5426\u68c0\u6d4bqq\u5c0f\u7a0b\u5e8f\u91cc\u7684\u89c6\u9891\u94fe\u63a5",
        "bili_dynamic.screen_shot_mode": "mobile\u4e3a\u79fb\u52a8\u7aef\u622a\u56fe\uff0cpc\u4e3aPC\u7aef\u622a\u56fe",
        "\u6d41\u5a92\u4f53.asmr.download_audio_level": "\u4e0b\u8f7d\u97f3\u9891\u6240\u9700\u6743\u9650\u7b49\u7ea7",
        "\u6d41\u5a92\u4f53.youtube.download_audio_level": "\u4e0b\u8f7d\u97f3\u9891\u6240\u9700\u6743\u9650\u7b49\u7ea7",
        "\u6d41\u5a92\u4f53.youtube.download_video_level": "\u4e0b\u8f7d\u89c6\u9891\u6240\u9700\u6743\u9650\u7b49\u7ea7",
        "\u7f51\u6613\u4e91\u5361\u7247": "\u7ed8\u5236\u7f51\u6613\u4e91\u6b4c\u66f2\u5206\u4eab\u5361\u7247",
        "\u7f51\u6613\u4e91\u5361\u7247.\u89e3\u6790\u81ea\u5e26\u97f3\u9891\u4e0b\u8f7durl": "\u6d89\u53ca\u4ed8\u8d39\u97f3\u4e50\u7248\u6743\u95ee\u9898\uff0c\u53ea\u80fd\u4ee5\u6587\u4ef6\u5f62\u5f0f\u53d1\u9001\u4e86,\u4e0d\u5141\u8bb8\u8fdb\u884c\u4f20\u64ad\u3001\u9500\u552e\u7b49\u5546\u4e1a\u6d3b\u52a8!!"
      },
      "data": {
        "bili_dynamic": {
          "draw_type": 2,
          "dynamic_interval": 300,
          "enable": true,
          "is_QQ_chek": true,
          "screen_shot_mode": "mobile"
        },
        "\u6d41\u5a92\u4f53": {
          "asmr": {
            "download_audio_level": 0
          },
          "youtube": {
            "download_audio_level": 0,
            "download_video_level": 30
          }
        },
        "\u7f51\u6613\u4e91\u5361\u7247": {
          "enable": true,
          "\u89e3\u6790\u81ea\u5e26\u97f3\u9891\u4e0b\u8f7durl": false
        }
      },
      "order": {
        "": [
          "bili_dynamic",
          "\u7f51\u6613\u4e91\u5361\u7247",
          "\u6d41\u5a92\u4f53"
        ],
        "bili_dynamic": [
          "enable",
          "dynamic_interval",
          "screen_shot_mode",
          "draw_type",
          "is_QQ_chek"
        ],
        "\u6d41\u5a92\u4f53": [
          "youtube",
          "asmr"
        ],
        "\u6d41\u5a92\u4f53.asmr": [
          "download_audio_level"
        ],
        "\u6d41\u5a92\u4f53.youtube": [
          "download_audio_level",
          "download_video_level"
        ],
        "\u7f51\u6613\u4e91\u5361\u7247": [
          "enable",
          "\u89e3\u6790\u81ea\u5e26\u97f3\u9891\u4e0b\u8f7durl"
        ]
      }
    }

    );
  },


};
