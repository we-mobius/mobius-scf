const { toLowerCase } = require('../src/utils/index.js')
const inquirer = require('inquirer')
const _yargs = require('yargs')
const secret = require('../configs/secret.js')
const { operate } = require('./account.operations.js')
const { setState } = require('./state.js')

/**************************************
 *          Account Operations
 **************************************/
const account = (yargs) => {
  yargs = yargs || _yargs
  return new Promise((resolve, reject) => {
    yargs.command({
      command: 'account',
      alias: ['acc'],
      desc: 'Account Operations',
      builder: {
        platform: {
          alias: 'pf',
          type: 'string',
          choices: ['ifanr', 'tencent']
        },
        project: {
          alias: 'pj',
          type: 'string'
        },
        operation: {
          alias: 'op',
          type: 'string',
          choices: ['login', 'logout']
        }
      },
      handler: async argv => {
        let { platform, project, operation } = argv
        if (!platform) {
          platform = await inquirer.prompt([
            {
              type: 'list',
              name: 'platform',
              message: 'Which platform do you want to handle?',
              choices: Object.keys(secret)
            }
          ]).then(answers => toLowerCase(answers.platform))
        }
        if (!project) {
          project = await inquirer.prompt([{
            type: 'list',
            name: 'project',
            message: 'Which project do you want to handle?',
            choices: Object.keys(secret[platform])
          }]).then(answers => toLowerCase(answers.project))
        }
        if (!operation) {
          operation = await inquirer.prompt([{
            type: 'list',
            name: 'operation',
            message: 'Which operation do you want to execute?',
            choices: ['Login', 'Logout'],
            default: 'Login'
          }]).then(answers => toLowerCase(answers.operation))
        }
        setState({
          platform,
          project,
          operation,
          secretId: secret[platform][project].secretId,
          secretKey: secret[platform][project].secretKey
        })
        operate()
        resolve(`-pf=${platform} -pj=${project} -op=${operation}`)
      }
    })
  })
}

module.exports = {
  accountCommand: account
}
