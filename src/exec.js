var spawn = require('child_process').spawn;

function buildCmd(cmd, param) {
    var str = cmd;
    var max = param.length;

    for(var i = 0; i < max; ++i) {
        str = str + ' ' + param[i];
    }

    return str;
}

function run(cmd, param, dir, endfunc) {
    scmd = spawn(cmd, param, { cwd: dir });

    var strcmd = buildCmd(cmd, param);
    console.log(strcmd + ' at ' + dir + '--->');

    scmd.stdout.on('data', function (data) {
        console.log('>' + data);
    });

    scmd.stderr.on('data', function (data) {
        console.log('>err:' + data);
    });

    scmd.on('close', function (code) {
        console.log('<-------' + code);

        endfunc();
    });
}

function runQueue(lst, index) {
    var max = lst.length;
    if(index >= max) {
        return ;
    }

    run(lst[index]['cmd'], lst[index]['param'], lst[index]['dir'], function () {
        runQueue(lst, index + 1);
    })
}

function addCmd(lst, cmd, param, dir) {
    var max = lst.length;
    lst[max] = { cmd: cmd, param: param, dir: dir };
}

function addCmdEx(lst, cmd, dir) {
    var arr = cmd.split(' ');
    var param = [];
    var first = arr[0];

    var max = arr.length;
    for(var i = 1; i < max; ++i) {
        param[i - 1] = arr[i];
    }

    var max = lst.length;
    lst[max] = { cmd: first, param: param, dir: dir };
}

exports.run = run;
exports.runQueue = runQueue;
exports.addCmd = addCmd;
exports.addCmdEx = addCmdEx;