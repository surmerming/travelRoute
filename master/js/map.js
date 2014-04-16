


TravelRoute.Map = {
    map: {},
    point: {},
    util: {},
    marker: {},

    initialize: function(){
        var self = this;

        // util
        self.util = TravelRoute.Util;

        //首先呈现的界面
       self.originPresentation();
        // localCity居中显示
       self.centerByLocalCity();

        // 修改配置
       self.modDefaults();

        // 事件操作
//        self.startRunning();

        // 运行中dom的操作
        self.runChange();

    },

    // 加载地图首先展示的页面
    originPresentation: function(){
        this.map = new BMap.Map("mapContainer");
        this.point = new BMap.Point(116.404, 39.915);
        this.map.centerAndZoom(this.point,12);

        // 将map设为全局变量
        TravelRoute.Config.Map = this.map;


    },

    // 根据localCity，并将该城市为中心点显示在地图上
    centerByLocalCity: function(){
        var self = this;
        var myFun = function(result){
            self.map.setCenter(result.name);  // result.name为城市名字，并将地图以该城市为中心点显示
        }
        // 根据IP获取城市名字
        var myCity = new BMap.LocalCity();
        myCity.get(myFun);
    },

    // 修改默认配置
    modDefaults: function(){
        this.addControl();
        this.modProperty();
    },

    // 添加控件
    addControl: function(){
        this.map.addControl(new BMap.NavigationControl());
        this.map.addControl(new BMap.ScaleControl());
        this.map.addControl(new BMap.OverviewMapControl());
        this.map.addControl(new BMap.MapTypeControl());
    },

    // 修改默认属性
    modProperty: function(){

        this.map.enableScrollWheelZoom();    //启用滚轮放大缩小，默认禁用
        this.map.enableContinuousZoom();    //启用地图惯性拖拽，默认禁用
    },

    getElementById: function(div){
        return document.getElementById(div);
    },

    suggestEvent: function(inputId){
        var self = this;

        // 设置地点
        var setPlace = function(){
            //self.map.clearOverlays();    //清除地图上所有覆盖物
            var local = new BMap.LocalSearch("全国", { //智能搜索
                renderOptions: {
                    map: self.map,
                    panel : "searchResult",
                    autoViewport: true,
                    selectFirstResult: false
                },
                onSearchComplete: function(){
                    var pp = local.getResults().getPoi(0).point;    //获取第一个智能搜索的结果
                    self.map.centerAndZoom(pp, 18);
                    self.map.addOverlay(new BMap.Marker(pp));    //添加标注
                }
            });
            local.search(myValue);
        };

        var ac = new BMap.Autocomplete(    //建立一个自动完成的对象
            {
                "input": inputId,
                "location": "全国"
            }
        );

        ac.addEventListener("onhighlight", function(e) {  //鼠标放在下拉列表上的事件
            console.log("onhighlight");
            console.log(e);
            var str = "";
            var _value = e.fromitem.value;
            var value = "";
            if (e.fromitem.index > -1) {
                value = _value.province +  _value.city +  _value.district +  _value.street +  _value.business;
            }
            str = "FromItem<br />index = " + e.fromitem.index + "<br />value = " + value;

            value = "";
            if (e.toitem.index > -1) {
                _value = e.toitem.value;
                value = _value.province +  _value.city +  _value.district +  _value.street +  _value.business;
            }
            str += "<br />ToItem<br />index = " + e.toitem.index + "<br />value = " + value;
            //self.getElementById("searchResult").innerHTML = str;
        });

        var myValue;
        ac.addEventListener("onconfirm", function(e) {    //鼠标点击下拉列表后的事件
            console.log("onconfirm");
            console.log(e);
            var _value = e.item.value;
            myValue = _value.province +  _value.city +  _value.district +  _value.street +  _value.business;
            //self.getElementById("searchResult").innerHTML ="onconfirm<br />index = " + e.item.index + "<br />myValue = " + myValue;
            setPlace();

            self.getPointPlace(myValue);

        });
    },

    // 根据地点进行标注
    getPointPlace: function(arr){
        var self = this;
        var myGeo = new BMap.Geocoder();
        for(var place in arr){
            myGeo.getPoint(arr[place], function(point){
                console.log(point);
                var marker = new BMap.Marker(point);        // 创建标注
                self.map.addOverlay(marker);                // 将标注添加到地图中
            },"全国");
        }
    },

    // 添加搜索提示
    addSuggestEvent: function(){
        var searchText = $('.searchText');
        var cnt = searchText.length;
        var i = 0;
        var inputId = "";
        for( ; i<cnt; i++){
            inputId = $(searchText[i]).attr('id');
            this.suggestEvent(inputId);
        }
    },

    addDrivingRoute: function(){
        var self = this;
        var transitSearch = function(start, end){
            var transit = new BMap.DrivingRoute(self.map,
                {
                    renderOptions: {
                        map: self.map,
                        panel:"",
                        enableDragging: true
                    },
                    onSearchComplete: function(results){
                        console.log("onSearchComplete...");
                        console.log(results);
                        if (transit.getStatus() != BMAP_STATUS_SUCCESS){
                            return ;
                        }

                    }
                }

            );
            transit.search(start,end);
        }



    },

    // 根据不同策略选择的驾车方式
    selStrategyDrive: function(arrPlace, value){
        var self = this;
        var routePolicy = [BMAP_DRIVING_POLICY_LEAST_TIME,BMAP_DRIVING_POLICY_LEAST_DISTANCE,BMAP_DRIVING_POLICY_AVOID_HIGHWAYS];
        arrPlace = self.util.trimArray(arrPlace);
        var len = arrPlace.length;
        var arrObj = [];
        self.map.clearOverlays();
        var resultsObj = [];
        var beginSearch = function(start, end){
            //三种驾车策略：最少时间，最短距离，避开高速
            search(start,end,routePolicy[value]); //最少时间
            function search(start,end,route){
                var transit = new BMap.DrivingRoute(self.map,
                    {
                        renderOptions: {
                            map: self.map,
                            panel:"",
                            enableDragging: true
                        },
                        onSearchComplete: function(results){
                            console.log("onSearchComplete...");
                            console.log(results);
                            if (transit.getStatus() != BMAP_STATUS_SUCCESS){
                                return ;
                            }
                            var plan = results.getPlan(0);
                            var start = results.getStart().city;
                            var end = results.getEnd().city;
                            var distance = plan.getDistance(false);
                            var time = plan.getDuration(false);
                            var weight = (value!=0 ? distance : time);
                            arrObj.push({start:start,end:end,weight:weight});
                            if(arrObj.length == (len*(len-1)/2)){
                                console.log(arrObj);
                                resultsObj = TravelRoute.Calc.startCalc(arrObj);

                            }
                        },
                        policy: route
                    }

                );
                transit.search(start,end);
            }
        };

        // 计算两两节点之间的距离和时间
        for(var i=0; i<arrPlace.length; i++){
            for(var j=i+1; j<arrPlace.length; j++){
                beginSearch(arrPlace[i], arrPlace[j]);
            }
        }
    },

    // 获取输入框的内容
    getInputContent: function(){
        // 获取输入框的内容
        var searchText = $('.searchText');
        var len = searchText.length;
        var i = 0;
        var arrContent = [];
        for( ; i<len; i++){
            arrContent.push($(searchText[i]).val());
        }
        console.log(arrContent);
        return arrContent;
    },

    // 运行时对DOM的修改
    runChange: function(){
        var self = this;

        var $addInput = $('.addInput');

        self.addSuggestEvent();




//        self.suggestEvent();

        $addInput.on("click", ".btnAdd", function(){
            //增加旅游点
            var $tpl = self.util.getTemplate("view", "searchAdd");
            var $addBtn = $(this).clone();
            console.log($addBtn);

            $tpl.insertBefore($addInput);
//            $(this).remove();
            /*var $input = $addBtn.insertAfter($addInput);
            $addBtn.insertAfter($input);*/
        });

        var $selStrategy = $('#selStrategy');
        var curValue = 0;
        $selStrategy.on("change", function(){
            curValue = $selStrategy.val();
        });

        $('.btnSearch').click(function(){

            var arrPlace = self.getInputContent();
            self.selStrategyDrive(arrPlace, curValue);
        });

    }

};
var travelRoute = TravelRoute.Map;

travelRoute.initialize();