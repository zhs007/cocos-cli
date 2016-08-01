#!/usr/bin/env node

"use strict";

require('../src/cmd/fixjson');
require('../src/cmd/slots');
require('../src/cmd/buildproj');
//require('../src/cmd/rename');

//var fs = require('fs');
var process = require('process');
var glob = require('glob');
//var image = require('../src/image');
var basecmd = require('../src/basecmd');
//var tp = require('../src/texturepacker');
var argv = require('yargs')
    .usage('Usage: cocoscli command')
    .example('cocoscli command', 'cocoscli command')
    .help('h')
    .alias('h', 'help')
    .epilog('copyright 2016')
    .argv;

basecmd.procCmd(argv);

process.exit(1);