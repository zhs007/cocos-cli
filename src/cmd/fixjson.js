"use strict";

var basecmd = require('../basecmd');
const fs = require('fs');
const path = require('path');
const util = require('util');
const glob = require('glob');
const vm = require('vm');

function getJsonObjChild(jsonobj) {
    let args = Array.prototype.slice.call(arguments, 1);

    let curobj = jsonobj;
    for (let ii = 0; ii < args.length; ++ii) {
        if (curobj.hasOwnProperty(args[ii])) {
            curobj = curobj[args[ii]];
        }
        else {
            return undefined;
        }
    }

    return curobj;
}

function findResource(usedresources, path) {
    for (let ii = 0; ii < usedresources.length; ++ii) {
        if (path.indexOf(usedresources[ii], -usedresources[ii].length) >= 0) {
            return usedresources[ii];
        }

        if (usedresources[ii].indexOf('../') == 0 && usedresources[ii].indexOf(path, -path.length) >= 0) {
            return usedresources[ii];
        }
    }

    return undefined;
}

function procPath(jsonobj, usedresources, attribname) {
    let srcpath = getJsonObjChild(jsonobj, attribname, 'Path');
    if (srcpath != undefined) {
        let curpath = findResource(usedresources, srcpath);
        if (curpath != undefined) {
            getJsonObjChild(jsonobj, attribname).Path = curpath;
        }
    }
}

function procObjChild(jsonobj, usedresources) {
    let lstchild = getJsonObjChild(jsonobj, 'Children');
    if (lstchild != undefined) {
        for (let ii = 0; ii < lstchild.length; ++ii) {
            procPath(lstchild[ii], usedresources, 'FileData');
            procPath(lstchild[ii], usedresources, 'NormalFileData');
            procPath(lstchild[ii], usedresources, 'PressedFileData');
            procPath(lstchild[ii], usedresources, 'DisabledFileData');

            procPath(lstchild[ii], usedresources, 'NormalBackFileData');
            procPath(lstchild[ii], usedresources, 'PressedBackFileData');
            procPath(lstchild[ii], usedresources, 'DisableBackFileData');
            procPath(lstchild[ii], usedresources, 'NodeNormalFileData');
            procPath(lstchild[ii], usedresources, 'NodeDisableFileData');

            procObjChild(lstchild[ii], usedresources);
        }
    }
}

function fixjson(jsonfile) {
    console.log('read ' + jsonfile);
    let buf = fs.readFileSync(jsonfile, 'utf8');
    let jsonobj = JSON.parse(buf);

    let lstchild = getJsonObjChild(jsonobj, 'Content', 'Content', 'ObjectData', 'Children');
    let usedresources = getJsonObjChild(jsonobj, 'Content', 'Content', 'UsedResources');

    if (lstchild != undefined && usedresources != undefined) {
        for (let ii = 0; ii < lstchild.length; ++ii) {
            procPath(lstchild[ii], usedresources, 'FileData');
            procPath(lstchild[ii], usedresources, 'NormalFileData');
            procPath(lstchild[ii], usedresources, 'PressedFileData');
            procPath(lstchild[ii], usedresources, 'DisabledFileData');

            procPath(lstchild[ii], usedresources, 'NormalBackFileData');
            procPath(lstchild[ii], usedresources, 'PressedBackFileData');
            procPath(lstchild[ii], usedresources, 'DisableBackFileData');
            procPath(lstchild[ii], usedresources, 'NodeNormalFileData');
            procPath(lstchild[ii], usedresources, 'NodeDisableFileData');

            procObjChild(lstchild[ii], usedresources);
        //    procPath(lstchild[ii], usedresources, 'FileData');
        //    procPath(lstchild[ii], usedresources, 'NormalFileData');
        //    procPath(lstchild[ii], usedresources, 'PressedFileData');
        //    procPath(lstchild[ii], usedresources, 'DisabledFileData');
        //    //let srcpath = getJsonObjChild(lstchild[ii], 'FileData', 'Path');
        //    //if (srcpath != undefined) {
        //    //    let curpath = findResource(usedresources, srcpath);
        //    //    if (curpath != undefined) {
        //    //        getJsonObjChild(lstchild[ii], 'FileData').Path = curpath;
        //    //    }
        //    //}
        }

        console.log('write ' + jsonfile);
        fs.writeFileSync(jsonfile, JSON.stringify(jsonobj, undefined, 4));
    }
}

function procCmd(argv) {
    let arr = argv._;

    if (arr.length < 2) {
        console.log('Usage: cocoscli fixjson src/resource.js');

        return false;
    }

    const sandbox = {};

    let srcfile = arr[1];
    console.log('read ' + srcfile);
    let buf = fs.readFileSync(srcfile, 'utf8');

    vm.runInNewContext(buf, sandbox);

    console.log('run ' + srcfile + ' ok!');

    //console.log('res is ' + util.inspect(sandbox) + ' ok!');
    console.log('g_resources is ' + JSON.stringify(sandbox.g_resources));

    for (let ii = 0; ii < sandbox.g_resources.length; ++ii) {
        if (sandbox.g_resources[ii].indexOf('.json', -5) > 0) {
            fixjson(sandbox.g_resources[ii]);
        }
    }

    return true;
}

basecmd.addCmd('fixjson', procCmd);



