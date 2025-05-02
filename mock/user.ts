//这个是本地预览的时候伪装返回的API

import { Request, Response } from 'express';
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
        "fake_dev_test_2.yaml",
        "fake_dev_test_3.yaml",
        "fake_dev_test_4.yaml",
        "fake_dev_test_5.yaml",
        "fake_dev_test_6.yaml",
        "fake_dev_test_7.yaml",
        "fake_dev_test_8.yaml",
        "fake_dev_test_9.yaml",
        "fake_dev_test_10.yaml",
        "fake_dev_test_11.yaml",
        "fake_dev_test_12.yaml",
        "fake_dev_test_13.yaml",
        "fake_dev_test_14.yaml",
        "fake_dev_test_15.yaml",
        "fake_dev_test_16.yaml",
        "fake_dev_test_17.yaml",
        "fake_dev_test_18.yaml",
        "fake_dev_test_19.yaml",
        "fake_dev_test_20.yaml",
        "fake_dev_test_21.yaml",
        "fake_dev_test_22.yaml",
        "fake_dev_test_23.yaml",
        "fake_dev_test_24.yaml",
        "fake_dev_test_25.yaml",
        "fake_dev_test_26.yaml",
        "fake_dev_test_27.yaml",
        "fake_dev_test_28.yaml",
        "fake_dev_test_29.yaml",
        "fake_dev_test_30.yaml",
        "fake_dev_test_31.yaml",
        "fake_dev_test_32.yaml",
        "fake_dev_test_33.yaml",
        "fake_dev_test_34.yaml",
        "fake_dev_test_35.yaml",
        "fake_dev_test_36.yaml",
        "fake_dev_test_37.yaml",
        "fake_dev_test_38.yaml",
        "fake_dev_test_39.yaml",
        "fake_dev_test_40.yaml",
        "fake_dev_test_41.yaml",
        "fake_dev_test_42.yaml",
      ]
    });
  },


  'GET /api/profile': (req: Request, res: Response) => {
    if (!getAccess()) {
      res.status(400).send({
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
      res.status(400).send({
        error: 'Unauthorized',
      });
      return;
    }
    res.send({
      message: 'Success',
    });
    access = '';
  },

  'POST /api/login': async (req: Request, res: Response) => {
    const { password, account } = req.body;
    await waitTime(200);
    if (password === 'f6074ac37e2f8825367d9ae118a523abf16924a86414242ae921466db1e84583' && account === 'eridanus') {
      res.send({
        message: "Success",
        auth_token: "114514"
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


  'GET /api/load/dev_test.yaml': async (req: Request, res: Response) => {
    await waitTime(200);
    if (!getAccess()) {
      res.status(400).send({
        error: 'Unauthorized',
      });
      return;
    }
    res.send({
      "comments": {
        "JMComic": "\u7981\u6f2b\u76f8\u5173\u529f\u80fd\u8bbe\u7f6e",
        "JMComic.autoClearPDF": "\u4e0b\u8f7d\u540e\u81ea\u52a8\u6e05\u9664pdf",
        "JMComic.previewPages": "\u9a8c\u8f66\u9884\u89c8\u9875\u6570",
        "JMComic.savePath": "\u4e0b\u8f7d\u4e3apdf\u7684\u9ed8\u8ba4\u4fdd\u5b58\u8def\u5f84",
        "acg_information.bangumi_query_prefix": "\u756a\u5267\u67e5\u8be2\u7c7b\u547d\u4ee4\u524d\u7f00",
        "ai\u7ed8\u753b.no_nsfw_groups": "\u7981\u6b62\u8272\u56fe\u7684\u7fa4\u53f7",
        "ai\u7ed8\u753b.sd\u56fe\u7247\u662f\u5426\u4fdd\u5b58\u5230\u751f\u56fe\u7aef": "\u662f\u5426\u5c06\u751f\u6210\u7684\u56fe\u7247\u4fdd\u5b58\u5728webui\u7684outputs\u91cc",
        "ai\u7ed8\u753b.sd\u753b\u56fe\u9ed8\u8ba4\u5206\u8fa8\u7387": "\u5bbd,\u9ad8\uff08\u522b\u5e26\u7a7a\u683c\uff09",
        "ai\u7ed8\u753b.sd\u961f\u5217\u957f\u5ea6\u9650\u5236": "\u9632\u6b62\u6709\u4eba\u5237\u7ed8\u56fe\u6307\u4ee4\u3002",
        "ai\u7ed8\u753b.\u5176\u4ed6\u9ed8\u8ba4\u7ed8\u56fe\u53c2\u6570": "\u5404\u53c2\u6570\u89c1\u6587\u6863https://eridanus-doc.netlify.app/docs/%E6%8B%93%E5%B1%95%E5%8A%9F%E8%83%BD/ai%E7%BB%98%E7%94%BB",
        "ai\u7ed8\u753b.\u53cd\u63a8\u548c\u5ba1\u6838\u4f7f\u7528\u6a21\u578b": "\u53ef\u586b\u7684\u9009\u9879\u89c1\u6587\u6863https://eridanus-doc.netlify.app/docs/\u6838\u5fc3\u529f\u80fd/ai\u5bf9\u8bdd/",
        "api_implements": "\u82b1\u91cc\u80e1\u54e8",
        "api_implements.nudge": "\u6233\u4e00\u6233\u8bbe\u7f6e\u3002",
        "api_implements.nudge.counter_probability": "\u53cd\u51fb\u6982\u7387",
        "api_implements.nudge.replylist": "\u5982\u679c\u5f00\u542faiReplyCore\uff0c\u5c06\u4e0d\u4f7f\u7528\u6b64\u5904\u914d\u7f6e\u56de\u590d",
        "asmr.with_file": "\u662f\u5426\u5408\u5e76\u5e76\u53d1\u9001\u97f3\u9891\u6587\u4ef6",
        "asmr.with_url": "\u662f\u5426\u9644\u5e26\u539f\u59cb\u97f3\u9891url",
        "basic_plugin.setu.gray_layer": "\u662f\u5426\u5f00\u542f\u7070\u5ea6\u56fe\u529f\u80fd",
        "basic_plugin.tarot.lock": "\u662f\u5426\u5f00\u542f\u5361\u7247\u9501\u5b9a\u529f\u80fd",
        "basic_plugin.tarot.mode": "\u724c\u9762\u3002\u53ef\u586b blueArchive,bilibili,AbstractImages",
        "basic_plugin.\u641c\u56fe.soutu_bot": "\u641c\u672c\u5b50",
        "basic_plugin.\u641c\u56fe.\u805a\u5408\u641c\u56fe": "\u641c\u5355\u56fe",
        "bili_dynamic": "\u4e0b\u9762\u7684\u8bbe\u7f6e\u6682\u4e0d\u53ef\u7528\uff0c\u8bf7\u6682\u65f6\u4e0d\u8981\u4fee\u6539",
        "bili_dynamic.draw_type": "1\u4ee3\u8868\u7528playwright\uff08\u9700\u8981\u5b89\u88c5\u5176\u4f59\u7ec4\u4ef6\uff09\uff1b2\u4ee3\u8868\u672c\u5730Pillow\u7ed8\u56fe\uff08\u6709\u53ef\u80fd\u51fa\u9519\uff09",
        "bili_dynamic.dynamic_interval": "\u52a8\u6001\u63a8\u9001\u95f4\u9694\u65f6\u95f4\uff0c\u5355\u4f4d\u4e3a\u79d2",
        "bili_dynamic.enable": "\u662f\u5426\u5f00\u542f\u52a8\u6001\u63a8\u9001\u529f\u80fd",
        "bili_dynamic.is_QQ_chek": "\u662f\u5426\u68c0\u6d4bqq\u5c0f\u7a0b\u5e8f\u91cc\u7684\u89c6\u9891\u94fe\u63a5",
        "bili_dynamic.screen_shot_mode": "mobile\u4e3a\u79fb\u52a8\u7aef\u622a\u56fe\uff0cpc\u4e3aPC\u7aef\u622a\u56fe",
        "bot_config.group_handle_logic": "\u6a21\u5f0f\u3002\u53ef\u586b blacklist, whitelist\u3002blacklist\u4e0b\uff0c\u5c4f\u853d\u6307\u5b9a\u7fa4\uff0cwhitelist\u4e0b\uff0c\u53ea\u5904\u7406\u6307\u5b9a\u7fa4\u3002",
        "bot_config.group_handle_logic_operate_level": "\u62c9\u9ed1\u3001\u89e3\u9ed1\u7fa4\u6240\u9700\u64cd\u4f5c\u6743\u9650",
        "bot_config.user_handle_logic": "\u6a21\u5f0f\u3002\u53ef\u586b blacklist, whitelist\u3002blacklist\u4e0b\uff0c\u5c4f\u853d\u6307\u5b9a\u7528\u6237\uff0cwhitelist\u4e0b\uff0c\u53ea\u5904\u7406\u6307\u5b9a\u7528\u6237\u3002",
        "bot_config.user_handle_logic_operate_level": "\u62c9\u9ed1\u3001\u89e3\u9ed1\u7528\u6237\u6240\u9700\u64cd\u4f5c\u6743\u9650",
        "\u7f51\u6613\u4e91\u5361\u7247": "\u7ed8\u5236\u7f51\u6613\u4e91\u6b4c\u66f2\u5206\u4eab\u5361\u7247",
        "\u7f51\u6613\u4e91\u5361\u7247.\u89e3\u6790\u81ea\u5e26\u97f3\u9891\u4e0b\u8f7durl": "\u6d89\u53ca\u4ed8\u8d39\u97f3\u4e50\u7248\u6743\u95ee\u9898\uff0c\u53ea\u80fd\u4ee5\u6587\u4ef6\u5f62\u5f0f\u53d1\u9001\u4e86,\u4e0d\u5141\u8bb8\u8fdb\u884c\u4f20\u64ad\u3001\u9500\u552e\u7b49\u5546\u4e1a\u6d3b\u52a8!!"
      },
      "data": {
        "JMComic": {
          "autoClearPDF": true,
          "previewPages": "5565",
          "savePath": "data/pictures/benzi"
        },
        "acg_information": {
          "bangumi_query_prefix": "/"
        },
        "ai\u7ed8\u753b": {
          "no_nsfw_groups": [
            "333",
            "444",
            "333"
          ],
          "novel_ai\u753b\u56fe": false,
          "sd\u56fe\u7247\u662f\u5426\u4fdd\u5b58\u5230\u751f\u56fe\u7aef": true,
          "sd\u753b\u56fe": true,
          "sd\u753b\u56fe\u9ed8\u8ba4\u5206\u8fa8\u7387": "1024,1536",
          "sd\u91cd\u7ed8\u9ed8\u8ba4\u5206\u8fa8\u7387": "1064,1064",
          "sd\u961f\u5217\u957f\u5ea6\u9650\u5236": 6,
          "sd\u9ed8\u8ba4\u542f\u52a8\u6a21\u578b": "miaomiao_1_4.safetensors",
          "\u5176\u4ed6\u9ed8\u8ba4\u7ed8\u56fe\u53c2\u6570": [
            "--d 0.7",
            "--p {},rating:general, best quality, very aesthetic, absurdres",
            "--n blurry, lowres, error, film grain, scan artifacts, worst quality, bad quality, jpeg artifacts, very displeasing, chromatic aberration, logo, dated, signature, multiple views, gigantic breasts",
            "--steps 15",
            "--sampler Restart",
            "--scheduler Align Your Steps",
            "--nai-sampler k_euler_ancestral",
            "--nai-scheduler karras",
            "--cfg 6.5",
            "--nai-cfg 5"
          ],
          "\u53cd\u63a8\u548c\u5ba1\u6838\u4f7f\u7528\u6a21\u578b": "wd14-vit-v2-git"
        },
        "api_implements": {
          "nudge": {
            "counter_probability": 100,
            "replylist": [
              "666"
            ]
          }
        },
        "asmr": {
          "with_file": false,
          "with_url": false
        },
        "basic_plugin": {
          "setu": {
            "gray_layer": true,
            "r18mode": true
          },
          "tarot": {
            "lock": false,
            "mode": "blueArchive"
          },
          "\u641c\u56fe": {
            "soutu_bot": true,
            "\u805a\u5408\u641c\u56fe": true
          }
        },
        "bili_dynamic": {
          "draw_type": 2,
          "dynamic_interval": 300,
          "enable": true,
          "is_QQ_chek": true,
          "screen_shot_mode": "mobile"
        },
        "bot_config": {
          "group_handle_logic": "blacklist",
          "group_handle_logic_operate_level": 1000,
          "user_handle_logic": "blacklist",
          "user_handle_logic_operate_level": 1000,
          "\u7533\u8bf7bot\u597d\u53cb\u6240\u9700\u6743\u9650": 0,
          "\u9080\u8bf7bot\u52a0\u7fa4\u6240\u9700\u6743\u9650": 0
        },
        "\u62bd\u8c61\u68c0\u6d4b": {
          "doro\u64a4\u56de": true,
          "doro\u68c0\u6d4b": false,
          "doro\u7981\u8a00": true,
          "\u5976\u9f99\u64a4\u56de": true,
          "\u5976\u9f99\u68c0\u6d4b": false,
          "\u5976\u9f99\u7981\u8a00": true,
          "\u9a82doro": [
            "doro\u662f\u4f60\ud83d\udc34\uff1f\u8fd9\u4e48\u559c\u6b22\u53d1\u4f60\ud83d\udc34\u7684\u9057\u7167\uff1f",
            "\u7c89\u8272\u5976\u9f99",
            "\u5510"
          ],
          "\u9a82\u5976\u9f99": [
            "\u5976\u9f99\u662f\u4f60\u53e0\uff1f\u8fd9\u4e48\u559c\u6b22\u53d1\u5976\u9f99\uff1f"
          ]
        },
        "\u7f51\u6613\u4e91\u5361\u7247": {
          "enable": true,
          "\u89e3\u6790\u81ea\u5e26\u97f3\u9891\u4e0b\u8f7durl": false
        }
      },
      "order": {
        "": [
          "bot_config",
          "api_implements",
          "acg_information",
          "basic_plugin",
          "JMComic",
          "asmr",
          "bili_dynamic",
          "\u7f51\u6613\u4e91\u5361\u7247",
          "ai\u7ed8\u753b",
          "\u62bd\u8c61\u68c0\u6d4b"
        ],
        "JMComic": [
          "previewPages",
          "autoClearPDF",
          "savePath"
        ],
        "acg_information": [
          "bangumi_query_prefix"
        ],
        "ai\u7ed8\u753b": [
          "sd\u753b\u56fe",
          "sd\u9ed8\u8ba4\u542f\u52a8\u6a21\u578b",
          "\u53cd\u63a8\u548c\u5ba1\u6838\u4f7f\u7528\u6a21\u578b",
          "sd\u56fe\u7247\u662f\u5426\u4fdd\u5b58\u5230\u751f\u56fe\u7aef",
          "novel_ai\u753b\u56fe",
          "sd\u753b\u56fe\u9ed8\u8ba4\u5206\u8fa8\u7387",
          "sd\u91cd\u7ed8\u9ed8\u8ba4\u5206\u8fa8\u7387",
          "sd\u961f\u5217\u957f\u5ea6\u9650\u5236",
          "no_nsfw_groups",
          "\u5176\u4ed6\u9ed8\u8ba4\u7ed8\u56fe\u53c2\u6570"
        ],
        "api_implements": [
          "nudge"
        ],
        "api_implements.nudge": [
          "counter_probability",
          "replylist"
        ],
        "asmr": [
          "with_url",
          "with_file"
        ],
        "basic_plugin": [
          "setu",
          "tarot",
          "\u641c\u56fe"
        ],
        "basic_plugin.setu": [
          "r18mode",
          "gray_layer"
        ],
        "basic_plugin.tarot": [
          "lock",
          "mode"
        ],
        "basic_plugin.\u641c\u56fe": [
          "\u805a\u5408\u641c\u56fe",
          "soutu_bot"
        ],
        "bili_dynamic": [
          "enable",
          "dynamic_interval",
          "screen_shot_mode",
          "draw_type",
          "is_QQ_chek"
        ],
        "bot_config": [
          "user_handle_logic",
          "user_handle_logic_operate_level",
          "group_handle_logic",
          "group_handle_logic_operate_level",
          "\u9080\u8bf7bot\u52a0\u7fa4\u6240\u9700\u6743\u9650",
          "\u7533\u8bf7bot\u597d\u53cb\u6240\u9700\u6743\u9650"
        ],
        "\u62bd\u8c61\u68c0\u6d4b": [
          "\u5976\u9f99\u68c0\u6d4b",
          "\u5976\u9f99\u64a4\u56de",
          "\u5976\u9f99\u7981\u8a00",
          "\u9a82\u5976\u9f99",
          "doro\u68c0\u6d4b",
          "doro\u64a4\u56de",
          "doro\u7981\u8a00",
          "\u9a82doro"
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
