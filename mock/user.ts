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

  'POST /api/file2base64': (req: Request, res: Response) => {
    if (access) {
      access = '';
      res.send({ base64: "data:image/x-icon;base64,AAABAAEAICAAAAEAIACoEAAAFgAAACgAAAAgAAAAQAAAAAEAIAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAACPdYAAjXR+BZ2CjiSbfY4cztORAB4ACwL///8AfGx4Ca+hrD7Gu8ac1s7W087DzcLKwMqw1s7W5uHc4/fa1Nzw5ODn+dLK0s66q7eTuKGxnc7EzaXd2N+/vbG8lb6wvLHGvMWNzMPMeMO5wkS2qrUhjnyPBJmHmQD///8A+fn6AJJ2ggCNcn8bn4OMg6aOicGciIRz0srSldbQ147c192r29Tb7OHa4f/w7/T/6ubt/+rn7P/n4ej/6OTq//Dv9P/u7fL/7+3y/+jk6v/i2eH/5uHo/+jk6//d1t7/4t3k/+Xh6P/f2N/+6+jt8tPK082ei5kprJmcAOjh6QC1pbMAsJWiAP/v8gAGABUCmYZ3fZ6Lfv7NxMr/497l/+ro7v/f19//5+Dn/+/w9f/v7/X/497m/+Pc5f/h1uD/6+rw//Dy9//w8vf/7u/0/+be5//b0tv/5uPq/+fi6f/r5+3/8O/0/9jQ2P/Ow8j/uqmk/KKLeqank5U/zcHNP7amtBOpj5xCu6Gwh62Vnoech4W3moOB/5iCg/+4p63/39fg/+La4v/p4+r/7e3y/+zt8//UyNP/187b/97X4v/k3+f/6env/+jo7v/j4un/2dDa/9nP2f/r6/H/7Orx/+jh6P/s6/L/39zi/6CLhf+YgHD/pZKB/66ejuDEt72XwLG+a7CYpHq6pKbCqZOE/52Fd/+chHb/oYZ8/9LFx//i2OL/2c7X/9TL1//f2uT/2tLd/97Z5f/u8Pr/5+fx/+Dd5//Vytf/3Nfi/+Hf6v/a1N//3Nji/+Xj6//m4un/4d3l/93W4P/WzNj/uKuq/56Efv+mkY//ubKn/7Syqdazpqwzo5SMKLGkjtCqloX/rJWC/6GJeP+5npL/xrKx/7ujrf/RxtH/5OLv/+bm8v/t7vj/8fP9//Hz/f/x8/3/8PL8/+3t+P/v8fv/7vD6/93b5v/g3er/4Nvn/93V4f/o6PL/7e75/9HJ0/+nk4r/qpOK/6ycnP/Gwr//z8jM9cC0u1i0tqiwtLCh/7+vsf+zpI//oox9/7edlP/Ns6P/tpiS/9LGzv/x9P7/8PH8//L0/v/x8/3/8fP9//Hz/f/x9P3/8vT+/+3v+f/Gu8D/xrrA/+3u+f/x9P7/8fL9//Hz/f/z9f//19PY/6qWgf+hjH//r5ub/7Svqf/YzdX/1czTwLy3svzNw8j/wK+y/52Nf/+omIf/v6aZ/7+kmP/Fq57/ybm7//Dy/f/t7/n/6+v0/+/w+v/x8/3/8fT9/+/x+//x8/3/5uby/8Cwrv/Twr7/7u73//L0/v/x9P3/8fP9//L1///OydL/qZeK/56MgP+qlZf/r5Wd/8+/yf/Zz9j4zsDD/9HDz/+tm6H/opqS/7uyrf/DrKv/tpeZ/7+jnf/Grqb/zMHH/9LCvP/MvLv/29fi/+7v+//m4/X/3NTs/8K1zf/Ty+L/zsTQ/72in//It7r/5ODu/+vr9v/t7vj/39zn/8Kyvv+0qab/o5eS/62emP/AsLP/zb3F/Mi7xpe6qK//tqSr/66fnP+tn6T/08vQ/8Cos/+7naX/sZOY/7eak//LsqT/y7Kk/7mlqv++qrT/u6Ou/7+nvP/Aq83/iXGR/6mWtv/Ht9j/wrC9/8Kpn/+ymZz/sJij/76psv+6oan/uZ2n/7ihqP+5rbL/vcOx/768s/+xnJ3eo4+WKLmxrf+8va//vry2/7ypt//Ux9D/yrjC/8awuv+ojZT/wKif/9rEs/+8n5j/r4yO/6qHi/+viYz/t5KS/3xdaf9nTGP/c1ht/3xgd/+Te5P/wKml/9C4qf+pjIz/uJqh/7uepP+2maP/u6Gr/87Cy/+7u7X/vsS1/6uZmO6cgoJA0dDH/7/Ftv/Ev8D/zL/I/9bI0v/c0dr/zrrD/6+Sl//Rv7X/0Lux/62Lj/+4k5X/tZGT/7GQlv/AqK//qp2p/7u0x//CtNH/taLB/4hug/+vkY//3Ma3/8uyp/+7n6P/tZee/6+Qm//Brbj/2MvW/8q+x/+vraX/sqan/LSjpWfBu7j3sKeh/8W6t//a0tj/18rW/8i5xv+9prL/wamt/+DTzf/Pvrv/tJOZ/7GQl//It8H/4t/p/+7w+v/z9v//8/X//+fm8//Xzef/warH/76goP/cyr7/2MO2/76kpP+0maP/w624/7ehrv/CsL3/3NPe/7i4sv/Bur/9yLzIb6iepXLAtbryxbu6/+Pg4v/k3ef/0MHO/8q7xv/QxMn/2s/S/9fKzf+ykpz/wbC//+zu+//y9P7/8PL7/97e8f/s7vr/8vX+/+rq9//Br8T/vaGm/9/Ryv/cy8L/wKip/9DBzP/XytT/xq+8/8i3w//s6/P/xsLG/7mvuOWxoa00op6ZH8XCwtTc19792dPX/+Pd5//Uw9D/yLjE/9bM1v/i2uH/z8HN/7ShtP/DutP/4+P3//Dy/f/x8/z/6uv3/+/y+//w8vz/3tvq/9DI1//IucP/3dLT/+DU0f/Hs7j/3dLd/8m5xP/KtMH/3dfg/+7x9v/Mxs3/qZ6mjCcEAAOysqghsrGoXNPM1o7Jwcr+1cvW/868yv/Cs8D/49zm/+Lc5P/Vy9j/0szd/9/b7//k4fL/8PH8//Dy/P/y9P3/8fP9/+zu/f/Z1uz/ycHW/+Lf6v/g2eH/3tXX/9XGy//Xy9b/xrbC/8++yv/o5+7/5ujt/7y1vq+poaYYsrWwBI6FigIAAAAAtaa0FMO4xL/RxtL/yLjG/9fO2f/m4On/5N/o/760yP+4qLz/1LnB/9vI0f/u7/n/8PL8//Hz/f/x8/3/6+z8/97d9f/Jwdf/2dLe/+3t9f/a0dn/0sLN/8q5x//Zztn/zb7L/+fh6v/j4unguLC7MeLR7ACrp6kCk4uOAImBggDNwMwAvrC9SNDBzvLPwM3/5uLq/+Tf6P/n5u//rqK3/4Beev+gcoT/uaCw/9fS4f/W0N//3Nfm/+3u+P/j2eL/3MzZ/9jQ3//h3Ob/7Ovy/9vW4f/It8b/w7G//9rP2v/VydX/3tXg/MW8x2z///8AlIiQAKqlqACaipQAiXmDAJyJlwCAa3kGx7fEqNHD0P/r6vH/5OHq/+Ph6//X0uD/saW6/5F5lv/Btcf/49/q/+Le6f/Nxtf/0cnZ/72ao//BmKD/w6+9/+Th6//q6PD/4N7q/8S3zv/Iucf/wrHA/9bJ1f/FtsTHiXKEE5eDlACSgZAAAAAAAEw2RwBOOEkBYUVbAremtACunKpRybrI+urr8P/n5e3/5OHq/9fR3//i4O3/087b/+jl7v/t6/T/5+Tt/9LK2v+rmrb/f1dz/4RZcv+SeJH/5ePt/+7t9f/d2OL/vKnJ/8S0xv/HuMb/zLrI/7OfrnLDr74AZEtqAP///wAAAAAAUDlLAEs1Rg9tUGZFoYeaVZqHlDjDtcLd6unv/+fk7f/k3+n/3Nbj/9LM2//h2uX/7erz/+nk7f/m4ez/2dLg/9zY6P/Jw9b/tai9/8m/z//u7/f/6OXv/9K9vf++par/rpqp/8K0t/+rl5fxjHd/Qe/fzwA0GDUA5dTbAOnY3wBbRVYAUDxMAnBQZQmlkKBDt6ezp76wu+3p6O7/6OXt/+fi7P/b1OD/0MfV/+nj7f/j3ef/3dTh/+Te6f/Wztv/2dTk/9bS4v/Y0N3/4Njj/+rm8P/Xydb/1buy/9/Gtf+ympD/oo58/6aSiea2m5WNnoCALq+YiABukDwAkY9wAHdjcgBlVmIAgWV3AMezwgC2pLJTuqq48+He5v/w8fb/7e70/+Pg6P/b1N//5eHp/+Db5P/o4+3/6ubv/9nQ3f/TzNz/39zl/9XHzf/Nt7j/0b7A/8qxsv/hyLj/5cy6/9zDsv/PtKb/3sW0/9C2qPyii4KPlYJ2a3FaYSWGbm8AAAAAAAAAAACIdIEAlICOAG9VYgTAr76f4Nzk//X4+//v8fb/7Ozx/+3v9P/x8/f/8/f7//Dx9//p5e7/0cfU/83D0P/y9vr/29DS/93Cs//hx7b/2b+w/+XNu//avq//2but/9q8rv/kyrn/xKud+5iFd8idi349blheCINubAAAAAAAAAAAAAAAAACah5QAuqi3ALKfrzjg2+Ts9fj7//Dz9v/u7vL/8vX5//T3+v/2+/3/9vv9/+/x9v/g2uT/7Orw//P3+v/j3+T/3MW6/+TLuf/YvK3/s5WM/5hzbv+wiYL/07Sm/9/Gtv+5oJi5c11fIq2TfwBwXWIAgW1rAAAAAAAAAAAAAAAAAN3S0wCQfYwAOhYvA9jR25709vr/8/f6/+nn7P/v7/X/8/X5//b6/P/2/P3/8PT3/+zu8v/1+fz/7O/y/+zr8P/NtbP/4ce2/8qqnv+IYV//gGJh/6WCfP/PsKP/38a1/9zDs+3IrKKMooOAK//c1ABkTFIAAAAAAAAAAAAAAAAAAAAAAJeElQDPxdAAx7vINubj6+jz9fn/49/m/+Th6f/2+vz/9vv8//b7/f/r7vH/8vb4//D09//u7vP/2srT/9W7sv/iyLf/zaqe/62Ffv+fgHn/sJOK/82ypv/jybj/5sy7/9O3qvWqlIbHkoB1ZlM0RQsAAAAAAAAAAAAAAAAAAAAA3tXWAJSCkgAAAAAAysDMfejj6v7j3Ob/1MzX//X6/P/3/P7/8vf5/+rs8P/0+Pr/8vX4/9/W3P/Rt7H/5Mu5/+TKuf/XuKr/2r6v/8msof/Lsqf/07eq/97EtP/Tua3PtJuUR5qGey2KdHAoW0FMCAAAAAAAAAAAAAAAAAAAAAAAAAAAppilALKlswCfkJ4Q0cfTp+bh6f/Xy9j/5N/o//Dy9//t7vL/7fDz/+np7f/t7/P/4tze/9fDvf/dxrv/z7Wn/9C2p//mzrz/27+x/97EtP/kyrn/3sS1/7qemWTSt6sAl4J5AIdwbgBZP0oAAAAAAAAAAAAAAAAAAAAAAAAAAAD8/PoAu7C9ALutuwCunawXzsLOoN7W4PrZzNn/1sbW/9XL1//b093/4drk//Dw9f/0+fz/9Pj7/9XNz/+kkYL4vqaZ6ObNu//hx7f9yK2jv9K4rK7RtqrKsZWSRLqdmAB6ZmsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC+tbgAyrzMALWktACBZngKuKOzXcOuvrfLt8ns0sLS/+be6P/z9fn/9vv+//X6/f/z9vr+zMbL1puMiWKzmpNB1ruu39C3qqOZgYATLwskA4xtchJ+YGkJfmBoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADMwsYAoIubAJiCkgDVxNMAc1NnC6mRokDDscCT1svWzeHe5OXj4+fl3tziyNHN1IG7s70mnYpyAH1ZYQalhoNBpYqGEredlQCCZmsAjm90AIFiawCBYmoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAEAAAAAAAAAAAAAAADAAAAA4AAAAOAAAADwAAAA8AAAAPgAAAD4AAAD/AAAB/4AAAc=" });
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
