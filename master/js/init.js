// 旅行路径对象
var TravelRoute = {};

TravelRoute.Config = {};

// 构造边对象，初始化
var Edge = function(first, second, value){
    this._first = first;
    this._second = second;
    this._value = value;
};

//得到第一个节点
Edge.prototype.getFirst = function(){
    return this._first;
};

// 得到第二个节点
Edge.prototype.getSecond = function(){
    return this._second;
};

// 得到value值
Edge.prototype.getValue = function(){
    return this._value;
};

// 加载文件资源
TravelRoute.FileLists = {
    resources:[
        /*==============加载js=============*/

        //'master/css/base.css',           // 加载全局css
        //'master/css/map.css',            // 加载地图css

        /*==============================*/

        /*==============加载js=============*/

        // javascript库
        'lib/jquery-2.1.0.min.js',
        'lib/underscore.js',
        'lib/jquery.popupoverlay.js',

        //自定义js
        'master/js/util.js',            //工具包
        'master/js/map.js',             //地图控制
        'master/js/calc.js'             //算法计算
        /*==============================*/
    ]
};

// resources loader
head.load(TravelRoute.FileLists.resources, function(){
    console.log("加载。。。");
});
