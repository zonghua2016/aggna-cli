/*
 * @Author       : tongzonghua
 * @Date         : 2020-10-20 22:56:14
 * @LastEditors  : tongzonghua
 * @LastEditTime : 2020-10-21 02:41:22
 * @Email        : tongzonghua@360.cn
 * @Description  : 
 * @FilePath     : /cli/aggna-cli/src/utils.js
 */

const path = require('path');
const fse = require('fs-extra');
const { say } = require('cfonts')
const chalk = require('chalk')
const axios = require('axios')
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

// 查询模板仓库
exports.updateCli = async () => {
  const res = await axios({ url: 'https://api.github.com/users/zonghua2016/repos', method: 'GET' })
  if (res.status === 200) {
    res.data.forEach(repo => {
      console.log(111, repo.id, repo.name, repo.full_name);
    })
    console.log(1111, res.status);
  }
}