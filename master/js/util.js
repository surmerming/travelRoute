TravelRoute.Util = {
    /**
     * 根据templateName获取模版内容
     * @param folder 文件夹
     * @param name 文件名
     * @param obj 模版对象
     * @return {*}
     */
    getTemplate: function (folder, name, obj) {
        var dom = "";
        var tpl = $.ajax({
            url: './master/' + folder + "/" + name + '.html',
            async: false,
            cache: true
        }).responseText;
        if(!obj){
            obj = {};
        }
        dom =  _.template(tpl, obj);
        return dom;
    },

    /**
     * 删除数组中的空元素
     */
    trimArray: function(arr){
        var trim = function(s) { return s.replace(/\s+/g,'');}
        var re = [];
        for(var i = 0, len = arr.length; i < len; i++) {
            if(trim(arr[i]).length > 0) re[re.length] = arr[i];
        }
        return re;
    },

    /**
     * 百度地图的工具包
     */
    // 添加覆盖物并设置视野
    addOverlays: function(results) {
        // 自行添加起点和终点
        var start = results.getStart();
        var end = results.getEnd();
        this.addStart(start.point, start.title);
        this.addEnd(end.point, end.title);
        /*var viewPoints = [start.point, end.point];
        // 获取方案
        var plan = results.getPlan(0);
        // 获取方案中包含的路线
        for (var i =0; i < plan.getNumRoutes(); i ++) {
            addRoute(plan.getRoute(i).getPath());
            viewPoints.concat(plan.getRoute(i).getPath());
        }
        // 设置地图视野
        TravelRoute.Config.Map.setViewport(viewPoints, {
            margins: [40, 10, 10, 10]
        });*/
    },

    // 添加方案描述
    addText: function(results) {
        var plan = results.getPlan(0);
        // 获取方案中包含的路线
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

    // 添加起点覆盖物
    addStart: function(point, title){
        TravelRoute.Config.Map.addOverlay(new BMap.Marker(point, {
            title: title,
            icon: new BMap.Icon('blue.png', new BMap.Size(38, 41), {
                anchor: new BMap.Size(4, 36)
            })}));
    },

    // 添加终点覆盖物
    addEnd: function(point, title){
        TravelRoute.Config.Map.addOverlay(new BMap.Marker(point, {
            title: title,
            icon: new BMap.Icon('red.png', new BMap.Size(38, 41), {
                anchor: new BMap.Size(4, 36)
            })}));
    },

    // 添加路线
    addRoute: function(path){
        TravelRoute.Config.Map.addOverlay(new BMap.Polyline(path, {
            strokeColor: '#333',
            enableClicking: false
        }));
    }

};