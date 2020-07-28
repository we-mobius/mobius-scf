# Wepay

## Deploy

- 依赖(\* 必选, \? 可选)：mobius_wepay_notify*, mobius_goods?, mobius_order?
- 执行本地构建: `mobius-scf function -> tencent -> projectname -> env-name -> Build -> mobius_wepay`
- 部署至云函数: `mobius-scf function -> tencent -> projectname -> env-name -> Deploy -> mobius_wepay`
- 腾讯 -> 云开发 CloudBase -> 云函数 -> mobius_wepay -> 函数配置 -> 编辑 -> 分别添加环境变量 appId & mchId & apiKey & notifyUrl & goodsUrl & orderUrl
- 腾讯 -> 云开发 CloudBase -> 云函数 -> mobius_wepay -> 函数配置 -> 编辑 -> 云接入 -> 设置路径 & 配置更多规则 -> 设置安全域名 -> 添加项目域名至 `WEB 安全域名`
- 项目中使用
  - Mobius JS
  - 直接请求云接入地址，POST 传参见下文
- 进一步开发、调试、上线

## Usage

### 功能描述

根据提供的参数获取客户端发起微信支付所需的参数。

#### 请求参数

> 注意： goods array 当前仅支持传入一个商品，传入多个商品会取第一个

```javascript
// 购买商品库中的商品：
{
  action: String("get" || "set"),
  payload: {
    type: String("JSAPI" || "NATIVE" || ""),
    openid: String(openid),
    goods: [{
      id: String(goodsId),
    }],
    attach?: String(len <= 127)
  }
}

// 购买自定义商品：
{
  action: String("get" || "set"),
  payload: {
    type: String("JSAPI" || "NATIVE" || ""),
    openid: String(openid),
    goods: [{
      name: String(len <= 128),
      price: Number(unit = cent)
    }],
    attach?: String(len <= 127)
  }
}
```

#### 返回结果

```javascript
// requestParams.payload.type === "JSAPI"
{
  [requestParams.payload.type]: {
    timestamp: Number(len = 13),
    nonceStr: String(len = 32),
    package: String(pattern = `prepay_id=${prepayId}`),
    signType: String("MD5"),
    paySign: String(sign),
    outTradeNo: String(len = 20),
    goods: Array(Object(pattern = {
      id: String(goodsId),
      name: String(goodsName),
      price: Number(goodsPrice)
    }))
  }
}
// requestParams.payload.type === "NATIVE"
{
  [requestParams.payload.type]: {
    codeUrl: String(codeUrl),
    outTradeNo: String(len = 20),
    goods: Array(Object(pattern = {
      id: String(goodsId),
      name: String(goodsName),
      price: Number(goodsPrice)
    }))
  }
}
```

## Debug

- 查看云函数日志

## Develop

Docs:

- [JSAPI 支付](https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=7_4)
- [NATIVE 支付](https://pay.weixin.qq.com/wiki/doc/api/native.php?chapter=6_1)
- [CloudBase 数据库 服务端 SDK](https://cloud.tencent.com/document/product/876/18441)
