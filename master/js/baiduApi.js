

var Journey = {};

Journey.prototype = {
    map: {},
    point: {},

    initialize: function(){
        var self = this;

        //首先呈现的界面
        self.originPresentation();

        // localCity居中显示
        self.centerByLocalCity();

        // 修改配置
        self.modDefaults();

        // 事件操作
        self.startRunning();

    },

    // 加载地图首先展示的页面
    originPresentation: function(){
        this.map = new BMap.Map("container");
        this.point = new BMap.Point(116.404, 39.915);
        this.map.centerAndZoom(this.point,12);


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

    suggestEvent: function(){
        var self = this;

        // 设置地点
        var setPlace = function(){
            self.map.clearOverlays();    //清除地图上所有覆盖物
            var local = new BMap.LocalSearch(self.map, { //智能搜索
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
                "input": "cityInput",
                "location": self.map
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

    getPointPlace: function(place){
        var self = this;
        var myGeo = new BMap.Geocoder();
        myGeo.getPoint(place, function(point){
            console.log(point);
            var marker = new BMap.Marker(point);        // 创建标注
            self.map.addOverlay(marker);                     // 将标注添加到地图中
        },"全国");

    },

    // 事件操作
    startRunning: function(){
        var self = this;
        // 搜索提示事件
        self.suggestEvent();

        // 计算距离
        self.calcDistance();

    },



    // 地址解析
    addressResolve: function(){
        var myGeo = new BMap.Geocoder();
        // 将地址解析结果显示在地图上,并调整地图视野
        myGeo.getPoint("北京市海淀区上地10街", function(point){
            if (point) {
                self.map.centerAndZoom(point, 16);
                self.map.addOverlay(new BMap.Marker(point));
            }
        }, "北京市");
    },

    // 反地址解析
    reAddressResolve: function(){
        var self = this;
        var gc = new BMap.Geocoder();

        self.map.addEventListener("click", function(e){
            var pt = e.point;
            gc.getLocation(pt, function(rs){
                var addComp = rs.addressComponents;
                alert(addComp.province + ", " + addComp.city + ", " + addComp.district + ", " + addComp.street + ", " + addComp.streetNumber);
            });
        });
    },

    // 批量地址解析
    manyAddressResolve: function(){
        var index = 0;
        var myGeo = new BMap.Geocoder();
        var adds = [
            "包河区金寨路1号（金寨路与望江西路交叉口）",
            "庐阳区凤台路209号（凤台路与蒙城北路交叉口）",
            "蜀山区金寨路217号(近安医附院公交车站)",
            "蜀山区梅山路10号(近安徽饭店) ",
            "蜀山区 长丰南路159号铜锣湾广场312室",
            "合肥市寿春路93号钱柜星乐町KTV（逍遥津公园对面）",
            "庐阳区长江中路177号",
            "新站区胜利路89"
        ];

        function bdGEO(){
            var add = adds[index];
            geocodeSearch(add);
            index++;
        }
        function geocodeSearch(add){
            if(index < adds.length){
                setTimeout(window.bdGEO,300);
            }
            myGeo.getPoint(add, function(point){
                if (point) {
                    document.getElementById("result").innerHTML +=  index + "、" + add + ":" + point.lng + "," + point.lat + "</br>";
                    var marker = new BMap.Marker(new BMap.Point(point.lng, point.lat));
                    map.addOverlay(marker);
                }
            }, "合肥市");
        }
    },

    // 批量反地址解析
    manyReAddressResolve: function(){
        var index = 0;
        var myGeo = new BMap.Geocoder();
        var adds = [
            new BMap.Point(116.307852,40.057031),
            new BMap.Point(116.313082,40.047674),
            new BMap.Point(116.328749,40.026922),
            new BMap.Point(116.347571,39.988698),
            new BMap.Point(116.316163,39.997753),
            new BMap.Point(116.345867,39.998333),
            new BMap.Point(116.403472,39.999411),
            new BMap.Point(116.307901,40.05901)
        ];

        for(var i = 0; i<adds.length; i++){
            var marker = new BMap.Marker(adds[i]);
            map.addOverlay(marker);
        }


        function bdGEO(){
            var pt = adds[index];
            geocodeSearch(pt);
            index++;
        }
        function geocodeSearch(pt){
            if(index < adds.length){
                setTimeout(window.bdGEO,300);
            }
            myGeo.getLocation(pt, function(rs){
                var addComp = rs.addressComponents;
                document.getElementById("result").innerHTML += index + ". " +adds[index-1].lng + "," + adds[index-1].lat + "："  + "商圈(" + rs.business + ")  结构化数据(" + addComp.province + ", " + addComp.city + ", " + addComp.district + ", " + addComp.street + ", " + addComp.streetNumber + ")<br/><br/>";
            });
        }
    },

    // 浏览器位置定位
    getBrowserPosition: function(){
        var geolocation = new BMap.Geolocation();
        geolocation.getCurrentPosition(function(r){
            if(this.getStatus() == BMAP_STATUS_SUCCESS){
                var mk = new BMap.Marker(r.point);
                map.addOverlay(mk);
                map.panTo(r.point);
                alert('您的位置：'+r.point.lng+','+r.point.lat);
            }
            else {
                alert('failed'+this.getStatus());
            }
        },{enableHighAccuracy: true})
        //关于状态码
        //BMAP_STATUS_SUCCESS	检索成功。对应数值“0”。
        //BMAP_STATUS_CITY_LIST	城市列表。对应数值“1”。
        //BMAP_STATUS_UNKNOWN_LOCATION	位置结果未知。对应数值“2”。
        //BMAP_STATUS_UNKNOWN_ROUTE	导航结果未知。对应数值“3”。
        //BMAP_STATUS_INVALID_KEY	非法密钥。对应数值“4”。
        //BMAP_STATUS_INVALID_REQUEST	非法请求。对应数值“5”。
        //BMAP_STATUS_PERMISSION_DENIED	没有权限。对应数值“6”。(自 1.1 新增)
        //BMAP_STATUS_SERVICE_UNAVAILABLE	服务不可用。对应数值“7”。(自 1.1 新增)
        //BMAP_STATUS_TIMEOUT	超时。对应数值“8”。(自 1.1 新增)
    },

    // IP获取当前城市
    getCurrentCityByIp: function(){
        function myFun(result){
            var cityName = result.name;
            map.setCenter(cityName);
            alert(cityName);
        }
        var myCity = new BMap.LocalCity();
        myCity.get(myFun);
    },

    // 步行获取导航检索
    searchByWalkingRoute: function(){
        var walking = new BMap.WalkingRoute(map, {renderOptions:{map: map, autoViewport: true}});
        walking.search("天坛公园", "故宫");
    },

    // 获取步行导航的数据接口集
    getDetailByWalkingRoute: function(){
        var walking = new BMap.WalkingRoute(map, {renderOptions: {map: map, panel: "r-result", autoViewport: true}});
        walking.search("天坛公园", "故宫");
    },

    // 根据起终点名称驾车导航
    getDriveNavByStartAndEnd: function(){
        var driving = new BMap.DrivingRoute(map, {renderOptions:{map: map, autoViewport: true}});
        driving.search("天安门", "百度大厦");
    },

    // 根据起终点经纬度驾车导航
    getDriveNavByLatLng: function(){
        var p1 = new BMap.Point(116.301934,39.977552);
        var p2 = new BMap.Point(116.508328,39.919141);

        var driving = new BMap.DrivingRoute(map, {renderOptions:{map: map, autoViewport: true}});
        driving.search(p1, p2);
    },

    // 按不同策略的驾车导航
    getDriveNavByPolicy: function(){
        var start = "魏公村";
        var end = "百度大厦";
        //三种驾车策略：最少时间，最短距离，避开高速
        var routePolicy = [BMAP_DRIVING_POLICY_LEAST_TIME,BMAP_DRIVING_POLICY_LEAST_DISTANCE,BMAP_DRIVING_POLICY_AVOID_HIGHWAYS];
        search(start,end,routePolicy[0]); //最少时间
        function search(start,end,route){
            var transit = new BMap.DrivingRoute(map, {
                renderOptions: {map: map,panel:"r-result"},
                policy: route
            });
            transit.search(start,end);
        }
    },

    // 起终点可拖拽的驾车导航
    getDriveNavEnableDrag: function(){
        var transit = new BMap.DrivingRoute(map, {
            renderOptions: {
                map: map,
                panel: "r-result",
                enableDragging : true //起终点可进行拖拽
            }
        });
        transit.search("西单","魏公村");
    },

    // 计算驾车时间和距离
    calcDistanceAndTime: function(){
        var self = this;
        var output = "从上地到西单驾车需要";
        var transit = new BMap.DrivingRoute(self.map, {renderOptions: {map: self.map},
            onSearchComplete: function(results){
                if (transit.getStatus() != BMAP_STATUS_SUCCESS){
                    return ;
                }

                var plan = results.getPlan(0);
                output += plan.getDuration(true) + "\n";                //获取时间
                output += "总路程为：" ;
                output += plan.getDistance(true) + "\n";             //获取距离
            },
            onPolylinesSet: function(){
                setTimeout(function(){alert(output)},"1000");
            }});
        transit.search("上地", "西单");
    },

    // 计算打车费用
    calcFeeByTaxi: function(){
        var driving = new BMap.DrivingRoute(map, {onSearchComplete:yyy,renderOptions:{map: map, autoViewport: true}});
        driving.search("安定门", "王府井");   //驾车查询
        function yyy(rs){
            alert("从安定门到王府井打车总费用为："+rs.taxiFare.day.totalFare+"元");     //计算出白天的打车费用的总价
        }
    },

    // 驾车导航的数据接口
    getDetailByDrive: function(){
        var options = {
            onSearchComplete: function(results){
                if (driving.getStatus() == BMAP_STATUS_SUCCESS){
                    // 获取第一条方案
                    var plan = results.getPlan(0);

                    // 获取方案的驾车线路
                    var route = plan.getRoute(0);

                    // 获取每个关键步骤,并输出到页面
                    var s = [];
                    for (var i = 0; i < route.getNumSteps(); i ++){
                        var step = route.getStep(i);
                        s.push((i + 1) + ". " + step.getDescription());
                    }
                    document.getElementById("r-result").innerHTML = s.join("<br/>");
                }
            }
        };
        var driving = new BMap.DrivingRoute(map, options);
        driving.search("天安门", "百度大厦");
    },

    // 根据关键字本地搜索
    localSearchByKey: function(){
        var local = new BMap.LocalSearch(map, {
            renderOptions:{map: map}
        });
        local.search("景点");
    },

    // 搜索区域内关键词
    boundsSearchByKey: function(){
        map.enableScrollWheelZoom();                            //启用滚轮放大缩小

        var local = new BMap.LocalSearch(map, {
            renderOptions:{map: map}
        });
        var pStart = new BMap.Point(116.274625,39.961627);
        var pEnd = new BMap.Point(116.367474,39.988609);
        var bs = new BMap.Bounds(pStart,pEnd);   //自己规定范围
        local.searchInBounds("银行", bs);

        var polygon = new BMap.Polygon([
            new BMap.Point(pStart.lng,pStart.lat),
            new BMap.Point(pEnd.lng,pStart.lat),
            new BMap.Point(pEnd.lng,pEnd.lat),
            new BMap.Point(pStart.lng,pEnd.lat)
        ], {strokeColor:"blue", strokeWeight:6, strokeOpacity:0.5});
        map.addOverlay(polygon);
    },

    // 根据多关键字本地搜索
    localSearchByMultiKey: function(){
        var myKeys = ["酒店", "加油站"];
        var local = new BMap.LocalSearch(map, {
            renderOptions:{map: map, panel:"r-result"}
        });
        local.setPageCapacity(15);
        local.searchInBounds(myKeys, map.getBounds());
    },

    // 本地搜索的数据接口
    localSearchDetail: function(){
        var options = {
            onSearchComplete: function(results){
                // 判断状态是否正确
                if (local.getStatus() == BMAP_STATUS_SUCCESS){
                    var s = [];
                    for (var i = 0; i < results.getCurrentNumPois(); i ++){
                        s.push(results.getPoi(i).title + ", " + results.getPoi(i).address);
                    }
                    document.getElementById("r-result").innerHTML = s.join("<br/>");
                }
            }
        };
        var local = new BMap.LocalSearch(map, options);
        local.search("公园");
    },

    // 自定义样式的数据接口
    customStyleDetail: function(){
        window.openInfoWinFuns = null;
        var options = {
            onSearchComplete: function(results){
                // 判断状态是否正确
                if (local.getStatus() == BMAP_STATUS_SUCCESS){
                    var s = [];
                    s.push('<div style="font-family: arial,sans-serif; border: 1px solid rgb(153, 153, 153); font-size: 12px;">');
                    s.push('<div style="background: none repeat scroll 0% 0% rgb(255, 255, 255);">');
                    s.push('<ol style="list-style: none outside none; padding: 0pt; margin: 0pt;">');
                    openInfoWinFuns = [];
                    for (var i = 0; i < results.getCurrentNumPois(); i ++){
                        var marker = addMarker(results.getPoi(i).point,i);
                        var openInfoWinFun = addInfoWindow(marker,results.getPoi(i),i);
                        openInfoWinFuns.push(openInfoWinFun);
                        // 默认打开第一标注的信息窗口
                        var selected = "";
                        if(i == 0){
                            selected = "background-color:#f0f0f0;";
                            openInfoWinFun();
                        }
                        s.push('<li id="list' + i + '" style="margin: 2px 0pt; padding: 0pt 5px 0pt 3px; cursor: pointer; overflow: hidden; line-height: 17px;' + selected + '" onclick="openInfoWinFuns[' + i + ']()">');
                        s.push('<span style="width:1px;background:url(red_labels.gif) 0 ' + ( 2 - i*20 ) + 'px no-repeat;padding-left:10px;margin-right:3px"> </span>');
                        s.push('<span style="color:#00c;text-decoration:underline">' + results.getPoi(i).title.replace(new RegExp(results.keyword,"g"),'<b>' + results.keyword + '</b>') + '</span>');
                        s.push('<span style="color:#666;"> - ' + results.getPoi(i).address + '</span>');
                        s.push('</li>');
                        s.push('');
                    }
                    s.push('</ol></div></div>');
                    document.getElementById("r-result").innerHTML = s.join("");
                }
            }
        };

        // 添加标注
        function addMarker(point, index){
            var myIcon = new BMap.Icon("http://api.map.baidu.com/img/markers.png", new BMap.Size(23, 25), {
                offset: new BMap.Size(10, 25),
                imageOffset: new BMap.Size(0, 0 - index * 25)
            });
            var marker = new BMap.Marker(point, {icon: myIcon});
            map.addOverlay(marker);
            return marker;
        }
        // 添加信息窗口
        function addInfoWindow(marker,poi,index){
            var maxLen = 10;
            var name = null;
            if(poi.type == BMAP_POI_TYPE_NORMAL){
                name = "地址：  "
            }else if(poi.type == BMAP_POI_TYPE_BUSSTOP){
                name = "公交：  "
            }else if(poi.type == BMAP_POI_TYPE_SUBSTOP){
                name = "地铁：  "
            }
            // infowindow的标题
            var infoWindowTitle = '<div style="font-weight:bold;color:#CE5521;font-size:14px">'+poi.title+'</div>';
            // infowindow的显示信息
            var infoWindowHtml = [];
            infoWindowHtml.push('<table cellspacing="0" style="table-layout:fixed;width:100%;font:12px arial,simsun,sans-serif"><tbody>');
            infoWindowHtml.push('<tr>');
            infoWindowHtml.push('<td style="vertical-align:top;line-height:16px;width:38px;white-space:nowrap;word-break:keep-all">' + name + '</td>');
            infoWindowHtml.push('<td style="vertical-align:top;line-height:16px">' + poi.address + ' </td>');
            infoWindowHtml.push('</tr>');
            infoWindowHtml.push('</tbody></table>');
            var infoWindow = new BMap.InfoWindow(infoWindowHtml.join(""),{title:infoWindowTitle,width:200});
            var openInfoWinFun = function(){
                marker.openInfoWindow(infoWindow);
                for(var cnt = 0; cnt < maxLen; cnt++){
                    if(!document.getElementById("list" + cnt)){continue;}
                    if(cnt == index){
                        document.getElementById("list" + cnt).style.backgroundColor = "#f0f0f0";
                    }else{
                        document.getElementById("list" + cnt).style.backgroundColor = "#fff";
                    }
                }
            }
            marker.addEventListener("click", openInfoWinFun);
            return openInfoWinFun;
        }
        var local = new BMap.LocalSearch(map, options);
        local.search("酒店");
    },

    // 本地搜索的结果面板
    localSearchResultsPanel: function(){
        var local = new BMap.LocalSearch(map, {
            renderOptions: {map: map, panel: "r-result"}
        });
        local.search("餐饮");
    },

    // 根据中心点关键字周边搜索
    surroundSearchByKey: function(){
        var local = new BMap.LocalSearch(map, {
            renderOptions:{map: map, autoViewport:true}
        });
        local.searchNearby("小吃", "前门");
    },

    // 根据关键字全国范围搜索
    searchFromNationByKey: function(){
        var local = new BMap.LocalSearch("全国", {
            renderOptions: {
                map: map,
                panel : "r-result",
                autoViewport: true,
                selectFirstResult: false
            }
        });
        local.search("南京路");
    },

    // 图块加载完毕
    picBlockLoaded: function(){
        map.addEventListener("tilesloaded",function(){alert("地图加载完毕");});

    },

    // 拖拽地图后获取中心点经纬度
    getCenterLatLngAfterDragged: function(){
        map.addEventListener("dragend", function showInfo(){
            var cp = map.getCenter();
            alert(cp.lng + "," + cp.lat);
        });
    },

    // 点击地图获取当前经纬度
    getLatLngByClick: function(){
        function showInfo(e){
            alert(e.point.lng + ", " + e.point.lat);
        }
        map.addEventListener("click", showInfo);
    },

    // 在事件监听函数中操作当前对象
    operateCurrentObj: function(){
        map.enableScrollWheelZoom();
        map.addEventListener("zoomend", function(){
            alert("地图缩放至：" + this.getZoom() + "级");
        });
    },

    // 移除已注册的事件监听函数
    removeRegisterEvent: function(){
        function showInfo(e){
            alert(e.point.lng + ", " + e.point.lat);
            map.removeEventListener("click", showInfo);
        }
        map.addEventListener("click", showInfo);
    },

    // 鼠标测距
    measureDistanceByMouse: function(){
        var myDis = new BMapLib.DistanceTool(map);
        map.addEventListener("load",function(){
            myDis.open();  //开启鼠标测距
            //myDis.close();  //关闭鼠标测距大
        });
    },

    // 添加简单右键菜单
    addRightMenu: function(){
        var menu = new BMap.ContextMenu();
        var txtMenuItem = [
            {
                text:'放大',
                callback:function(){map.zoomIn()}
            },
            {
                text:'缩小',
                callback:function(){map.zoomOut()}
            }
        ];


        for(var i=0; i < txtMenuItem.length; i++){
            menu.addItem(new BMap.MenuItem(txtMenuItem[i].text,txtMenuItem[i].callback,100));
        }

        map.addContextMenu(menu);
    },

    //添加带分割线的右键菜单
    addRightMenuWithSeparator: function(){
        var menu = new BMap.ContextMenu();
        var txtMenuItem = [
            {
                text:'放大',
                callback:function(){map.zoomIn()}
            },
            {
                text:'缩小',
                callback:function(){map.zoomOut()}
            },
            {
                text:'放置到最大级',
                callback:function(){map.setZoom(18)}
            },
            {
                text:'查看全国',
                callback:function(){map.setZoom(4)}
            }
        ];


        for(var i=0; i < txtMenuItem.length; i++){
            menu.addItem(new BMap.MenuItem(txtMenuItem[i].text,txtMenuItem[i].callback,100));
            if(i==1){
                menu.addSeparator();
            }
        }
        map.addContextMenu(menu);
    },

    // 右键菜单添加标注
    addMarkerByRightMenu: function(){
        var contextMenu = new BMap.ContextMenu();
        var txtMenuItem = [
            {
                text:'放大',
                callback:function(){map.zoomIn()}
            },
            {
                text:'缩小',
                callback:function(){map.zoomOut()}
            },
            {
                text:'放置到最大级',
                callback:function(){map.setZoom(18)}
            },
            {
                text:'查看全国',
                callback:function(){map.setZoom(4)}
            },
            {
                text:'在此添加标注',
                callback:function(p){
                    var marker = new BMap.Marker(p), px = map.pointToPixel(p);
                    map.addOverlay(marker);
                }
            }
        ];


        for(var i=0; i < txtMenuItem.length; i++){
            contextMenu.addItem(new BMap.MenuItem(txtMenuItem[i].text,txtMenuItem[i].callback,100));
            if(i==1 || i==3) {
                contextMenu.addSeparator();
            }
        }
        map.addContextMenu(contextMenu);
    },

    //添加纯文本的信息窗口
    addTxtInfoWin: function(){
        var opts = {
            width : 200,     // 信息窗口宽度
            height: 60,     // 信息窗口高度
            title : "海底捞王府井店" , // 信息窗口标题
            enableMessage:true,//设置允许信息窗发送短息
            message:"亲耐滴，晚上一起吃个饭吧？戳下面的链接看下地址喔~"
        }
        var infoWindow = new BMap.InfoWindow("地址：北京市东城区王府井大街88号乐天银泰百货八层", opts);  // 创建信息窗口对象
        map.openInfoWindow(infoWindow,point); //开启信息窗口
    },

    // 添加复杂内容的信息窗口
    addComplexInfoWin: function(){
        var marker = new BMap.Marker(point);
        var infoWindow = new BMap.InfoWindow(sContent);  // 创建信息窗口对象
        map.centerAndZoom(point, 15);
        map.addOverlay(marker);
        marker.addEventListener("click", function(){
            this.openInfoWindow(infoWindow);
            //图片加载完毕重绘infowindow
            document.getElementById('imgDemo').onload = function (){
                infoWindow.redraw();   //防止在网速较慢，图片未加载时，生成的信息框高度比图片的总高度小，导致图片部分被隐藏
            }
        });
    },

    // 获取信息窗口的信息
    getInfoWinInfo: function(){
        var infoWindow = new BMap.InfoWindow(sContent);  // 创建信息窗口对象
        map.openInfoWindow(infoWindow,point); //开启信息窗口
        document.getElementById("r-result").innerHTML = "信息窗口的内容是：<br />" + infoWindow.getContent();
    },

    addBaiduStyleInfoWin: function(){
        var content = '<div style="margin:0;line-height:20px;padding:2px;">' +
            '<img src="../img/baidu.jpg" alt="" style="float:right;zoom:1;overflow:hidden;width:100px;height:100px;margin-left:3px;"/>' +
            '地址：北京市海淀区上地十街10号<br/>电话：(010)59928888<br/>简介：百度大厦位于北京市海淀区西二旗地铁站附近，为百度公司综合研发及办公总部。' +
            '</div>';

        //创建检索信息窗口对象
        var searchInfoWindow = null;
        searchInfoWindow = new BMapLib.SearchInfoWindow(map, content, {
            title  : "百度大厦",      //标题
            width  : 290,             //宽度
            height : 105,              //高度
            panel  : "panel",         //检索结果面板
            enableAutoPan : true,     //自动平移
            searchTypes   :[
                BMAPLIB_TAB_SEARCH,   //周边检索
                BMAPLIB_TAB_TO_HERE,  //到这里去
                BMAPLIB_TAB_FROM_HERE //从这里出发
            ]
        });
        var marker = new BMap.Marker(poi); //创建marker对象
        marker.enableDragging(); //marker可拖拽
        marker.addEventListener("click", function(e){
            searchInfoWindow.open(marker);
        })
        map.addOverlay(marker); //在地图中添加marker
        searchInfoWindow.open(marker); //在marker上打开检索信息串口
        $("close").onclick = function(){
            searchInfoWindow.close();
        }
        $("open").onclick = function(){
            var enableSendToPhone = false;
            if ($("enableSendToPhone").checked) {
                enableSendToPhone = true;
            }
            searchInfoWindow = new BMapLib.SearchInfoWindow(map, content, {
                title  : "百度大厦",      //标题
                width  : 290,             //宽度
                height : 105,              //高度
                panel  : "panel",         //检索结果面板
                enableAutoPan : true,     //自动平移
                enableSendToPhone: enableSendToPhone, //是否启用发送到手机
                searchTypes   :[
                    BMAPLIB_TAB_SEARCH,   //周边检索
                    BMAPLIB_TAB_TO_HERE,  //到这里去
                    BMAPLIB_TAB_FROM_HERE //从这里出发
                ]
            });
            if ($("enableAutoPan").checked) {
                searchInfoWindow.enableAutoPan();
            } else {
                searchInfoWindow.disableAutoPan();
            };
            searchInfoWindow.open(marker);
        }
        $("show").onclick = function(){
            searchInfoWindow.show();
        }
        $("hide").onclick = function(){
            searchInfoWindow.hide();
        }
        $("getPosition").onclick = function(){
            var position = searchInfoWindow.getPosition();
            alert("经度：" + position.lng + "；纬度：" + position.lat);
        }
        $("setValue").onclick = function(){
            searchInfoWindow.setPosition(new BMap.Point($("lng").value, $("lat").value));
            searchInfoWindow.setTitle($("title").value);
            searchInfoWindow.setContent($("content").value);
        }
        $("getContent").onclick = function(){
            alert(searchInfoWindow.getContent());
        }
        $("getTitle").onclick = function(){
            alert(searchInfoWindow.getTitle());
        }
        function $(id){
            return document.getElementById(id);
        }

//样式1
        var searchInfoWindow1 = new BMapLib.SearchInfoWindow(map, "信息框1内容", {
            title: "信息框1", //标题
            panel : "panel", //检索结果面板
            enableAutoPan : true, //自动平移
            searchTypes :[
                BMAPLIB_TAB_FROM_HERE, //从这里出发
                BMAPLIB_TAB_SEARCH   //周边检索
            ]
        });
        function openInfoWindow1() {
            searchInfoWindow1.open(new BMap.Point(116.319852,40.057031));
        }

//样式2
        var searchInfoWindow2 = new BMapLib.SearchInfoWindow(map, "信息框2内容", {
            title: "信息框2", //标题
            panel : "panel", //检索结果面板
            enableAutoPan : true, //自动平移
            searchTypes :[
                BMAPLIB_TAB_SEARCH   //周边检索
            ]
        });
        function openInfoWindow2() {
            searchInfoWindow2.open(new BMap.Point(116.324852,40.057031));
        }

//样式3
        var searchInfoWindow3 = new BMapLib.SearchInfoWindow(map, "信息框3内容", {
            title: "信息框3", //标题
            width: 290, //宽度
            height: 40, //高度
            panel : "panel", //检索结果面板
            enableAutoPan : true, //自动平移
            searchTypes :[
            ]
        });
        function openInfoWindow3() {
            searchInfoWindow3.open(new BMap.Point(116.328852,40.057031));
        }


        var isPanelShow = false;
        //显示结果面板动作
        $("showPanelBtn").onclick = function(){
            if (isPanelShow == false) {
                isPanelShow = true;
                $("showPanelBtn").style.right = "300px";
                $("panelWrap").style.width = "300px";
                $("map").style.marginRight = "300px";
                $("showPanelBtn").innerHTML = "隐藏检索结果面板<br/>>";
            } else {
                isPanelShow = false;
                $("showPanelBtn").style.right = "0px";
                $("panelWrap").style.width = "0px";
                $("map").style.marginRight = "0px";
                $("showPanelBtn").innerHTML = "显示检索结果面板<br/><";
            }
        }
    },

    // 添加普通标注点
    addGeneralMarker: function(){
        var marker1 = new BMap.Marker(new BMap.Point(116.384, 39.925));  // 创建标注
        map.addOverlay(marker1);              // 将标注添加到地图中

        //创建信息窗口
        var infoWindow1 = new BMap.InfoWindow("普通标注");
        marker1.addEventListener("click", function(){this.openInfoWindow(infoWindow1);});


        //创建小狐狸
        var pt = new BMap.Point(116.417, 39.909);
        var myIcon = new BMap.Icon("fox.gif", new BMap.Size(300,157));
        var marker2 = new BMap.Marker(pt,{icon:myIcon});  // 创建标注
        map.addOverlay(marker2);              // 将标注添加到地图中

        //让小狐狸说话（创建信息窗口）
        var infoWindow2 = new BMap.InfoWindow("<p style='font-size:14px;'>哈哈，你看见我啦！我可不常出现哦！</p><p style='font-size:14px;'>赶快查看源代码，看看我是如何添加上来的！</p>");
        marker2.addEventListener("click", function(){this.openInfoWindow(infoWindow2);});
    },

    // 添加动画标注点
    addAniMarker: function(){
        var marker = new BMap.Marker(point);  // 创建标注
        map.addOverlay(marker);              // 将标注添加到地图中
        marker.setAnimation(BMAP_ANIMATION_BOUNCE); //跳动的动画
    },

    // 添加多个标注点
    addMultiMarker: function(){
        // 编写自定义函数,创建标注
        function addMarker(point){
            var marker = new BMap.Marker(point);
            map.addOverlay(marker);
        }
        // 随机向地图添加25个标注
        var bounds = map.getBounds();
        var sw = bounds.getSouthWest();
        var ne = bounds.getNorthEast();
        var lngSpan = Math.abs(sw.lng - ne.lng);
        var latSpan = Math.abs(ne.lat - sw.lat);
        for (var i = 0; i < 25; i ++) {
            var point = new BMap.Point(sw.lng + lngSpan * (Math.random() * 0.7), ne.lat - latSpan * (Math.random() * 0.7));
            addMarker(point);
        }
    },

    // 点聚合
    pointTogether: function(){
        var MAX = 10;
        var markers = [];
        var pt = null;
        var i = 0;
        for (; i < MAX; i++) {
            pt = new BMap.Point(Math.random() * 40 + 85, Math.random() * 30 + 21);
            markers.push(new BMap.Marker(pt));
        }
        //最简单的用法，生成一个marker数组，然后调用markerClusterer类即可。
        var markerClusterer = new BMapLib.MarkerClusterer(map, {markers:markers});
    },

    // 添加折线
    addPolyLine: function(){
        var polyline = new BMap.Polyline([
            new BMap.Point(116.399, 39.910),
            new BMap.Point(116.405, 39.920),
            new BMap.Point(116.425, 39.900)
        ], {strokeColor:"blue", strokeWeight:6, strokeOpacity:0.5});
        map.addOverlay(polyline);
    },

    // 添加文本标注
    addTxtMarker: function(){
        var opts = {
            position : point,    // 指定文本标注所在的地理位置
            offset   : new BMap.Size(30, -30)    //设置文本偏移量

        }
        var label = new BMap.Label("欢迎使用百度地图，这是一个简单的文本标注哦~", opts);  // 创建文本标注对象
        label.setStyle({
            color : "red",
            fontSize : "12px",
            height : "20px",
            lineHeight : "20px",
            fontFamily:"微软雅黑"
        });
        map.addOverlay(label);
    },

    // 添加热区
    addHotSpot: function(){
        //在天安门添加一个热区,鼠标放在地图天安门上，会出现提示文字
        var hotSpot = new BMap.Hotspot(point, {text: "我爱北京天安门!", minZoom: 8, maxZoom: 18});
        map.addHotspot(hotSpot);

        //在王府井地铁处，再添加一个热区
        var point2 = new BMap.Point(116.41787,39.914391);
        var hotSpot2 = new BMap.Hotspot(point2, {text: "王府井地铁"});
        map.addHotspot(hotSpot2);
    },

    // 添加自定义覆盖物
    addCustomOverlay: function(){
        // 复杂的自定义覆盖物
        function ComplexCustomOverlay(point, text, mouseoverText){
            this._point = point;
            this._text = text;
            this._overText = mouseoverText;
        }
        ComplexCustomOverlay.prototype = new BMap.Overlay();
        ComplexCustomOverlay.prototype.initialize = function(map){
            this._map = map;
            var div = this._div = document.createElement("div");
            div.style.position = "absolute";
            div.style.zIndex = BMap.Overlay.getZIndex(this._point.lat);
            div.style.backgroundColor = "#EE5D5B";
            div.style.border = "1px solid #BC3B3A";
            div.style.color = "white";
            div.style.height = "18px";
            div.style.padding = "2px";
            div.style.lineHeight = "18px";
            div.style.whiteSpace = "nowrap";
            div.style.MozUserSelect = "none";
            div.style.fontSize = "12px"
            var span = this._span = document.createElement("span");
            div.appendChild(span);
            span.appendChild(document.createTextNode(this._text));
            var that = this;

            var arrow = this._arrow = document.createElement("div");
            arrow.style.background = "url(http://map.baidu.com/fwmap/upload/r/map/fwmap/static/house/images/label.png) no-repeat";
            arrow.style.position = "absolute";
            arrow.style.width = "11px";
            arrow.style.height = "10px";
            arrow.style.top = "22px";
            arrow.style.left = "10px";
            arrow.style.overflow = "hidden";
            div.appendChild(arrow);

            div.onmouseover = function(){
                this.style.backgroundColor = "#6BADCA";
                this.style.borderColor = "#0000ff";
                this.getElementsByTagName("span")[0].innerHTML = that._overText;
                arrow.style.backgroundPosition = "0px -20px";
            }

            div.onmouseout = function(){
                this.style.backgroundColor = "#EE5D5B";
                this.style.borderColor = "#BC3B3A";
                this.getElementsByTagName("span")[0].innerHTML = that._text;
                arrow.style.backgroundPosition = "0px 0px";
            }

            mp.getPanes().labelPane.appendChild(div);

            return div;
        }
        ComplexCustomOverlay.prototype.draw = function(){
            var map = this._map;
            var pixel = map.pointToOverlayPixel(this._point);
            this._div.style.left = pixel.x - parseInt(this._arrow.style.left) + "px";
            this._div.style.top  = pixel.y - 30 + "px";
        }
        var txt = "银湖海岸城", mouseoverTxt = txt + " " + parseInt(Math.random() * 1000,10) + "套" ;

        var myCompOverlay = new ComplexCustomOverlay(new BMap.Point(116.407845,39.914101), "银湖海岸城",mouseoverTxt);

        mp.addOverlay(myCompOverlay);
    },

    // 添加自定义控件
    addCustomControls: function(){
        // 定义一个控件类,即function
        function ZoomControl(){
            // 默认停靠位置和偏移量
            this.defaultAnchor = BMAP_ANCHOR_TOP_LEFT;
            this.defaultOffset = new BMap.Size(10, 10);
        }

// 通过JavaScript的prototype属性继承于BMap.Control
        ZoomControl.prototype = new BMap.Control();

// 自定义控件必须实现自己的initialize方法,并且将控件的DOM元素返回
// 在本方法中创建个div元素作为控件的容器,并将其添加到地图容器中
        ZoomControl.prototype.initialize = function(map){
            // 创建一个DOM元素
            var div = document.createElement("div");
            // 添加文字说明
            div.appendChild(document.createTextNode("放大2级"));
            // 设置样式
            div.style.cursor = "pointer";
            div.style.border = "1px solid gray";
            div.style.backgroundColor = "white";
            // 绑定事件,点击一次放大两级
            div.onclick = function(e){
                map.setZoom(map.getZoom() + 2);
            }
            // 添加DOM元素到地图中
            map.getContainer().appendChild(div);
            // 将DOM元素返回
            return div;
        }
// 创建控件
        var myZoomCtrl = new ZoomControl();
// 添加到地图当中
        map.addControl(myZoomCtrl);
    }



}
var journey = Journey.prototype;

journey.initialize();

var arrObj = [
    {
        start: "A",
        end: "B",
        weight: 10
    },
    {
        start: "A",
        end: "C",
        weight: 15
    },
    {
        start: "A",
        end: "D",
        weight: 7
    },
    {
        start: "B",
        end: "C",
        weight: 6
    },
    {
        start: "B",
        end: "D",
        weight: 4
    },
    {
        start: "C",
        end: "D",
        weight: 8
    }
];

var traceObj = traceAlgrithm.prototype;

// 测试sortByWeight
//traceObj.sortByWeight(arrObj);

// 开始计算
traceObj.startCalc(arrObj);