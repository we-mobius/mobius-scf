# Security Check

## Deploy

- 依赖(\* 必选, \? 可选)：mobius_mp_api*
- 执行本地构建: `mobius-scf function -> tencent -> projectname -> env-name -> Build -> mobius_security_check`
- 部署至云函数: `mobius-scf function -> tencent -> projectname -> env-name -> Deploy -> mobius_security_check`
- 腾讯 -> 云开发 CloudBase -> 云函数 -> mobius_security_check -> 函数配置 -> 编辑 -> 添加环境变量 accessTokenUrl
- 腾讯 -> 云开发 CloudBase -> 云函数 -> mobius_security_check -> 函数配置 -> 编辑 -> 超时时间建议填至 10s 以上
- 腾讯 -> 云开发 CloudBase -> 云函数 -> mobius_security_check -> 函数配置 -> 编辑 -> 云接入 -> 设置路径 & 配置更多规则 -> 设置安全域名 -> 添加项目域名至 `WEB 安全域名`
- 项目中使用
  - MobiusJs -> TODO
  - 直接请求云接入地址，POST 传参 `{ action: 'get', payload: { type: SECURITY_CHECK_REQUEST_TYPES }}`

## Debug

- 查看云函数日志

## Develop

Docs:

- [珊瑚文本内容安全](https://developers.weixin.qq.com/community/servicemarket/detail/00040275a14468e0e689194b251015)
