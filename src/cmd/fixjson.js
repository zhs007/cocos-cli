"use strict";

var basecmd = require('../basecmd');
var fs = require('fs');
var path = require('path');
var util = require('util');
var glob = require('glob');
const vm = require('vm');

function cpfile(src, dest) {
    let buf = fs.readFileSync(src, 'binary');
    fs.writeFileSync(dest, buf, 'binary');
}

function procCmd(argv) {
    let arr = argv._;

    if (arr.length < 2) {
        console.log('Usage: cocoscli fixjson src/resource.js');

        return false;
    }

    let srcfile = arr[1];
    console.log('read ' + srcfile);
    let buf = fs.readFileSync(srcfile);

    eval(buf);

    console.log('run ' + srcfile + ' ok!');

    console.log('res is ' + JSON.stringify(res) + ' ok!');

    return true;
}

basecmd.addCmd('fixjson', procCmd);



