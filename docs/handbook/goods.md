# Goods

## Deploy

- 执行本地构建: `mobius-scf function -> tencent -> projectname -> env-name -> Build -> mobius_goods`
- 部署至云函数: `mobius-scf function -> tencent -> projectname -> env-name -> Deploy -> mobius_goods`
- 腾讯 -> 云开发 CloudBase -> 数据库 -> 新建集合 `mobius_goods`
- 在 `mobius_goods` 集合中添加商品信息，格式如下：
  ```javascript
  {
    _id: String(source = "系统自动生成"),
    id: String(len = 12),
    name: String(len <= 128),
    price: Number(unit = cent),
    tags: Array(String())
  }
  ```
- 腾讯 -> 云开发 CloudBase -> 数据库 -> `mobius_goods` -> 权限设置 -> 仅管理员可读写 -> 保存
- 腾讯 -> 云开发 CloudBase -> 云函数 -> mobius_goods -> 函数配置 -> 编辑 -> 云接入 -> 设置路径 & 配置更多规则 -> 设置安全域名 -> 添加项目域名至 `WEB 安全域名`
- 项目中使用
  - Mobius JS
  - 直接请求云接入地址，POST 传参见下文
- 进一步开发、调试、上线

## Usage

### 获取商品信息

根据商品 ID（goodsId）获取商品信息。

#### 请求参数

```javascript
{
  action: String("get"),
  payload: {
    type: String("goods_info"),
    goodsId: String(goodsId),
  }
}
```

#### 返回结果

```javascript
{
  [requestParams.payload.type]: {
    _id: String(source = "系统自动生成"),
    id: String(len = 12),
    name: String(len <= 128),
    price: Number(unit = cent),
    tags: Array(String())
  }
}
```

## Debug

- 查看云函数日志

## Develop

Docs:

- [CloudBase 数据库 服务端 SDK](https://cloud.tencent.com/document/product/876/18441)
