const inquirer = require('inquirer')
const fse = require('fs-extra')
const download = require('download-git-repo')
const { TEMPLATE_GET_REPO, INJECT_FILES } = require('./constans')
const chalk = require('chalk')
const ora = require('ora')
const path = require('path')
const memFs = require('mem-fs')
const edirot = require('mem-fs-editor')
const { getDirFileName, updateCli } = require('./utils')
const { exec } = require('child_process')

function Project(options) {
  this.config = Object.assign({
    projectName: '',
    description: '',
    initTool: '',
    author: '',
    version: ''
  }, options)
  const store = memFs.create()
  this.memFsEditor = edirot.create(store)
}

// 创建项目，开始问询
Project.prototype.create = async function () {
  // await updateCli()
  this.inquire().then(answer => {
    this.config = Object.assign(this.config, answer)
    // 下载
    this.generate();
  })
}

// 问询
Project.prototype.inquire = function () {
  const prompts = [];
  const { projectName, description, initTool, author, version } = this.config;
  if (typeof projectName !== 'string') {
    prompts.push({
      type: "input",
      name: 'projectName',
      message: '🦊 请输入项目名: ',
      default: () => {
        return 'electron-vue';
      },
      validate: input => {
        if (!input) return '💣 项目名不能为空';
        if (fse.existsSync(input)) return '💣 当前目录已存在同名项目，请更换项目名';
        return true;
      }
    })
  } else if (fse.existsSync(projectName)) {
    prompts.push({
      type: "input",
      name: 'projectName',
      message: '💣 当前目录已存在同名项目，请更换项目名',
      validate: input => {
        if (!input) return '💣 项目名不能为空';
        if (fse.existsSync(input)) return '💣 当前目录已存在同名项目，请更换项目名';
        return true;
      }
    })
  }
  if (typeof description !== 'string') {
    prompts.push({
      type: "input",
      name: "description",
      message: '🐳 请输入项目描述:',
      default: () => {
        return 'An electron-vue project';
      }
    })
  }

  // if (typeof author !== 'string') {
  prompts.push({
    type: 'input',
    name: 'author',
    message: '🐠 请输入作者:',
    default: () => {
      return '';
    }
  })
  // }

  // if (typeof version !== 'string') {
  prompts.push({
    type: 'input',
    name: 'version',
    message: '🐫 请输入版本号:',
    default: () => {
      return '1.0.0';
    }
  })
  // }

  // if (typeof initTool !== 'string') {
  prompts.push({
    type: 'list',
    name: 'initTool',
    message: '🐊 请选择初始化方式:',
    choices: ['yarn', 'npm']
  })
  // }

  return inquirer.prompt(prompts)
}

// 模板替换
Project.prototype.injectTemplate = function (source, dest, data) {
  this.memFsEditor.copyTpl(source, dest, data)
}

Project.prototype.generate = function () {
  const { projectName, description, initTool } = this.config;
  const projectPath = path.join(process.cwd(), projectName);
  const downloadPath = path.join(projectPath, '__download__')

  const downloadSpinner = ora('🚀🚀🚀 正在下载模板，请稍等...')
  downloadSpinner.start();

  // 下载 Git repo
  download(TEMPLATE_GET_REPO, downloadPath, { clone: true }, err => {
    if (err) {
      downloadSpinner.color = 'red';
      downloadSpinner.fail(err.message);
      return;
    }
    downloadSpinner.color = 'green';
    downloadSpinner.succeed('🏆🏆🏆 下载成功');

    // 复制文件
    const copyFiles = getDirFileName(downloadPath);

    copyFiles.forEach(file => {
      fse.copySync(path.join(downloadPath, file), path.join(projectPath, file))
      console.log(`${chalk.green('🎡')}${chalk.gray(` 创建: ${projectName}/${file}`)}`);
    })

    // 替换 package.json 中的字段
    INJECT_FILES.forEach(file => {
      this.injectTemplate(path.join(downloadPath, file), path.join(projectName, file), this.config)
    })

    this.memFsEditor.commit(() => {
      INJECT_FILES.forEach(file => {
        console.log(`${chalk.green('🎡')}${chalk.gray(` 创建: ${projectName}/${file}`)}`);
      })

      fse.remove(downloadPath)
      process.chdir(projectPath)

      // Git 初始化
      const gitInitSpinner = ora(`🛫🛫🛫 cd ${chalk.green.bold(projectName)} 目录，执行 ${chalk.green.bold('git init')}`);
      gitInitSpinner.start();

      // git init
      const gitInit = exec('git init')
      gitInit.on('close', code => {
        if (code === 0) {
          gitInitSpinner.color = 'green';
          gitInitSpinner.succeed(gitInit.stdout.read())
        } else {
          gitInitSpinner.color = 'red';
          gitInitSpinner.fail(gitInit.stdout.read());
        }

        // npm install
        const installSpinner = ora(`🚀🚀🚀 安装项目依赖 ${chalk.green.bold(`${initTool} install`)} , 请稍后...`);
        installSpinner.start();
        exec(`${initTool} install`, (err, stdout, stderr) => {
          if (err) {
            installSpinner.color = 'red';
            installSpinner.fail(chalk.red('💣💣💣 安装项目依赖失败，请自行重新安装！'));
            console.log(err)
          } else {
            installSpinner.color = 'green';
            installSpinner.succeed('🐳🐳🐳 安装依赖成功');
            console.log(`${stderr}${stdout}`);
            console.log();
            console.log(chalk.green('🍺🍺🍺 创建项目成功！'));
            console.log(chalk.green(`🐎🐎🐎 cd ${projectName} && ${initTool} run dev`))
            console.log(chalk.yellow('💐💐💐 If you have beautify girl around you, just tell me the phone！🦀🦀'));
          }
        })
      })
    })
  })
}

module.exports = Project