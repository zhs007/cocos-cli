"use strict";

var basecmd = require('../basecmd');
var exec = require('../exec');
const fs = require('fs');
const path = require('path');
const util = require('util');
const glob = require('glob');
const vm = require('vm');

function procCmd(argv) {
    let arr = argv._;

    if (arr.length < 2) {
        console.log('Usage: cocoscli slots kof');

        return false;
    }

    let lst = [];

    exec.addCmdEx(lst, 'rm ./project.json', './');
    exec.addCmdEx(lst, 'cp src/' + arr[1] + '/project.json ./project.json', './');
    exec.addCmdEx(lst, 'cocos compile -p web -m release', './');

    return true;
}

basecmd.addCmd('slots', procCmd);



