

TravelRoute.Calc = {

    _start: "",             // 出发起点
    _end: "",               // 出发终点
    _bIsSame: false,        // 起点和终点是否一样
    _gbEdgeArr: [],         // 按边保存
    _gbNodeArr: [],         // 按节点保存
    _nodeList: [],          // 临时节点列表
    _edgeList: [],          // 临时边关系列表
    _tspArrayNode: [],      // 旅行商数组节点
    _tspRoute: [],          // 计算路径

    init: function(start, end, edgeArr){
        // 初始化保存起点、终点和各个节点关系图
        this._tspArrayNode = [];
        this._tspRoute = [];
        this._gbEdgeArr = edgeArr;
        this._start = start;
        this._end = end;
        this.startCalc(edgeArr);
        this._bIsSame = ((start==end) ? true : false);
    },

    startCalc: function(edgeArr){
        edgeArr = this.sortByValue(edgeArr);
        var nodeArr = [];
        this._nodeList = [];
        this._edgeList = [];
        for(var i in edgeArr){
            var edgeArrItem = edgeArr[i];
            this.createObjByNode(edgeArrItem, nodeArr);
            this.createObjByNode({_first:edgeArrItem._second,_second:edgeArrItem._first,_value:edgeArrItem._value}, nodeArr);
            this.check(edgeArrItem);
        }
        // 按节点构造初始化对象
        for(var i in nodeArr){
            this.sortByValue(nodeArr[i]._relations);
        }
        console.log(nodeArr);

        //最小生成树到旅行商算法
        var mstArrayNode = this.mstTreeToTsp();

        //旅行商算法到路径规划算法
        this.tspToTravelRoute(mstArrayNode);

    },

    // 最小生成树-->旅行商算法
    mstTreeToTsp: function(){
        var mstArrayNode = [];
        for(var i in this._edgeList){
            var edgeListItem = this._edgeList[i];
            this.createObjByNode(edgeListItem, mstArrayNode);
            this.createObjByNode({_first:edgeListItem._second,_second:edgeListItem._first,_value:edgeListItem._value}, mstArrayNode);
        }
        mstArrayNode = this.getNodeByGreed(mstArrayNode);
        console.log(mstArrayNode);
        this.getDegreeCal(mstArrayNode);
        return mstArrayNode;
    },

    // 旅行商算法-->路径规划算法
    tspToTravelRoute: function(mstArrayNode){
        var self = this;
        // 起点和终点相同，是旅行商算法，得到结果
        if(self._bIsSame){
            return false;
        }else{
            // 非旅行商算法
            for(var i in mstArrayNode){
                var nodeItem = mstArrayNode[i];
                if((self._start == nodeItem._first)||(self._end == nodeItem._first)){
                    for(var j in nodeItem._relations){
                        var nodeRItemSecond = nodeItem._relations[j]._second;
                        self.removeAnotherEdge(mstArrayNode, nodeItem._first, nodeRItemSecond);
                    }
                    nodeItem._relations = [];
                }
            }
        }
        console.log(mstArrayNode);

        var zeroDegreeArr = [];
        var oneDegreeArr = [];
        for(var i in mstArrayNode){
            var len = mstArrayNode[i]._relations.length;
            var nodeFirst = mstArrayNode[i]._first;
            if(len == 0){
                zeroDegreeArr.push(nodeFirst);
            }else if(len == 1){
                oneDegreeArr.push(nodeFirst);
            }
        }
        var zeroDegreeLen = zeroDegreeArr.length;
        if(zeroDegreeLen == 2){
            // 获取度为0的节点，进行完美匹配算法
            console.log("可以进行完美匹配了。。。");
            var edgeObj = [];
            if(oneDegreeArr.length == 4){
                var matchResults = self.oneDegreeMatch(oneDegreeArr, mstArrayNode);
                // 添加进去
                for(var j in matchResults){
                    var matchResultsJ = matchResults[j];
                    for(var i in mstArrayNode){
                        if(mstArrayNode[i]._first == matchResultsJ._first){
                            mstArrayNode[i]._relations.push({_second:matchResultsJ._second,_value:matchResultsJ._value});
                        }
                        if(mstArrayNode[i]._first == matchResultsJ._second){
                            mstArrayNode[i]._relations.push({_second:matchResultsJ._first,_value:matchResultsJ._value});
                        }
                    }
                }

                for(var i in mstArrayNode){
                    var len = mstArrayNode[i]._relations.length;
                    var nodeFirst = mstArrayNode[i]._first;
                    if(len == 0){
                        zeroDegreeArr.push(nodeFirst);
                    }else if(len == 1){
                        oneDegreeArr.push(nodeFirst);
                    }
                }

            }
            var edgeObj = self.getMatchNodeEdge(zeroDegreeArr, oneDegreeArr);

            var matchResults = self.minPerfectMatch(edgeObj, mstArrayNode);
            // 添加进去
            for(var j in matchResults){
                var matchResultsJ = matchResults[j];
                for(var i in mstArrayNode){
                    if(mstArrayNode[i]._first == matchResultsJ._first){
                        mstArrayNode[i]._relations.push({_second:matchResultsJ._second,_value:matchResultsJ._value});
                    }
                    if(mstArrayNode[i]._first == matchResultsJ._second){
                        mstArrayNode[i]._relations.push({_second:matchResultsJ._first,_value:matchResultsJ._value});
                    }
                }
            }
            self._tspArrayNode = mstArrayNode;


        }else if(zeroDegreeLen == 3){
            var isolatePlace;
            for(var index in zeroDegreeArr){
                if(zeroDegreeArr[index]!=self._start){
                    if(zeroDegreeArr[index]!=self._end){
                        isolatePlace = zeroDegreeArr[index];
                    }
                }
            }
            console.log("可以连接一度节点了");
            var valArr = [];
            for(var i in oneDegreeArr){
                var value = self.getEdgeVal(isolatePlace, oneDegreeArr[i]);
                valArr.push({_first:isolatePlace,_second:oneDegreeArr[i],_value: value});
            }
            var minEdge = self.sortByValue(valArr)[0];
            console.log(minEdge);
            for(var i in mstArrayNode){
                if(mstArrayNode[i]._first == minEdge._first){
                    mstArrayNode[i]._relations.push({_second: minEdge._second, _value: minEdge._value});
                }
                if(mstArrayNode[i]._first == minEdge._second){
                    mstArrayNode[i]._relations.push({_second: minEdge._first, _value: minEdge._value});
                }
            }
            self.tspToTravelRoute(mstArrayNode);
        }
    },
    // 1度节点匹配
    oneDegreeMatch: function(oneDegreeArr, mstArrayNode){
        var edgeObj = [];
        var vertexArr = oneDegreeArr;
        var len = vertexArr.length;
        for(var i=0; i<len; i++){
            for(var j=i+1; j<len; j++){
                for(var m in mstArrayNode){
                    var bFind = false;
                    if(mstArrayNode[m]._first == vertexArr[i]){
                        for(var n in mstArrayNode[m]._relations){
                            if(mstArrayNode[m]._relations[n]._second == vertexArr[j]){
                                bFind = true;
                                break;
                            }
                        }
                    }
                    if(bFind){
                        var edgeVal = this.getEdgeVal(vertexArr[i], vertexArr[j]);
                        edgeObj.push({_first:vertexArr[i],_second:vertexArr[j],_value:edgeVal});
                    }
                }

            }
        }
        return edgeObj;
    },

    //按节点构造对象
    createObjByNode: function(edge, objArr){
        var self = this;
        // 对象数组不为空
        if(objArr.length > 0){
            // 遍历对象数组
            for(var i in objArr){
                var objArrItem = objArr[i];
                var first = objArrItem._first;
                // 该节点已经存在
                if(first && (first == edge._first)){
                    // 是否已经存在
                    for(var j in objArrItem._relations){
                        if((objArrItem._relations[j]._second == edge._second)){
                            return;
                        }
                    }
                    objArrItem._relations.push({_second: edge._second, _value: edge._value});
                    return;
                }
            }
        }
        objArr.push({_first: edge._first,_relations:[]});
        var len = objArr.length;
        objArr[len-1]._relations.push({_second: edge._second, _value: edge._value});
    },

    //
    check: function(edge){
        var self = this;
        var vertex = [];
        var first = edge.getFirst();
        var second = edge.getSecond();
        if (self._nodeList.length == 0) {

            vertex.push(first);
            vertex.push(second);
            self._nodeList.push(vertex);
            self._edgeList.push(edge);
            return;
        }
        var firstInTree = -1,
            secondInTree = -1;
        var vertexLen = self._nodeList.length;
        for(var i=0; i<vertexLen; i++){
            for(var j=0; j<self._nodeList[i].length; j++){
                if(first==self._nodeList[i][j]){
                    firstInTree = i;
                }
                if(second==self._nodeList[i][j]){
                    secondInTree = i;
                }
            }
        }
        if(firstInTree == -1 && secondInTree == -1){
            vertex.push(first);
            vertex.push(second);
            self._nodeList.push(vertex);
            self._edgeList.push(edge);
            return;
        }

        if (firstInTree == -1 && secondInTree != -1)// 表示有一个点已经在数组中只把另一个加入就可以了
        {
            self._nodeList[secondInTree].push(first);
            self._edgeList.push(edge);
            return;
        }
        if (secondInTree == -1 && firstInTree != -1) // 表示有一个点已经在数组中只把另一个加入就可以了
        {
            self._nodeList[firstInTree].push(second);
            self._edgeList.push(edge);
            return;
        }
        if (secondInTree == firstInTree && secondInTree != -1)// 表述两个在同一个组中 会形成环
        {
            return;
        }
        if (firstInTree != secondInTree && firstInTree != -1 && secondInTree != -1)// 表示两个点在不同的组中 需要合并
        {
            self._nodeList[firstInTree] = self._nodeList[firstInTree].concat(self._nodeList[secondInTree]);
            self._nodeList.splice(secondInTree, 1);
            self._edgeList.push(edge);
            return;
        }
    },

    //根据数组的_value字段进行升序排序
    sortByValue: function(item){
        item = item.sort(function(a,b){
            return a._value - b._value;
        });
        return item;
    },


    // 根据贪心算法，删除两者之间的联系
    getNodeByGreed: function(mstArrayNode){
        var self = this;
        console.log(mstArrayNode);
        for(var i in mstArrayNode){
            var mstArrayNodeItem = mstArrayNode[i];
            if(mstArrayNodeItem._relations.length >= 2){
                mstArrayNodeItem._relations = self.sortByValue(mstArrayNodeItem._relations);

                for(var r=0; r<mstArrayNodeItem._relations.length; r++){
                    var nodeRelationsItem = mstArrayNodeItem._relations[r];
                    if(r>1){
                        mstArrayNodeItem._relations.splice(r, 1);
                        r--;
                        self.removeAnotherEdge(mstArrayNode, mstArrayNodeItem._first, nodeRelationsItem._second);
                    }
                }
            }
        }
        return mstArrayNode;
    },

    //移除两个节点之间的联系
    removeAnotherEdge: function(objArr, first, second){
        for(var i in objArr){
            if(objArr[i]._first == second){
                for(var j in objArr[i]._relations){
                    if(first == objArr[i]._relations[j]._second){
                        objArr[i]._relations.splice(j, 1);
                        return;
                    }
                }
            }
        }
    },

    //节点度的计算
    getDegreeCal: function(mstArrayNode){
        var self = this;
        var zeroDegreeArr = [];
        var oneDegreeArr = [];
        for(var i in mstArrayNode){
            var len = mstArrayNode[i]._relations.length;
            var nodeFirst = mstArrayNode[i]._first;
            if(len == 0){
                zeroDegreeArr.push(nodeFirst);
            }else if(len == 1){
                oneDegreeArr.push(nodeFirst);
            }
        }
        var arrayEdge = new Array();


        var zeroDegreeLen = zeroDegreeArr.length;
        if(zeroDegreeLen == 0){
            // 获取度为0的节点，进行完美匹配算法
            console.log("可以进行完美匹配了。。。");
            var edgeObj = self.getNodeEdge(oneDegreeArr);
            var matchResults = self.minPerfectMatch(edgeObj, mstArrayNode);
            // 添加进去
            for(var j in matchResults){
                var matchResultsJ = matchResults[j];
                for(var i in mstArrayNode){
                    if(mstArrayNode[i]._first == matchResultsJ._first){
                        mstArrayNode[i]._relations.push({_second:matchResultsJ._second,_value:matchResultsJ._value});
                    }
                    if(mstArrayNode[i]._first == matchResultsJ._second){
                        mstArrayNode[i]._relations.push({_second:matchResultsJ._first,_value:matchResultsJ._value});
                    }
                }

            }
            self._tspArrayNode = mstArrayNode;

        }else if(zeroDegreeLen == 1){
            // 直接连接最临近的一度节点
            console.log("可以连接一度节点了");
            var valArr = [];
            for(var i in oneDegreeArr){
                var value = self.getEdgeVal(zeroDegreeArr[0], oneDegreeArr[i]);
                valArr.push({_first:zeroDegreeArr[0],_second:oneDegreeArr[i],_value: value});
            }
            var minEdge = self.sortByValue(valArr)[0];
            console.log(minEdge);
            for(var i in mstArrayNode){
                if(mstArrayNode[i]._first == minEdge._first){
                    mstArrayNode[i]._relations.push({_second: minEdge._second, _value: minEdge._value});
                }
                if(mstArrayNode[i]._first == minEdge._second){
                    mstArrayNode[i]._relations.push({_second: minEdge._first, _value: minEdge._value});
                }
            }
            self.getDegreeCal(mstArrayNode);
        }else{
            console.log("尼玛，还要循环往复的计算，坑爹啊！！！");
            var zeroArrLen = zeroDegreeArr.length;
            // 将孤立点之间连接起来
            for(var i=0; i< zeroArrLen; i++){
                for(var j=i+1; j< zeroArrLen; j++){
                    var value = self.getEdgeVal(zeroDegreeArr[i],zeroDegreeArr[j]);
                    if(value != undefined && value != ""){
                        arrayEdge.push(new Edge(zeroDegreeArr[i],zeroDegreeArr[j],value));
                    }
                }

            }
            this.startCalc(arrayEdge);
        }

    },

    // 获取两个节点的边值
    getEdgeVal: function(first, second){
        var arrayNode = this._gbEdgeArr;
        for(var i in arrayNode){
            var bFirstToFirst = ((arrayNode[i]._first == first) && (arrayNode[i]._second == second));
            var bFirstToSecond = ((arrayNode[i]._first == second) && (arrayNode[i]._second == first));
            if(bFirstToFirst || bFirstToSecond){
                return arrayNode[i]._value;
            }
        }
    },

    // 最小完美匹配算法
    minPerfectMatch: function(edgeArr, mstArrayNode){
        var self = this;
        edgeArr = self.sortByValue(edgeArr);
        // 去除已经在原对象数组总的边
        for(var r=0; r<edgeArr.length; r++){
            var bFind = false;
            for(var i in mstArrayNode){
                if(mstArrayNode[i]._first == edgeArr[r]._first){
                    for(var j in mstArrayNode[i]._relations){
                        if(mstArrayNode[i]._relations[j]._second == edgeArr[j]._second){
                            edgeArr.splice(j, 1);
                            bFind = true;
                            break;
                        }
                    }
                }
                if(bFind){
                    r--;
                    break;
                }
            }
        }
        var vertex = [];
        var vertexMatch = [];
        for(var i in edgeArr){
            var isInVertex = self.checkInArr(vertex, edgeArr[i]._first) || self.checkInArr(vertex, edgeArr[i]._second);
            if(!isInVertex){
                vertex.push(edgeArr[i]._first);
                vertex.push(edgeArr[i]._second);
                vertexMatch.push(edgeArr[i]);
            }
        }
        return vertexMatch;
    },



    // 得到分组匹配的边值
    getMatchNodeEdge: function(zeroDegreeArr, oneDegreeArr){
        var edgeObj = [];
        var vertexArr = zeroDegreeArr.concat(oneDegreeArr);
        var len = vertexArr.length;
        for(var i=0; i<len; i++){
            for(var j=i+1; j<len; j++){
                var edgeInZeroArr1 = (zeroDegreeArr[0]==vertexArr[i])&&(zeroDegreeArr[1]==vertexArr[j]);
                var edgeInZeroArr2 = (zeroDegreeArr[0]==vertexArr[j])&&(zeroDegreeArr[1]==vertexArr[i]);
                var edgeInOneArr1 = (oneDegreeArr[0]==vertexArr[i])&&(oneDegreeArr[1]==vertexArr[j]);
                var edgeInOneArr2 = (oneDegreeArr[0]==vertexArr[j])&&(oneDegreeArr[i]==vertexArr[i]);
                if(!edgeInZeroArr1 && !edgeInZeroArr2){
                   if(!edgeInOneArr1 && !edgeInOneArr2){
                       var edgeVal = this.getEdgeVal(vertexArr[i], vertexArr[j]);
                       edgeObj.push({_first:vertexArr[i],_second:vertexArr[j],_value:edgeVal});
                   }
                }
            }
        }
        return edgeObj;
    },

    // 得到节点间的边值
    getNodeEdge: function(vertexArr){
        var edgeObj = [];
        var len = vertexArr.length;
        for(var i=0; i<len; i++){
            for(var j=i+1; j<len; j++){
                var edgeVal = this.getEdgeVal(vertexArr[i], vertexArr[j]);
                edgeObj.push({_first:vertexArr[i],_second:vertexArr[j],_value:edgeVal});
            }
        }
        return edgeObj;
    },

    checkInArr: function(arr, item){
        for(var i in arr){
            if(arr[i] == item){
                return true;
            }
        }
        return false;
    },

    show: function(){
        return this._tspArrayNode;
    },
    // 输出计算结果
    showCalResults: function(){
        console.log(this._tspArrayNode);
        this.searchRoute(this._start);
        if(this._start == this._end){
            this._tspRoute.push(this._end);
        }
        console.log(this._tspRoute);
        return this._tspRoute;
    },
    // 搜索旅行路径
    searchRoute: function(start){
        var tspArrayNode = this._tspArrayNode;
        this._tspRoute.push(start);
        for(var i in tspArrayNode){
            var bFind = false;
            var tspArrayNodeI = tspArrayNode[i];
            if(tspArrayNodeI._first == start){
                for(var j in tspArrayNodeI._relations){
                    var second = tspArrayNodeI._relations[j]._second;
                    if(!this.isInArray(this._tspRoute, second)){
                        this.searchRoute(second);
                    }
                }
            }

        }
    },

    isInArray: function(arr, item){
        for(var i in arr){
            if(arr[i] == item){
                return true;
            }
        }
        return false;
    },

    //
    isExistsInArray: function(dbArr, arr){
        var cnt = 0;
        for(var i in dbArr){
            for(var j in dbArr[i]){
                for(var r in arr){
                    if(arr[r]==dbArr[i][j]){
                        cnt++;
                    }
                }
            }
            if(cnt==arr.length){
                return true;
            }
        }

        return false;
    }

}
/*
var arrayEdge = new Array();


arrayEdge.push(new Edge("A","B",96));
arrayEdge.push(new Edge("A","C",105));
arrayEdge.push(new Edge("A","D",50));
arrayEdge.push(new Edge("A","E",41));
arrayEdge.push(new Edge("A","F",86));
arrayEdge.push(new Edge("A","G",46));
arrayEdge.push(new Edge("A","H",29));
arrayEdge.push(new Edge("A","I",56));
arrayEdge.push(new Edge("A","J",70));
arrayEdge.push(new Edge("B","C",78));
arrayEdge.push(new Edge("B","D",49));
arrayEdge.push(new Edge("B","E",94));
arrayEdge.push(new Edge("B","F",21));
arrayEdge.push(new Edge("B","G",64));
arrayEdge.push(new Edge("B","H",63));
arrayEdge.push(new Edge("B","I",41));
arrayEdge.push(new Edge("B","J",37));
arrayEdge.push(new Edge("C","D",60));
arrayEdge.push(new Edge("C","E",84));
arrayEdge.push(new Edge("C","F",61));
arrayEdge.push(new Edge("C","G",54));
arrayEdge.push(new Edge("C","H",86));
arrayEdge.push(new Edge("C","I",76));
arrayEdge.push(new Edge("C","J",51));
arrayEdge.push(new Edge("D","E",45));
arrayEdge.push(new Edge("D","F",35));
arrayEdge.push(new Edge("D","G",20));
arrayEdge.push(new Edge("D","H",26));
arrayEdge.push(new Edge("D","I",17));
arrayEdge.push(new Edge("D","J",18));
arrayEdge.push(new Edge("E","F",80));
arrayEdge.push(new Edge("E","G",36));
arrayEdge.push(new Edge("E","H",55));
arrayEdge.push(new Edge("E","I",59));
arrayEdge.push(new Edge("E","J",64));
arrayEdge.push(new Edge("F","G",46));
arrayEdge.push(new Edge("F","H",50));
arrayEdge.push(new Edge("F","I",28));
arrayEdge.push(new Edge("F","J",8));
arrayEdge.push(new Edge("G","H",45));
arrayEdge.push(new Edge("G","I",37));
arrayEdge.push(new Edge("G","J",30));
arrayEdge.push(new Edge("H","I",21));
arrayEdge.push(new Edge("H","J",45));
arrayEdge.push(new Edge("I","J",25));
TravelRoute.Calc.init("B", "C", arrayEdge);
console.log(TravelRoute.Calc.show());
TravelRoute.Calc.showCalResults();*/
