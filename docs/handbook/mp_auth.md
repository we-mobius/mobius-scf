# MediaPlatform API Ticket

## Deploy

- 执行本地构建: `mobius-scf function -> tencent -> projectname -> env-name -> Build -> mobius_mp_auth`
- 部署至云函数: `mobius-scf function -> tencent -> projectname -> env-name -> Deploy -> mobius_mp_auth`
- 腾讯 -> 云开发 CloudBase -> 数据库 -> 新建集合 `mobius_mp_auth`
- 腾讯 -> 云开发 CloudBase -> 数据库 -> `mobius_mp_auth` -> 权限设置 -> 仅管理员可读写 -> 保存
- 腾讯 -> 云开发 CloudBase -> 云函数 -> mobius_mp_auth -> 函数配置 -> 编辑 -> 分别添加环境变量 appId & appSecret
- 腾讯 -> 云开发 CloudBase -> 云函数 -> mobius_mp_auth -> 函数配置 -> 编辑 -> 云接入 -> 设置路径 & 配置更多规则 -> 设置安全域名 -> 添加项目域名至 `WEB 安全域名`
- 项目中使用
  - Mobius JS -> `initMpAuth({ preLogin: true, appId: 'your mp appId', ...其它配置项 })`
  - 直接请求云接入地址，POST 传参 `{ action: 'get', payload: { type: 'snsapi_base' | 'snsapi_userinfo' | 'user_info' }}`
- 公众号后台 -> 设置 -> 公众号设置 -> 功能设置 -> 网页授权域名 -> 添加项目域名
- 进一步开发、调试、上线

## Debug

- 查看云函数日志

## Develop

Docs:

- [网页授权](https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html#1)
- [CloudBase 数据库 服务端 SDK](https://cloud.tencent.com/document/product/876/18441)
