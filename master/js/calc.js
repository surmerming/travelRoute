//优化后的kruskal算法

var Node = function(first, second, value){
    this._first = first;
    this._second = second;
    this._value = value;
};

Node.prototype.getFirst = function(){
    return this._first;
};

Node.prototype.getSecond = function(){
    return this._second;
};

Node.prototype.getValue = function(){
    return this._value;
};

var TravelRoute = {};

TravelRoute.Calc = {
    _arrayNode: [],
    _vertexList: [],
    _edgeList: [],

    init: function(arrayNode){
        this._arrayNode = arrayNode;
        console.log(arrayNode);
        this.sortByValue(arrayNode);
        for(var i in arrayNode){
            this.check(arrayNode[i]);
        }
        TravelRoute.Calc.show();
    },

    check: function(node){
        var self = this;
        var vertex = [];
        var first = node.getFirst();
        var second = node.getSecond();
        if (self._vertexList.length == 0) {

            vertex.push(first);
            vertex.push(second);
            self._vertexList.push(vertex);
            self._edgeList.push(node);
            return;
        }
        var firstInTree = -1,
            secondInTree = -1;
        var vertexLen = self._vertexList.length;
        for(var i=0; i<vertexLen; i++){
            for(var j=0; j<self._vertexList[i].length; j++){
                if(first==self._vertexList[i][j]){
                    firstInTree = i;
                }
                if(second==self._vertexList[i][j]){
                    secondInTree = i;
                }
            }
        }
        if(firstInTree == -1 && secondInTree == -1){
            vertex.push(first);
            vertex.push(first);
            self._vertexList.push(vertex);
            self._edgeList.push(node);
        }

        if (firstInTree == -1 && secondInTree != -1)// 表示有一个点已经在数组中只把另一个加入就可以了
        {
            self._vertexList[secondInTree].push(first);
            self._edgeList.push(node);
        }
        if (secondInTree == -1 && firstInTree != -1) // 表示有一个点已经在数组中只把另一个加入就可以了
        {
            self._vertexList[firstInTree].push(second);
            self._edgeList.push(node);
        }
        if (secondInTree == firstInTree && secondInTree != -1)// 表述两个在同一个组中 会形成环
        {
        }
        if (firstInTree != secondInTree && firstInTree != -1 && secondInTree != -1)// 表示两个点在不同的组中 需要合并
        {
            self._vertexList[firstInTree] = self._vertexList[firstInTree].concat(self._vertexList[secondInTree]);
            self._vertexList.splice(secondInTree, 1);
            self._edgeList.push(node);
        }
    },

    sortByValue: function(item){
        item = item.sort(function(a,b){
            return a._value - b._value;
        });
        return item;
    },

    show: function(){
        console.log(this._edgeList);
    }

};

var arrayNode = new Array();
arrayNode.push(new Node("A","B",10));
arrayNode.push(new Node("A","C",15));
arrayNode.push(new Node("A","D",7));
arrayNode.push(new Node("B","C",6));
arrayNode.push(new Node("B","D",4));
arrayNode.push(new Node("C","D",8));
TravelRoute.Calc.init(arrayNode);

// 设定起点

// 设定终点









