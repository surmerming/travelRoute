TravelRoute.Map = {
    map: {},
    point: {},
    util: {},
    marker: {},
    objArr: [],
    start: "",      // 起点
    end: "",        // 终点

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
        // 运行中dom的操作
        self.runChange();
    },

    // 加载地图首先展示的页面
    originPresentation: function(){
        this.map = new BMap.Map("t_map_container");
        this.point = new BMap.Point(116.404, 39.915);
        this.map.centerAndZoom(this.point,12);
        // 将map设为全局变量
        TravelRoute.Config.Map = this.map;
    },
    // 设置起点
    setStart: function(start){
        this.start = start;
    },
    // 设置终点
    setEnd: function(end){
        this.end = end;
    },
    // 获取起点
    getStart: function(){
        return this.start;
    },
    // 获取终点
    getEnd: function(){
        return this.end;
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

    // 搜索提示
    doSearchSuggest: function(inputId){
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
                "input": "t_search_input",
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
    selStrategyDrive: function(arrPlace, opt){
        var self = this;
        // 多地点的起点和终点
        var gbStart = this.start || arrPlace[0];
        var gbEnd = this.end || arrPlace[arrPlace.length-1];

        var routePolicy = [BMAP_DRIVING_POLICY_LEAST_TIME,BMAP_DRIVING_POLICY_LEAST_DISTANCE,BMAP_DRIVING_POLICY_AVOID_HIGHWAYS];
        arrPlace = self.util.trimArray(arrPlace);
        self.map.clearOverlays();
        var arrayEdge = new Array();
        var arrLen = arrPlace.length;

        var beginSearch = function(start, end){
            //三种驾车策略：最少时间，最短距离，避开高速
            search(start,end,routePolicy[opt]); //最少时间
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
                            if (transit.getStatus() == BMAP_STATUS_SUCCESS){
                                var plan = results.getPlan(0);
                                /*var start = results.getStart().city;
                                var end = results.getEnd().city;*/
                                var distance = plan.getDistance(false);
                                var time = plan.getDuration(false);

                                var value = (value!=0 ? distance : time);
                                arrayEdge.push(new Edge(start, end, value));

                                if(arrayEdge.length == (arrLen*(arrLen-1)/2)){
                                    console.log(arrayEdge);
                                    self.map.clearOverlays();
                                    TravelRoute.Calc.init(gbStart,gbEnd,arrayEdge);
                                    var routeResults = TravelRoute.Calc.showCalResults();
                                    console.log("oYe");
                                    self.resultsRouteAdd(routeResults, route);

                                }
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

    resultsRouteAdd: function(routeResults, policyVal){
        var len = routeResults.length;
        for(var i in routeResults){
            if(i<len-1){
                this.addDrivingRoute(routeResults[i], routeResults[i+1], policyVal);
            }

        }
    },

    addDrivingRoute: function(start, end, policyVal){
        var self = this;
        var transit = new BMap.DrivingRoute(self.map,
            {
                renderOptions: {
                    map: self.map,
                    panel:"",
                    enableDragging: true
                },
                onSearchComplete: function(results){
                    console.log("onSearchComplete...");
                    if (transit.getStatus() == BMAP_STATUS_SUCCESS){

                    }

                },
                policy: policyVal
            }

        );
        transit.search(start,end);
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

    // 添加右键菜单
    addContextMenu: function(){
        var self = this;
        var contextMenu = new BMap.ContextMenu();
        var txtMenuItem = [
            {
                text:'放大',
                callback:function(){self.map.zoomIn()}
            },
            {
                text:'缩小',
                callback:function(){self.map.zoomOut()}
            },
            {
                text:'放置到最大级',
                callback:function(){self.map.setZoom(18)}
            },
            {
                text:'查看全国',
                callback:function(){self.map.setZoom(4)}
            },
            {
                text:'在此添加标注',
                callback:function(p){
                    var marker = new BMap.Marker(p),
                        px = self.map.pointToPixel(p);
                    self.map.addOverlay(marker);
                }
            }
        ];


        for(var i=0; i < txtMenuItem.length; i++){
            contextMenu.addItem(new BMap.MenuItem(txtMenuItem[i].text,txtMenuItem[i].callback,100));
            if(i==1 || i==3) {
                contextMenu.addSeparator();
            }
        }
        self.map.addContextMenu(contextMenu);
    },

    // 运行时对DOM的修改
    runChange: function(){
        var self = this;

        // 搜索提示
        self.doSearchSuggest();

        // 添加右键菜单
        self.addContextMenu();

        var curStrategy = 0;

        // 策略选择项
        $('.t_select_name').on("change", function(){
            curStrategy = $(this).val();
        });

        // 进行DOM操作
        $('#t_place_add_btn').click(function(){
            var obj = {};
            var place = $('#t_search_input').val();
            if(place != ""){
                obj.place = place;
                var $tpl = self.util.getTemplate("view", "placeItem", obj);
                $("#t_place_area").append($tpl);
                $('#t_search_input').val("");
            }
            return false;
        });
        // 取消地点
        $('#t_place_area').on('click','.t_place_item_cancel',function(){
            $(this).parent().remove();
        });
        // 多个地点查询
        $('#t_btnSearch').click(function(){
            var liLen = $('#t_place_area').children('li').length;
            if(liLen<2){
                alert("请添加多个地点。。。");
                return false;
            }else{
                var $ulPlaces = $('#t_place_area');
                var $liItem = $ulPlaces.children('.t_place_item');
                var arrPlaces = [];
                for(var i=0; i<liLen; i++){
                    var place = $($liItem[i]).find('.t_place_item_content').text();
                    arrPlaces.push(place);
                }
                self.selStrategyDrive(arrPlaces, curStrategy);
            }
        });


    },

    drivingRoute: function(){
        var self = this;
        //三种驾车策略：最少时间，最短距离，避开高速
        var routePolicy = [BMAP_DRIVING_POLICY_LEAST_TIME,BMAP_DRIVING_POLICY_LEAST_DISTANCE,BMAP_DRIVING_POLICY_AVOID_HIGHWAYS];
        /*var start = "厦门";
        var end = "泉州";*/

        var transit = new BMap.DrivingRoute(self.map, {
            renderOptions: {map: self.map,panel:"searchResult"},
            policy: routePolicy[0],
            onSearchComplete: function(results){
                /*console.log(results);
                *//*self.addOverlay(results);*//*
                var plan = results.getPlan(0);
                var start = results.getStart().city;
                var end = results.getEnd().city;
                var distance = plan.getDistance(false);
                var time = plan.getDuration(false);
//                var weight = (value!=0 ? distance : time);
                var weight = distance;
                self.objArr.push({start:start,end:end,weight:weight});

                self.map.clearOverlays();*/
                if (transit.getStatus() == BMAP_STATUS_SUCCESS) {
                    // 添加覆盖层
                    self.addOverlay(results);
                    // 添加文字
                    self.addText(results);
                }


            }

        });
        transit.search(start,end);
    },
    // 添加起点
    addStart: function(point, title){
        this.map.addOverlay(new BMap.Marker(point, {
            title: title,
            icon: new BMap.Icon('assets/images/icon_markf.png', new BMap.Size(38, 41), {
                anchor: new BMap.Size(4, 36)
            })}));

    },
    // 添加终点
    addEnd: function(point, title){
        this.map.addOverlay(new BMap.Marker(point, {
            title: title,
            icon: new BMap.Icon('assets/images/icon_markf.png', new BMap.Size(38, 41), {
                anchor: new BMap.Size(4, 36)
            })}));
    },
    // 添加覆盖层
    addOverlay: function(results){
        var start = results.getStart();
        var end = results.getEnd();
        this.addStart(start.point, start.title);
        this.addEnd(end.point, end.title);
        var viewPoints = [start.point, end.point];
        var plan = results.getPlan(0);

        for (var i =0; i < plan.getNumRoutes(); i ++) {
            this.addRoute(plan.getRoute(i).getPath());
            viewPoints.concat(plan.getRoute(i).getPath());
        }
        this.map.setViewport(viewPoints, {
            margins: [40, 10, 10, 10]
        });
    },
    // 添加文字
    addText: function(results){
        var plan = results.getPlan(0);

        var htmls = [];
        for (var i =0; i < plan.getNumRoutes(); i ++) {
            var route = plan.getRoute(i);
            for (var j =0; j < route.getNumSteps(); j ++) {
                var curStep = route.getStep(j);
                htmls.push((j +1) +'. '+ curStep.getDescription() +'<br />');
            }
        }
        var panel = document.getElementById('panel');
        panel.innerHTML = htmls.join('');
        panel.style.lineHeight ='1.4em';
        panel.style.fontSize ='12px';
    },

    addRoute: function(path){
       this.map.addOverlay(new BMap.Polyline(path, {
            strokeColor: '#333',
            enableClicking: false
        }));
    }

};
var travelRoute = TravelRoute.Map;

travelRoute.initialize();