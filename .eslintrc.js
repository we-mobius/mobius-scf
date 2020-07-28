module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2020: true,
    node: true
  },
  extends: [
    'standard'
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  rules: {
    'max-len': [1, {
      code: 140,
      ignoreUrls: true,
      ignoreTemplateLiterals: true
    }],
    'no-unused-vars': [1]
  }
}
