# Wepay Notify

## Deploy

- 依赖(\* 必选, \? 可选)：mobius_order?
- 执行本地构建: `mobius-scf function -> tencent -> projectname -> env-name -> Build -> mobius_wepay_notify`
- 部署至云函数: `mobius-scf function -> tencent -> projectname -> env-name -> Deploy -> mobius_wepay_notify`
- 腾讯 -> 云开发 CloudBase -> 云函数 -> mobius_wepay_notify -> 函数配置 -> 编辑 -> 分别添加环境变量 orderUrl & apiKey
- 腾讯 -> 云开发 CloudBase -> 云函数 -> mobius_wepay_notify -> 函数配置 -> 编辑 -> 云接入 -> 设置路径 & 配置更多规则 -> 设置安全域名 -> 添加项目域名至 `WEB 安全域名`
- 项目中使用
  - 不直接调用，仅作为微信支付的通知回调处理函数
- 进一步开发、调试、上线

## Usage

### 支付结果通知回调

接收客户端完成支付之后微信服务器发来的支付结果，并完成相关业务逻辑。

#### 返回结果

```javascript
// 成功
<xml>
  <return_code><![CDATA[SUCCESS]]></return_code>
  <return_msg><![CDATA[OK]]></return_msg>
</xml>
```

## Debug

- 查看云函数日志

## Develop

Docs:

- [支付结果通知](https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=9_7)
- [CloudBase 数据库 服务端 SDK](https://cloud.tencent.com/document/product/876/18441)
