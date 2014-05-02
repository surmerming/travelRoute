=================基于google地图的旅行规划路径算法==================

1.搜索旅游城市
2.调用谷歌搜索API给出城市的suggestions
3.可以添加多个城市
4.点击搜索的时候开始添加生成这N个城市，并给每个城市进行编号
5.对所有的N个城市生成完全图，并计算这N个城市之间的距离
6.用Kruskal算法求出这N个城市的最小生成树
7.去掉度大于2的城市节点间的边，并按从大到小的距离去掉，直到度不大于2(如果有优先级的顺序的话，之后再进行改进)
8.获得度为1的叶子节点，获得这几个叶子节点的完美匹配
9.获得旅行规划路径
10.在地图上画出旅行规划路径并进行标注


使用百度地图步骤：
1. 根据电脑的IP地址，获取其位置，将其设置为中心
2. 用户输入的时候，搜索提示信息，点击后的时候，在地图上进行标注
3. 添加多个的时候，点击寻路的时候，开始进行计算



var map = new BMap.Map("container");          // 创建地图实例
    var point = new BMap.Point(116.404, 39.915);  // 创建点坐标
    map.centerAndZoom(point, 15);                 // 初始化地图，设置中心点坐标和地图级别
    map.addControl(new BMap.NavigationControl());
    var opts = {offset: new BMap.Size(150, 5)}
    map.addControl(new BMap.ScaleControl(opts));
    map.addControl(new BMap.OverviewMapControl());
    map.addControl(new BMap.MapTypeControl());
    map.setCurrentCity("北京"); // 仅当设置城市信息时，MapTypeControl的切换功能才能可用
    var marker = new BMap.Marker(point);        // 创建标注
    map.addOverlay(marker);                     // 将标注添加到地图中
    var polyline = new BMap.Polyline([
        new BMap.Point(116.399, 39.910),
        new BMap.Point(116.405, 39.920)
    ],
            {strokeColor:"blue", strokeWeight:6, strokeOpacity:0.5}
    );
    map.addOverlay(polyline);
    var traffic = new BMap.TrafficLayer();        // 创建交通流量图层实例
    map.addTileLayer(traffic);                    // 将图层添加到地图上
    map.enableScrollWheelZoom();
    var local = new BMap.LocalSearch("全国",
            {
                 renderOptions:{map: map},
                 onSearchComplete: function(data){
                    console.log(data);
                 }
            }
     );
    var searchResult = local.search("天安门");
    console.log(searchResult);


    var rendererOptions = {
        draggable: true
    };
    var directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);;
    var directionsService = new google.maps.DirectionsService();
    var map;

    var xiamen = new google.maps.LatLng(24.53, 118.54);

    function initialize() {

        var mapOptions = {
            zoom: 7,
            center: xiamen
        };
        map = new google.maps.Map(document.getElementById('mapCanvas'), mapOptions);
        directionsDisplay.setMap(map);
        //directionsDisplay.setPanel(document.getElementById('searchPanel'));

        google.maps.event.addListener(directionsDisplay, 'directions_changed', function() {
            //computeTotalDistance(directionsDisplay.getDirections());
        });

        calcRoute();

        /*var gUrl = "https://maps.googleapis.com/maps/api/place/autocomplete/json";
        var gData = {
            input: "厦门",
            types:"(cities)",
            language:"zh_CN",
            key:"AIzaSyBJeZAeODWfLv4XWUmLINM35pL8ADwZ_gY",
            sensor: false
        };

        TraceRoute.Util.getData(gUrl, gData, function(msg){
            console.log(msg);
        },function(){
            console.log("errpr");
        });*/
    //    TraceRoute.Util.directGetData();
        $.ajax({
            type: 'POST',
            dataType: 'jsonp',
            url: 'https://maps.googleapis.com/maps/api/place/autocomplete/json',
            data: {
                input: '厦门',
                types:'(cities)',
                language:'zh_CN',
                key:'AIzaSyBJeZAeODWfLv4XWUmLINM35pL8ADwZ_gY',
                sensor: false
            },
            success: function(msg, textStatus){
                console.log("suceess");
            },
            error: function(json){
                console.log("err");
                console.log(json.success());
            },
            complete: function(msg, textStatus){
                console.log(msg);
                console.log(textStatus);
            }
        });
        var getTemplateData = TraceRoute.Util.getTemplate('view', 'demo');
        console.log(getTemplateData);

        var markBtn = document.getElementById("btnMark");
        markBtn.addEventListener('click', function(){
            var textVal = document.getElementById("cityText").value;
            alert(textVal);
        },false);
    };

    function calcRoute() {

        var request = {
            origin: '厦门',
            destination: '泉州',
            waypoints:[{location: '厦门'}, {location: '泉州'}, {location: '福州'}],
            travelMode: google.maps.TravelMode.DRIVING
        };
        directionsService.route(request, function(response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(response);
            }
        });
    };

    function computeTotalDistance(result) {
        var total = 0;
        var myroute = result.routes[0];
        for (var i = 0; i < myroute.legs.length; i++) {
            total += myroute.legs[i].distance.value;
        }
        total = total / 1000.0;
        //document.getElementById('total').innerHTML = total + ' km';
    };



    google.maps.event.addDomListener(window, 'load', initialize);


    //基于百度地图的旅行路径规划
    1.通过搜索获取各个地点之间的距离。
    2.通过计算得到最短路径。
    3.返回路径。
    4.手动添加路径，动画添加。

    细节：
    1.出发时间，到达地方的时间，以及住什么地方，给出个最佳方案
    2.设置起点和终点，以及城市的优先级，譬如要去某城市前要去什么地方，之后再去什么地方
    3.方案是驾车还是不行，还是公交地铁
    4.标注提示
    5.出发时间，还有交通状况
    6.选定起点、选定终点，里面可以重新选择（将搜索提示的信息添加到列表中去）
    7.可以坐飞机、坐火车
    8.