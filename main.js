/*
 * @Author       : tongzonghua
 * @Date         : 2020-10-20 22:56:13
 * @LastEditors  : tongzonghua
 * @LastEditTime : 2020-10-21 02:41:40
 * @Email        : tongzonghua@360.cn
 * @Description  : 
 * @FilePath     : /cli/aggna-cli/main.js
 */

// #! /usr/bin/env node

const program = require('commander');  // commander负责读取命令
const inquirer = require('inquirer');   // inquirer负责问询
const download = require('download-git-repo');   // download-git-repo负责下载对应模板项目的git仓库
const fse = require('fs-extra');   // fs-extra负责文件的复制
const memFs = require('mem-fs');
const editor = require('mem-fs-editor');   // mem-fs-editor负责模板的复制以及嵌入模板字符串，它需要依赖mem-fs
const { exec } = require('child_process');   // child_process负责执行命令行
const chalk = require('chalk');
const ora = require('ora');
