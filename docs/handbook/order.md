# Order

## Deploy

- 执行本地构建: `mobius-scf function -> tencent -> projectname -> env-name -> Build -> mobius_order`
- 部署至云函数: `mobius-scf function -> tencent -> projectname -> env-name -> Deploy -> mobius_order`
- 腾讯 -> 云开发 CloudBase -> 数据库 -> 新建集合 `mobius_order`
- 腾讯 -> 云开发 CloudBase -> 数据库 -> `mobius_order` -> 权限设置 -> 仅管理员可读写 -> 保存
- 腾讯 -> 云开发 CloudBase -> 云函数 -> mobius_mp_auth -> 函数配置 -> 编辑 -> 分别添加环境变量 apiKey & orderNotifyUrl? & appId & mchId
- 腾讯 -> 云开发 CloudBase -> 云函数 -> mobius_order -> 函数配置 -> 编辑 -> 云接入 -> 设置路径 & 配置更多规则 -> 设置安全域名 -> 添加项目域名至 `WEB 安全域名`
- 项目中使用
  - Mobius JS ->
  - 直接请求云接入地址，POST 传参见下文
- 进一步开发、调试、上线

## Usage

### 创建订单

创建新订单。

#### 请求参数

```javascript
{
  action: String("get"),
  payload: {
    type: String("create_order"),
    outTradeNo: String(len = 20),
    openid: String(openid),
    goods: Array(Object(pattern = {
      id: String(goodsId),
      name: String(goodsName),
      price: Number(goodsPrice)
    })),
    attach: String(len <= 127),
    deviceInfo: String(len <= 32),
    tradeType: String("JSAPI" || "NATIVE"),
    tradeState: String("NOTPAY" || "SUCCESS" || "REFUND" || "CLOSED" || "REVOKED" || "USERPAYING" || "PAYERROR"),
    tradeDetail: Object(source = "微信服务器返回的结果")
  }
}
```

#### 返回结果

```javascript
{
  [requestParams.payload.type]: {
    id: String(docId, source = "系统自动生成"),
  }
}
```

### 获取订单

获取目标订单的信息。

#### 请求参数

```javascript
{
  action: String("get"),
  payload: {
    type: String("get_order"),
    outTradeNo: String(len = 20),
    openid: String(openid)
  }
}
```

#### 返回结果

```javascript
{
  [requestParams.payload.type]: {
    _id: String(source = "系统自动生成"),
    outTradeNo: String(len = 20),
    openid: String(openid),
    goods: Array(Object(pattern = {
      id: String(goodsId),
      name: String(goodsName),
      price: Number(goodsPrice)
    })),
    attach: String(len <= 127),
    deviceInfo: String(len <= 32),
    tradeType: String("JSAPI" || "NATIVE"),
    tradeState: String("NOTPAY" || "SUCCESS" || "REFUND" || "CLOSED" || "REVOKED" || "USERPAYING" || "PAYERROR"),
    tradeDetail: Object(source = "微信服务器返回的结果")
  }
}
```

### 更新订单

更新目标订单的信息。

#### 请求参数

```javascript
{
  action: String("get"),
  payload: {
    type: String("update_order"),
    outTradeNo: String(len = 20),
    openid: String(openid),
    changes: Object(source = "微信服务器返回的结果")
  }
}
```

#### 返回结果

```javascript
{
  [requestParams.payload.type]: {
    updated: Boolean(true || false),
    outTradeNo: requestParams.payload.outTradeNo,
    openid: requestParams.payload.openid,
    goods: Array(Object(pattern = {
      id: String(goodsId),
      name: String(goodsName),
      price: Number(goodsPrice)
    })),
    attach: String(len <= 127),
    deviceInfo: String(len <= 32),
    tradeType: String("JSAPI" || "NATIVE"),
    older: {
      tradeState: String("NOTPAY" || "SUCCESS" || "REFUND" || "CLOSED" || "REVOKED" || "USERPAYING" || "PAYERROR"),
      tradeDetail: Object(pattern = "微信服务器返回的结果")
    },
    newer: {
      tradeState: String("NOTPAY" || "SUCCESS" || "REFUND" || "CLOSED" || "REVOKED" || "USERPAYING" || "PAYERROR"),
      tradeDetail: requestParams.payload.changes
    }
  }
}
```

### 交易状态查询

检查目标订单交易的状态。

#### 请求参数

```javascript
{
  action: String("get"),
  payload: {
    type: String("check_trade_state"),
    outTradeNo: String(len = 20),
    openid: String(openid),
    forceQuery: Boolean(true || false)
  }
}
```

#### 返回结果

```javascript
{
  [requestParams.payload.type]: {
    updated: Boolean(true || false),
    outTradeNo: String(len = 20),
    openid: String(openid),
    older: undefined || String("NOTPAY" || "SUCCESS" || "REFUND" || "CLOSED" || "REVOKED" || "USERPAYING" || "PAYERROR"),
    newer: String("NOTPAY" || "SUCCESS" || "REFUND" || "CLOSED" || "REVOKED" || "USERPAYING" || "PAYERROR"),
  }
}
```

## Debug

- 查看云函数日志

## Develop

Docs:

- [CloudBase 数据库 服务端 SDK](https://cloud.tencent.com/document/product/876/18441)
