/*
 * @Author       : tongzonghua
 * @Date         : 2020-10-20 22:56:14
 * @LastEditors  : tongzonghua
 * @LastEditTime : 2021-03-31 10:18:08
 * @Email        : tongzonghua@360.cn
 * @Description  : 工具库
 * @FilePath     : /cli/aggna-cli/src/utils.js
 */

const path = require('path');
const fse = require('fs-extra');
const { say } = require('cfonts')
const chalk = require('chalk')
const ora = require('ora')
const { INJECT_FILES } = require('./constans')

const getRootPath = () => path.resolve(__dirname, './../')
const pkg = require(path.join(getRootPath(), 'package.json'))

exports.config = pkg

exports.logPackageVersion = () => {
  const msg = `👏👏👏 欢迎使用 ${chalk.bold.yellow(`${pkg.name}`)} ${chalk.green(`v${pkg.version}`)}`
  console.log(msg);
}

exports.getDirFileName = dir => {
  try {
    const files = fse.readdirSync(dir);
    const filesToCopy = [];
    files.forEach(file => {
      if (file.indexOf(INJECT_FILES) > -1) return;
      filesToCopy.push(file)
    })
    return filesToCopy
  } catch (e) {
    return []
  }
}

exports.greeting = (text = '') => {
  const cols = process.stdout.columns
  text = text || pkg.name
  if (cols > 85) text
  else if (cols > 60) text
  else text = false

  if (text) {
    say(text, {
      colors: ['yellow'],
      font: 'simple3d',
      gradient: ['red', 'blue'],
      space: false
    })
  } else console.log(chalk.yellow.bold(`\n  aggna-cli`))
  console.log()
}
