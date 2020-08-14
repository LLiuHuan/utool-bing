get = (url, buffer) =>
    new Promise((reslove, reject) => {
        var xhr = new XMLHttpRequest();
        if (buffer) xhr.responseType = 'arraybuffer';
        xhr.timeout = 90000;
        xhr.open('GET', url);
        xhr.send();
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    reslove(xhr.response);
                } else {
                    // console.log(xhr)
                    utools.showNotification('网络请求出错，状态码：' + xhr.status)
                    reslove("")
                }
            }
        };
    })

// 下载图片
downloadImg = async (url) => {
    // alert(url)
    var response = await get(`http://img.elephantnote.com/static/images/${url}`, true)
    var img = new Uint8Array(response)
    return img
}
// 下载图片
downloadWallPaper = async (filename) => {
    var img = await downloadImg(filename)
    var path = utools.showSaveDialog({
        defaultPath: filename
    })
    window.saveImg(path, window.toBuffer(img))
    toastr.success("下载成功！");
}

// 设为壁纸
setWallPaper = async (filename) => {
    var img = await downloadImg(filename)
    if (img) {
        var path = window.joinpath(utools.getPath('temp'), filename)
        window.saveImg(path, window.toBuffer(img))
        setDesktop(path)
    }
}

// 原图
showWallPaper = (url) => {
    utools.shellOpenExternal(`http://img.elephantnote.com/static/images/${url}`)
}

var $waterfall = $("#waterfall");
// 得到模板字符串
var templateStr = $("#grid_template").html();
//  生成数据绑定函数
var compile = _.template(templateStr);
//用数组存储当前三列的总高度
var colHeight = [0, 0, 0];
var page = 1;

getJsonandRender = (page) => {
    let url = "http://img.elephantnote.com/img/bing/"
    $.get(url, {
        'page': page,
        'limit': 15
    }, function (res) {
        // data转成json对象
        // var dataObj = JSON.parse(data);
        // 进行有没有到数据结束判断
        if (res.data.length === 0) {
            // console.log("没有数据了");
            $(".loading").show().html("没有更多的数据");
            return;
        }
        _.each(res.data, function (dictionary) {
            // 谁先加载完毕 处理谁
            var image = new Image();
            // 一旦设置了src属性 图片就开始加载
            image.src = `http://img.elephantnote.com/static/images/${dictionary.imgName}`;
            $(image).on('load', function () {
                var domStr = compile(dictionary);
                var $grid = $(domStr);
                $waterfall.append($grid);
                // 给grid定位
                // 求当前列最短值
                var minHeight = _.min(colHeight);
                //  找到最短值的列序号
                var minIndex = _.indexOf(colHeight, minHeight);
                $grid.css({
                    "top": minHeight,
                    "left": minIndex * 270
                });
                // 设置当前插入最短列的总高度
                colHeight[minIndex] += $grid.outerHeight() + 20;
                // 给最大的盒子设置高度
                $waterfall.css("height", _.max(colHeight));
                // 隐藏loading
                $(".loading").hide();
            });
        });
        lock = false;
        $(".load").hide();
    });
};

getJsonandRender(page);

// 给窗口监听滚
var lock = false;
$(window).scroll(function () {
    // console.log(lock)
    if (lock) return;
    // 当滚动到快到底的时候 再次发ajax请求
    var rate = $(window).scrollTop() / ($(document).height() - $(window).height());
    if (rate >= 0.95) {
        $(".load").show();
        page++;
        lock = true;
        getJsonandRender(page);
    }
});

// https://cn.bing.com/HPImageArchive.aspx?format=hp&idx=4&n=1&nc=1593737172051&pid=hp&video=1&quiz=1&og=1&IG=C5354531F75244CC9C17930AD1CC4070&IID=SERP.1054
// /th?id=OHR.LasCatedralesBeach_EN-CN1825890167_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp
// https://www.bing.com/th?id=OHR.LasCatedralesBeach_EN-CN1825890167_tmb.jpg


// 禁用网页右键 f12
document.oncontextmenu = function () {
    return false;
}

document.onselectstart = function () {
    return false;
}

document.oncopy = function () {
    return false;
}

document.onkeydown = function () {
    if (window.event && window.event.keyCode == 123) {
        event.keyCode = 0;
        event.returnValue = false;
        return false;
    }
};