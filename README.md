<p align="center">
  <a href="#" target="_blank" rel="noopener noreferrer">
    <img width="150" src="./public/assets/thoughts-daily.jpg" alt="Thoughts Daily Logo"/>
  </a>
</p>

<p align="center">
  <a href="https://standardjs.com"><img src="https://img.shields.io/badge/code_style-standard-brightgreen.svg" alt="Standard - JavaScript Style Guide"></a>
  <a href="http://commitizen.github.io/cz-cli/"><img src="https://img.shields.io/badge/commitizen-friendly-brightgreen.svg" alt="Commitizen friendly"></a>
</p>

<p align="center">
  <span style="font-weight: bold; color: hsla(96, 100%, 50%, 100%);">📜 English Doc </span>
  &nbsp;|&nbsp;
  <a href="./docs/readme_zh.md" style="color: hsla(264, 100%, 50%, 100%);">📜 中文文档</a>
</p>

<h1 align="center">Mobius SCF</h1>

🎢 One-stop station for SCF(serverless cloud functions) development and management.

## Documentation

```bash
# 1. clone this repository to your develop machine
git clone git@github.com:we-mobius/mobius-scf.git

# 2. intialize the dependencies & register to gloal path
npm install && npm link

# 3. edit your project configurations
cp ./configs/secret.example.js ./configs/secret.js && code ./configs/secret.js

# 4. read instructions & user helps
cat ./docs/instructions.md
mobius-scf --help
mobius-scf account --help
mobius-scf function -- help

# 5. do what you want
# ...
```

All the relative documentations of detail, pls check `./docs`，which contains:

- [Getting Started](./docs/getting_started.md) - How to Build & How to Use
- [Instructions](./docs/instructions.md) - Instructions
- [Design Specification](./docs/design_specification.md) - Design Specification
- [Todos](./docs/todos.md) - Todos & Roadmaps

## Built With

- [@cloudbase/cli](https://docs.cloudbase.net/cli/intro.html) - Tencent CloudBase Command-Line Interface 🤞
- [mincloud](https://doc.minapp.com/cloud-function/cli.html) - ifanr Cloud Command-Line Interface 🤞

## Author

- **Cigaret** - kcigaret@outlook.com

## License

This project is licensed under the **GPL-3.0** License - see the [LICENSE](LICENSE) file for details.
