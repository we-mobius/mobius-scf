# Order Notify

## Deploy

- 依赖(\* 必选, \? 可选)：mobius_order*
- 执行本地构建: `mobius-scf function -> tencent -> projectname -> env-name -> Build -> mobius_order_notify`
- 部署至云函数: `mobius-scf function -> tencent -> projectname -> env-name -> Deploy -> mobius_order_notify`
- 腾讯 -> 云开发 CloudBase -> 云函数 -> mobius_order_notify -> 函数配置 -> 编辑 -> 云接入 -> 设置路径 & 配置更多规则 -> 设置安全域名 -> 添加项目域名至 `WEB 安全域名`
- 项目中使用
  - 作为订单状态变更的通知回调处理函数
- 进一步开发、调试、上线

## Usage

### 订单状态变更回调

接受订单状态变更的相关信息，并完成相关业务逻辑。

#### 请求参数

```javascript
{
  action: String("get"),
  payload: {
    type: String("order_notify"),
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

#### 返回结果

```javascript
// Mobius SCF 系列标准的成功响应
{
  status: String('success'),
  status_message: String(''),
  data: {}
}
```

## Debug

- 查看云函数日志

## Develop

Docs:

- [CloudBase 数据库 服务端 SDK](https://cloud.tencent.com/document/product/876/18441)
