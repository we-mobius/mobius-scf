# MediaPlatform API Ticket

## Deploy

- 执行本地构建: `mobius-scf function -> tencent -> projectname -> env-name -> Build -> mobius_mp_api_ticket`
- 部署至云函数: `mobius-scf function -> tencent -> projectname -> env-name -> Deploy -> mobius_mp_api_ticket`
- 腾讯 -> 云开发 CloudBase -> 数据库 -> 新建集合 `mobius_mp_api_ticket` -> 添加文档 -> `{ _id: '系统自动生成', access_token: { expires_at: 0, value: '' }, jsapi_ticket: { expires_at: 0, value: '' }, version: 'latest' }` -> 保存
- 腾讯 -> 云开发 CloudBase -> 数据库 -> `mobius_mp_api_ticket` -> 权限设置 -> 仅管理员可读写 -> 保存
- 腾讯 -> 云开发 CloudBase -> 云函数 -> mobius_mp_api_ticket -> 函数配置 -> 编辑 -> 分别添加环境变量 appId & appSecret
- 腾讯 -> 云开发 CloudBase -> 云函数 -> mobius_mp_api_ticket -> 函数配置 -> 编辑 -> 开启公网访问 -> 拿到公网固定 IP
- 公众号后台 -> 开发 -> 基本配置 -> 公众号开发信息 -> IP 白名单 -> 填入公网固定 IP
- 腾讯 -> 云开发 CloudBase -> 云函数 -> mobius_mp_api_ticket -> 函数配置 -> 编辑 -> 云接入 -> 设置路径 & 配置更多规则 -> 设置安全域名 -> 添加项目域名至 `WEB 安全域名`
- 项目中使用
  - MobiusJs -> `await initMobiusJS({ getAPITicketUrl: '云接入地址', ...其它配置 })`
  - 直接请求云接入地址，POST 传参 `{ action: 'get', payload: { type: 'js_api_ticket' }}`
- 公众号后台 -> 设置 -> 公众号设置 -> 功能设置 -> JS 接口安全域名 -> 添加项目域名
- 进一步开发、调试、上线

## Debug

- 查看云函数日志

## Develop

Docs:

- [Get Access Token](https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Get_access_token.html)
- [Get JsAPI Ticket](https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html#62)
- [CloudBase 数据库 服务端 SDK](https://cloud.tencent.com/document/product/876/18441)
