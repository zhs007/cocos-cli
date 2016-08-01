"use strict";

var basecmd = require('../basecmd');
var exec = require('../exec');
const fs = require('fs');
const path = require('path');
const util = require('util');
const glob = require('glob');
const vm = require('vm');
var zhandlebars = require('zhandlebars');

function procCmd(argv) {
    let arr = argv._;

    if (arr.length < 2) {
        console.log('Usage: cocoscli buildproj projtest.json');

        return false;
    }

    let jsonbuff = fs.readFileSync(arr[1], 'utf-8');

    let params = JSON.parse(jsonbuff);
    zhandlebars.procProj(params, params.jsonfile, params.templatepath);

    return true;
}

basecmd.addCmd('buildproj', procCmd);



