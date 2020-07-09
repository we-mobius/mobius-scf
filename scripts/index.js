#!/usr/bin/env node
const yargs = require('yargs')
const { exit } = require('yargs')
const { accountCommand } = require('./account.command.js')
const { functionCommand } = require('./function.command.js')

;(async () => {
  try {
    await new Promise((resolve, reject) => {
      yargs.command({
        command: '$0',
        desc: 'Default Operations',
        builder: {},
        handler: async argv => {
          console.info('Nothing to do!')
          resolve('done')
        }
      })
      accountCommand().then(() => { resolve('done') })
      functionCommand().then(() => { resolve('done') })
      yargs.help().parse()
    })
  } catch (e) {
    console.error(e)
    exit(1)
  }
})()
