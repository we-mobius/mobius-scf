const { toLowerCase } = require('../src/utils/index.js')
const inquirer = require('inquirer')
const _yargs = require('yargs')
const secret = require('../configs/secret.js')
const { setState } = require('./state.js')
const { operate } = require('./function.operations.js')

/**************************************
 *          Function Operations
 **************************************/
const fn = (yargs) => {
  yargs = yargs || _yargs
  return new Promise((resolve, reject) => {
    yargs.command({
      command: 'function',
      alias: ['func', 'fun'],
      desc: 'Function Operations',
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
        env: {
          alias: 'e',
          type: 'string'
        },
        operation: {
          alias: 'op',
          type: 'string',
          choices: ['list', 'create', 'build', 'deploy', 'invoke', 'pull', 'delete']
        },
        name: {
          alias: 'n',
          type: 'string'
        }
      },
      handler: async argv => {
        let { platform, project, env, operation, name } = argv
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
        if (!env && Object.keys(secret[platform][project].envs).length > 0) {
          env = await inquirer.prompt([{
            type: 'list',
            name: 'env',
            message: 'Which env do you want to handle?',
            choices: Object.keys(secret[platform][project].envs)
          }]).then(answers => toLowerCase(answers.env))
          env = secret[platform][project].envs[env]
        }
        if (!operation) {
          operation = await inquirer.prompt([{
            type: 'list',
            name: 'operation',
            message: 'Which operation do you want to execute?',
            choices: ['List', 'Create', 'Build', 'Deploy', 'Invoke', 'Pull', 'Delete'],
            default: 'List'
          }]).then(answers => toLowerCase(answers.operation))
        }
        if (['create', 'build', 'deploy', 'invoke', 'pull', 'delete'].includes(operation)) {
          name = await inquirer.prompt([{
            type: 'input',
            name: 'name',
            message: 'Type the function name that you want to handle?'
          }]).then(answers => toLowerCase(answers.name))
        }
        setState({
          platform, project, env, operation, name
        })
        operate()
        resolve(`-pf=${platform} -pj=${project} --env=${env} -op=${operation}`)
      }
    })
  })
}

module.exports = {
  functionCommand: fn
}
