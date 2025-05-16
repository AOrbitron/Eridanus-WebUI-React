//这个是本地预览的时候伪装返回的API

const testToken = 'vu8iOCZiJDYCokogboo6S3UXop6YaT5Z5jLp1e4PDiU='


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
        message: "Success",
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

  'POST /api/file2base64': (req: Request, res: Response) => {
    if (access) {
      access = '';
      res.send({ base64: "data:image/x-icon;base64,AAABAAEAICAAAAEAIACoEAAAFgAAACgAAAAgAAAAQAAAAAEAIAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAACPdYAAjXR+BZ2CjiSbfY4cztORAB4ACwL///8AfGx4Ca+hrD7Gu8ac1s7W087DzcLKwMqw1s7W5uHc4/fa1Nzw5ODn+dLK0s66q7eTuKGxnc7EzaXd2N+/vbG8lb6wvLHGvMWNzMPMeMO5wkS2qrUhjnyPBJmHmQD///8A+fn6AJJ2ggCNcn8bn4OMg6aOicGciIRz0srSldbQ147c192r29Tb7OHa4f/w7/T/6ubt/+rn7P/n4ej/6OTq//Dv9P/u7fL/7+3y/+jk6v/i2eH/5uHo/+jk6//d1t7/4t3k/+Xh6P/f2N/+6+jt8tPK082ei5kprJmcAOjh6QC1pbMAsJWiAP/v8gAGABUCmYZ3fZ6Lfv7NxMr/497l/+ro7v/f19//5+Dn/+/w9f/v7/X/497m/+Pc5f/h1uD/6+rw//Dy9//w8vf/7u/0/+be5//b0tv/5uPq/+fi6f/r5+3/8O/0/9jQ2P/Ow8j/uqmk/KKLeqank5U/zcHNP7amtBOpj5xCu6Gwh62Vnoech4W3moOB/5iCg/+4p63/39fg/+La4v/p4+r/7e3y/+zt8//UyNP/187b/97X4v/k3+f/6env/+jo7v/j4un/2dDa/9nP2f/r6/H/7Orx/+jh6P/s6/L/39zi/6CLhf+YgHD/pZKB/66ejuDEt72XwLG+a7CYpHq6pKbCqZOE/52Fd/+chHb/oYZ8/9LFx//i2OL/2c7X/9TL1//f2uT/2tLd/97Z5f/u8Pr/5+fx/+Dd5//Vytf/3Nfi/+Hf6v/a1N//3Nji/+Xj6//m4un/4d3l/93W4P/WzNj/uKuq/56Efv+mkY//ubKn/7Syqdazpqwzo5SMKLGkjtCqloX/rJWC/6GJeP+5npL/xrKx/7ujrf/RxtH/5OLv/+bm8v/t7vj/8fP9//Hz/f/x8/3/8PL8/+3t+P/v8fv/7vD6/93b5v/g3er/4Nvn/93V4f/o6PL/7e75/9HJ0/+nk4r/qpOK/6ycnP/Gwr//z8jM9cC0u1i0tqiwtLCh/7+vsf+zpI//oox9/7edlP/Ns6P/tpiS/9LGzv/x9P7/8PH8//L0/v/x8/3/8fP9//Hz/f/x9P3/8vT+/+3v+f/Gu8D/xrrA/+3u+f/x9P7/8fL9//Hz/f/z9f//19PY/6qWgf+hjH//r5ub/7Svqf/YzdX/1czTwLy3svzNw8j/wK+y/52Nf/+omIf/v6aZ/7+kmP/Fq57/ybm7//Dy/f/t7/n/6+v0/+/w+v/x8/3/8fT9/+/x+//x8/3/5uby/8Cwrv/Twr7/7u73//L0/v/x9P3/8fP9//L1///OydL/qZeK/56MgP+qlZf/r5Wd/8+/yf/Zz9j4zsDD/9HDz/+tm6H/opqS/7uyrf/DrKv/tpeZ/7+jnf/Grqb/zMHH/9LCvP/MvLv/29fi/+7v+//m4/X/3NTs/8K1zf/Ty+L/zsTQ/72in//It7r/5ODu/+vr9v/t7vj/39zn/8Kyvv+0qab/o5eS/62emP/AsLP/zb3F/Mi7xpe6qK//tqSr/66fnP+tn6T/08vQ/8Cos/+7naX/sZOY/7eak//LsqT/y7Kk/7mlqv++qrT/u6Ou/7+nvP/Aq83/iXGR/6mWtv/Ht9j/wrC9/8Kpn/+ymZz/sJij/76psv+6oan/uZ2n/7ihqP+5rbL/vcOx/768s/+xnJ3eo4+WKLmxrf+8va//vry2/7ypt//Ux9D/yrjC/8awuv+ojZT/wKif/9rEs/+8n5j/r4yO/6qHi/+viYz/t5KS/3xdaf9nTGP/c1ht/3xgd/+Te5P/wKml/9C4qf+pjIz/uJqh/7uepP+2maP/u6Gr/87Cy/+7u7X/vsS1/6uZmO6cgoJA0dDH/7/Ftv/Ev8D/zL/I/9bI0v/c0dr/zrrD/6+Sl//Rv7X/0Lux/62Lj/+4k5X/tZGT/7GQlv/AqK//qp2p/7u0x//CtNH/taLB/4hug/+vkY//3Ma3/8uyp/+7n6P/tZee/6+Qm//Brbj/2MvW/8q+x/+vraX/sqan/LSjpWfBu7j3sKeh/8W6t//a0tj/18rW/8i5xv+9prL/wamt/+DTzf/Pvrv/tJOZ/7GQl//It8H/4t/p/+7w+v/z9v//8/X//+fm8//Xzef/warH/76goP/cyr7/2MO2/76kpP+0maP/w624/7ehrv/CsL3/3NPe/7i4sv/Bur/9yLzIb6iepXLAtbryxbu6/+Pg4v/k3ef/0MHO/8q7xv/QxMn/2s/S/9fKzf+ykpz/wbC//+zu+//y9P7/8PL7/97e8f/s7vr/8vX+/+rq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" });
    } else {
      res.send({ error: 'Unauthorized' });
    }
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
