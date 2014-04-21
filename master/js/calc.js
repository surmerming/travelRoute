//优化后的kruskal算法

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


var TravelRoute = {};

TravelRoute.Calc = {
    /*_arrayEdge: [],         // 按边关系构造的数组
    _vertexList: [],        // 节点数组
    _edgeList: [],          // 边关系数组
    _start: "",             // 起点
    _end: "",               // 终点
    _arrayNode: [],         // 数组节点
    _mstArrayNode: [],      // 最小生成树后构造的节点*/

    _start: "",             // 出发起点
    _end: "",               // 出发终点
    _gbEdgeArr: [],         // 按边保存
    _gbNodeArr: [],         // 按节点保存
    _nodeList: [],          // 临时节点列表
    _edgeList: [],          // 临时边关系列表
    _tspArrayNode: [],      // 旅行商数组节点

    init: function(start, end, edgeArr){
        // 初始化保存起点、终点和各个节点关系图
        this._gbEdgeArr = edgeArr;
        this._start = start;
        this._end = end;
        this.startCalc(edgeArr);
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
        TravelRoute.Calc.show();

        //最小生成树到旅行商算法
        this.mstTreeToTsp();

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
    },

    /**
     * 按节点构造对象
     */
    createObjByNode: function(edge, objArr){
        var self = this;
        if(objArr.length > 0){
            for(var i in objArr){
                var objArrItem = objArr[i];
                var first = objArrItem._first;
                if(first && (first == edge._first)){
                    objArrItem._relations.push({_second: edge._second, _value: edge._value});
                    return;
                }
            }
        }
        objArr.push({_first: edge._first,_relations:[]});
        var len = objArr.length;
        objArr[len-1]._relations.push({_second: edge._second, _value: edge._value});
    },

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

    show: function(){
        console.log(this._edgeList);
    },

    // 根据贪心算法，删除两者之间的联系
    getNodeByGreed: function(mstArrayNode){
        var self = this;
        console.log(mstArrayNode);
        debugger;
        for(var i in mstArrayNode){
            var mstArrayNodeItem = mstArrayNode[i];
            if(mstArrayNodeItem._relations.length > 2){
                mstArrayNodeItem._relations = self.sortByValue(mstArrayNodeItem._relations);
                for(var r in mstArrayNodeItem._relations){
                    var nodeRelationsItem = mstArrayNodeItem._relations[r];
                    if(r>1){
                        mstArrayNodeItem._relations.splice(r, 1);
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

    // 计算度为1的节点
    getDegreeCal: function(mstArrayNode){
        var self = this;
        var zeroDegreeArr = [];
        var oneDegreeArr = [];

        for(var i in mstArrayNode){
            var len = mstArrayNode[i]._relations.length;
            if(len == 0){
                zeroDegreeArr.push(mstArrayNode[i]._first);
            }else if(len == 1){
                oneDegreeArr.push(mstArrayNode[i]._first);
            }
        }

        debugger;

        var arrayEdge = new Array();

        var zeroDegreeLen = zeroDegreeArr.length;
        if(zeroDegreeLen == 0){
            // 获取度为1的节点，进行完美匹配算法
            console.log("可以进行完美匹配了。。。");


        }else if(zeroDegreeLen == 1){
            // 直接连接最临近的一度节点
            console.log("可以连接一度节点了");


        }else{
            console.log("尼玛，还要循环往复的计算，坑爹啊！！！");
            // 将孤立点之间连接起来
            for(var i=0; i< zeroDegreeArr.length; i++){
                for(var j=0; j< zeroDegreeArr.length; j++){
                    var value = self.getEdgeVal(zeroDegreeArr[i],zeroDegreeArr[i]);
                    arrayEdge.push(new Edge(zeroDegreeArr[i],zeroDegreeArr[i],value));
                }
            }
            this.startCalc(arrayEdge);
        }


    },

    // 获取两个节点的边值
    getEdgeVal: function(first, second){
        var arrayNode = self._gbEdgeArr;
        for(var i in arrayNode){
            if(arrayNode[i]._first == first){
                var relations = arrayNode[i]._relations;
                for(var j in relations){
                    if(relations[j]._second  == second){
                        return relations[j]._value;
                    }
                }
            }
        }
    }

};

var arrayEdge = new Array();
/*arrayEdge.push(new Edge("A","B",10));
arrayEdge.push(new Edge("A","C",15));
arrayEdge.push(new Edge("A","D",7));
arrayEdge.push(new Edge("B","C",6));
arrayEdge.push(new Edge("B","D",4));
arrayEdge.push(new Edge("C","D",8));*/
/*TravelRoute.Calc.init("A", "C", arrayEdge);*/
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
TravelRoute.Calc.init("A", "C", arrayEdge);



