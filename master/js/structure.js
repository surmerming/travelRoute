//===============图================

var max_vertx = 20;

//定义顶点
var Vertex = function (name) {
    this._name = name;
}

//定义图
var Graph = function () {
    this.vertexList = new Array(max_vertx);
    this.adjMat = [];
    this.length = 0;
    for (var i = 0; i < max_vertx; i++) {
        this.adjMat.push([]);
        for (var j = 0; j < max_vertx; j++) {
            this.adjMat[i][j] = 0;
        }
    }
};

//添加顶点
Graph.prototype.AddVertex = function (name) {
    var vertex = new Vertex(name);
    this.vertexList.push(vertex);
    this.length++;
};
//添加边
Graph.prototype.AddEdge = function (start, end) {
    adjMat[start][end] = 1;
    adjMat[end][start] = 1;
};

//定义顶点
var Vertex = function (name) {
    this._name = name;
};

var Graph = {
    _vertexList: [],
    _adjMat: [],
    init: function(){
        this._adjMat[0][0] = 0;
    },

    addVertex: function(name){
       var vertex = new Vertex(name);
       var vertexList = this._vertexList;
       vertexList.push(vertex);
       var len = vertexList.length;
       debugger;
       if(len==1){
           this._adjMat[0][0] = 0;
       }else{
           for(var i=0; i<len; i++){
               this._adjMat[len-1][i] = 0;
               this._adjMat[i][len-1] = 0;
           }
       }

    },

    addEdge: function(start, end, distance, isDirect){
       if(isDirect){
           this._adjMat[start][end] = distance;
       }else{
           this._adjMat[start][end] = distance;
           this._adjMat[end][start] = distance;

       }
    },

    indexOfByName: function(name){
       for(var i in this._vertexList){
           if(this._vertexList[i]._name == name){
               return i;
           }
       }
       return -1;
    }
}

