//===============图================

//定义顶点
var Vertex = function (label) {
    this._label = label;
    this._wasVisited = false;
}

//定义图
var Graph = function () {
    var max_vertx = 20;
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
Graph.prototype.AddVertex = function (label) {
    var vertex = new Vertex(label);
    this.vertexList.push(vertex);
    this.length++;
};
//添加边
Graph.prototype.AddEdge = function (start, end) {
    adjMat[start][end] = 1;
    adjMat[end][start] = 1;
}



//=====================栈=======================
var Stack = function () {
    this._array = new Array(10);
    this.top = -1;
}
Stack.prototype.Push = function (obj) {
    this._array[++this.top] = obj;
};
Stack.prototype.Peek = function () {
    return this._array[this.top];
};
Stack.prototype.Pop = function () {
    return this._array[this.top--];
};
Stack.prototype.IsEmpty = function () {
    return this.top == -1;
};



