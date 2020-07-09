<p align="center">
  <a href="#" target="_blank" rel="noopener noreferrer">
    <img width="150" src="../public/assets/thoughts-daily.jpg" alt="Thoughts Daily Logo"/>
  </a>
</p>

<p align="center">
  <a href="https://standardjs.com"><img src="https://img.shields.io/badge/code_style-standard-brightgreen.svg" alt="Standard - JavaScript Style Guide"></a>
  <a href="http://commitizen.github.io/cz-cli/"><img src="https://img.shields.io/badge/commitizen-friendly-brightgreen.svg" alt="Commitizen friendly"></a>
</p>

<p align="center">
  <a href="../README.md" style="color: hsla(264, 100%, 50%, 100%);">📜 English Doc</a>
  &nbsp;|&nbsp;
  <span style="font-weight: bold; color: hsla(96, 100%, 50%, 100%);">📜 中文文档</span>
</p>

<h1 align="center">Mobius SCF</h1>

🎨 一站式 Serverless 云函数开发和管理，目前集成了知晓云云函数和腾讯云开发云函数部分主要功能，特色如下：

- 统一了不同平台关于云函数的 CLI 命令（创建、拉取、构建、部署、执行、删除）；
- 提供了多平台、多项目、多环境切换的能力；
- 提供交互式命令行输入；
- 上传至云端的代码可以选择在本地执行构建（webpack），从而拥有跨平台、跨环境、跨函数复用通用代码的能力。

## 文档

```bash
# 1. 将此仓库拉到你的工作环境中
git clone git@github.com:we-mobius/mobius-scf.git

# 2. 初始化依赖 & 将全局命令添加至 Global Path
npm install && npm link

# 3. 编辑项目配置
cp ./configs/secret.example.js ./configs/secret.js && code ./configs/secret.js

# 4. 阅读使用说明或者帮助项
cat ./docs/instructions.md
mobius-scf --help
mobius-scf account --help
mobius-scf function -- help

# 5. do what you want
# ...
```

更加详细的文档，请查阅 `./docs`，其中包括:

- [上手使用](./docs/getting_started.md) - 如何构建 & 如何使用
- [使用说明](./docs/instructions.md) - 使用说明
- [设计原则](./docs/design_specification.md) - 设计原则
- [待办](./docs/todos.md) - 待办 & 迭代路线

## 技术栈

- [@cloudbase/cli](https://docs.cloudbase.net/cli/intro.html) - Tencent CloudBase Command-Line Interface 🤞
- [mincloud](https://doc.minapp.com/cloud-function/cli.html) - ifanr Cloud Command-Line Interface 🤞

## 作者

- **Cigaret** - kcigaret@outlook.com

## 开源许可

此项目依据 **GPL-3.0** 开源许可开源 - 许可详情请查阅 [LICENSE](LICENSE)。
