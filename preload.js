const fs = require('fs')
const path = require('path')
const {
    exec
} = require('child_process');

toBuffer = arraybuffer => {
    return Buffer.from(arraybuffer)
}

/**
 * 清理缓存的图片
 */
cleanTempImageCahce = () => {
    if (os.type() == 'Linux') {
        var theDir = utools.getPath('temp') + '/utoolsDoutuPlugin/';
    } else {
        var theDir = utools.getPath('temp') + 'utoolsDoutuPlugin/';
    }

    fs.exists(theDir, function (exists) {
        if (exists) {
            let theFiles = [];
            let files = fs.readdirSync(theDir);
            files.forEach(function (item, index) {
                let fPath = path.join(theDir, item);
                let stat = fs.statSync(fPath);
                if (stat.isFile() === true) {
                    theFiles.push(fPath);
                }
            });
            if (theFiles.length >= 20) {
                for (fiel_v of theFiles) {
                    fs.unlink(fiel_v, function (error) {
                        if (error) {
                            console.log(error);
                            return false;
                        }
                    })
                }
            }
        }
    });

}

saveImg = (path, img) => {
    fs.writeFileSync(path, img)
}

joinpath = path.join

isDev = /[a-zA-Z0-9\-]+\.asar/.test(__dirname) ? false : true

GetFilePath = File => {
    if (isDev) {
        return path.join(__dirname, 'static/script', File)
    } else {
        return path.join(__dirname.replace(/([a-zA-Z0-9\-]+\.asar)/, '$1.unpacked'), 'static/script', File)
    }
}

setDesktop = path => {
    if (utools.isMacOs()) {
        exec(`osascript -e 'tell application "System Events" to set picture of desktop 1 to "${path}"'`, (err, stdout, stderr) => {
            err && utools.showNotification(stderr)
        })
    } else if (utools.isWindows()) {
        var script = GetFilePath('setDesktop.cs')
        exec(`powershell -NoProfile -Command "Add-Type -Path ${script}; [Wallpaper.Setter]::SetWallpaper('${path}', 'Stretch')"`, (err, stdout, stderr) => {
            err && utools.showNotification(stderr)
        })
    } else {
        utools.showNotification('不支持 Linux')
    }
}