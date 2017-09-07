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
            if (path.length > usedresources[ii].length) {
                if (path.charAt(path.length - usedresources[ii].length - 1) == '/') {
                    return usedresources[ii];
                }
            }
            else if (path.length == usedresources[ii].length) {
                return usedresources[ii];
            }
        }

        if (usedresources[ii].indexOf('../') == 0 && usedresources[ii].indexOf(path, -path.length) >= 0) {
            if (path.charAt(path.length - usedresources[ii].length - 1) == '/') {
                return usedresources[ii];
            }
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

    srcpath = getJsonObjChild(jsonobj, attribname, 'Plist');
    if (srcpath != undefined && srcpath.length > 0) {
        let curpath = findResource(usedresources, srcpath);
        if (curpath != undefined) {
            getJsonObjChild(jsonobj, attribname).Plist = curpath;
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

            procPath(lstchild[ii], usedresources, 'BackGroundData');
            procPath(lstchild[ii], usedresources, 'ProgressBarData');
            procPath(lstchild[ii], usedresources, 'BallNormalData');
            procPath(lstchild[ii], usedresources, 'BallPressedData');
            procPath(lstchild[ii], usedresources, 'BallDisabledData');

            procPath(lstchild[ii], usedresources, 'ImageFileData');

            procPath(lstchild[ii], usedresources, 'LabelBMFontFile_CNB');

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
    let lstaniframe = getJsonObjChild(jsonobj, 'Content', 'Content', 'Animation', 'Timelines');

    if ((lstaniframe !=undefined || lstchild != undefined) && usedresources != undefined) {
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

                procPath(lstchild[ii], usedresources, 'BackGroundData');
                procPath(lstchild[ii], usedresources, 'ProgressBarData');
                procPath(lstchild[ii], usedresources, 'BallNormalData');
                procPath(lstchild[ii], usedresources, 'BallPressedData');
                procPath(lstchild[ii], usedresources, 'BallDisabledData');

                procPath(lstchild[ii], usedresources, 'ImageFileData');

                procPath(lstchild[ii], usedresources, 'LabelBMFontFile_CNB');

                procObjChild(lstchild[ii], usedresources);
            }
        }

        if (lstaniframe != undefined) {
            for (let ii = 0; ii < lstaniframe.length; ++ii) {

                let srcframes = getJsonObjChild(lstaniframe[ii], 'Frames');

                if (srcframes != undefined) {
                    for (let jj = 0; jj < srcframes.length; ++jj) {
                        procPath(srcframes[jj], usedresources, 'TextureFile');
                    }
                }
            }
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
    let buf = '';
    for (let ii = 1; ii < arr.length; ++ii) {
        let srcfile = arr[ii];
        console.log('read ' + srcfile);
        buf += fs.readFileSync(srcfile, 'utf8');
        buf += '\r\n';
        console.log('run ' + srcfile + ' ok!');
    }

    vm.runInNewContext(buf, sandbox);

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



