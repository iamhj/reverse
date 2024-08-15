const CryptoJS = require("crypto-js");

function encrypt(str) {
    //密钥--应和后台java解密或是前台js解密的密钥保持一致（16进制）
    var key = CryptoJS.enc.Utf8.parse("aLr8011v82deTFQwCZd1wCcD");
    //偏移量
    var srcs = CryptoJS.enc.Utf8.parse(str);
    //算法
    var encrypted = CryptoJS.AES.encrypt(srcs, key, { mode : CryptoJS.mode.ECB ,
        padding : CryptoJS.pad.Pkcs7
    });
    //替换--防止值为“1”的情况
    var reg = new RegExp('/', "g");
    return encrypted.toString().replace(reg, "#");
}

// let str = '{"url":"https://www.bilibili.com/video/BV1pw4m127JX/","platform":"bilibili"}';
//
// console.log(encrypt(str));