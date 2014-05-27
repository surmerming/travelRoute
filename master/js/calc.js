
TravelRoute.Calc = {
    /**
     * 算法执行的入口函数
     * @param start     旅行的起点
     * @param end       旅行的终点
     * @param edgeList  旅行的边关系列表
     */
    init: function(start, end, edgeList){
        // 对象属性的声明和初始化
        this._trStart = "",                 // 出发起点
        this._trEnd = "",                   // 出发终点
        this._trBSameOnStartEnd = false,    // 起点和终点是否一样
        this._trGbEdgeList = [],            // 保存边对象列表
        this._trGbNodeList = [],            // 保存节点对象列表
        this._trMstTreeList = [],           // 保存最小生成树节点列表
        this._trTspNodeList = [],           // 保存旅行商计算的节点列表
        this._trRouteNodeList = [],         // 保存路径规划节点列表
        this._trRouteList = [],             // 保存路径结果列表
        this._trTmpNodeList = [],           // 保存临时生成的节点列表
        this._trTmpEdgeList = [];           // 保存临时生成的边对象列表

        // 对象属性的赋值
        this._trStart = start;              // 保存出发起点
        this._trEnd = end;                  // 保存出发终点
        this._trBSameOnStartEnd = ((start==end)?true:false); // 起点和终点是否一样
        this._trGbEdgeList = edgeList;      // 保存边对象列表
        for(var i in edgeList){
            var edgeItem = edgeList[i];
            this.createNode(edgeItem, this._trGbNodeList);    // 保存节点对象
        }
        if(edgeList.length>1){
            // 开始进行计算
            this.doCalc(edgeList);
        }else{
            this._trRouteNodeList = this._trGbNodeList;
        }

    },

    /**
     * 开始进行计算
     *
     */
    doCalc: function(edgeList){
        var self = this;

        var tmpNodeList = [];   // 节点对象列表
        var tmpEdgeList = [];   // 边对象列表
        var tmpMstNodeArr = []; // 最小生成树节点列表

        edgeList = self.sortByValueAsc(edgeList);
        // 构造节点并利用kruskal算法思想构造最小生成树
        for(var i in edgeList){
            this.doKruskal(edgeList[i], tmpNodeList, tmpEdgeList);
        }
        // 将最小生成树的边构造成以节点为中心的对象数组
        for(var i in tmpEdgeList){
            this.createNode(tmpEdgeList[i], tmpMstNodeArr);
        }

        console.log(tmpMstNodeArr);

        // 最小生成树-->旅行商算法
        this.mstTreeToTsp(tmpMstNodeArr);
        // 旅行商算法-->路径规划算法
        this.tspToTravelRoute();

    },
    /**
     * 创建节点
     * @param edgeItem 边关系项
     * @param nodeArr 节点数组
     */
    createNode: function(edgeItem, nodeArr){
        // 创建节点，双向的
        this.doCreateNode(edgeItem, nodeArr);
        // 两个节点对换
        var reEdgeItem = {
            _first:edgeItem._second,
            _second:edgeItem._first,
            _value:edgeItem._value
        }
        this.doCreateNode(reEdgeItem, nodeArr);
    },

    /**
     * 创建节点对象数组
     * @param edgeItem 边关系项
     * @param nodeArr 节点对象数组
     */
    doCreateNode: function(edgeItem, nodeArr){
        var self = this;
        // 对象数组不为空
        if(nodeArr.length > 0){
            // 遍历节点数组
            for(var i in nodeArr){
                // 获取数组中的一项
                var nodeItem = nodeArr[i];
                var first = nodeItem._first;
                // 第一个节点是否已经存在
                if(first && (first == edgeItem._first)){
                    // 遍历查找第二个节点是否已经存在
                    var nodeItemRelations = nodeItem._relations;
                    if(nodeItemRelations.length>0){
                        for(var j in nodeItemRelations){
                            // 表示第二个节点也存在，这时表明此时边关系已存在，无须添加
                            if((nodeItemRelations[j]._second == edgeItem._second)){
                                return;
                            }
                        }
                    }
                    // 如果此时还没有退出，则表明没有这条边关系，需要添加
                    nodeItemRelations.push({_second: edgeItem._second, _value: edgeItem._value});
                    return;
                }
            }
        }
        // 如果节点数组为空，或者在其中找不到存在的边关系，则进行添加
        nodeArr.push({_first: edgeItem._first,_relations:[]});
        nodeArr[nodeArr.length-1]._relations.push({_second: edgeItem._second, _value: edgeItem._value});
    },

    /**
     * 对象数组按_value字段进行升序排序
     * @param listArr
     */
    sortByValueAsc: function(listArr){
        var results = listArr.sort(function(a,b){
            return a._value - b._value;
        });
        return results;
    },

    /**
     * 最小生成树到旅行商算法的转变
     * @param tmpMstNodeArr
     * @returns {*}
     */
    mstTreeToTsp: function(tmpMstNodeArr){
        // 删除度大于2的边后，此时只剩下度为0,1,2三种了
        this.removeEdgeOverTwo(tmpMstNodeArr);
        console.log(tmpMstNodeArr);
        // 旅行商结果的计算
        this.doGetTsp(tmpMstNodeArr);
    },

    // 旅行商算法-->路径规划算法
    tspToTravelRoute: function(){
        var self = this;
        var nodeList = self._trTspNodeList;
        // 起点和终点相同，是旅行商算法，得到结果
        if(self._trBSameOnStartEnd){
            self._trRouteNodeList = nodeList;
            return;
        }else{
            // 非旅行商算法
            self.removeDesLink(nodeList);   // 删除与起点终点相联系的边
            var zeroDegreeArr = self.getDegree(nodeList, 0);
            var oneDegreeArr = self.getDegree(nodeList, 1);

            // 0度节点的个数
            var zeroDegreeLen = zeroDegreeArr.length;
            // 如果为2，则表示只有起点终点，可以进行完美匹配了
            if(zeroDegreeLen == 2){
                // 此时应该先连接这四个点的一条边
                if(oneDegreeArr.length == 4){
                    // 获取节点之间的边值
                    var edgeArr = self.getNodeEdge(oneDegreeArr, nodeList);
                    // 获取最小完美匹配计算最小的那条边
                    var matchEdge = [];
                    matchEdge.push(self.minPerfectMatch(edgeArr, nodeList)[0]);
                    // 将匹配的结果添加进去
                    self.addMatchEdge(matchEdge, nodeList);

                    self.tspToTravelRoute();    // 重新获取下
                }else if(oneDegreeArr.length == 2){
                    // 此时可以进行完美匹配了
                    console.log("可以进行完美匹配了。。。");
                    var edgeArr = [];
                    // 获取起点终点两个孤立点以及度为1的两个点,以及边值
                    for(var i in zeroDegreeArr){
                        for(var j in oneDegreeArr){
                            var edgeVal = self.getEdgeVal(zeroDegreeArr[i], oneDegreeArr[j]);
                            var edgeItem = {
                                _first: zeroDegreeArr[i],
                                _second: oneDegreeArr[j],
                                _value: edgeVal
                            }
                            edgeArr.push(edgeItem);
                        }
                    }
                    // 进行完美匹配，获取两条边
                    var matchEdge = self.minPerfectMatch(edgeArr, nodeList);
                    // 将匹配的结果添加进去
                    self.addMatchEdge(matchEdge, nodeList);
                    // 此时的tmpMstNodeArr即为旅行商算法的结果
                    self._trRouteNodeList = nodeList;
                    return;
                }
            }else if(zeroDegreeLen == 3){

                console.log("可以连接一度节点了");
                // 获取除起点终点外的那个孤立点
                var isolatePoint = self.getIsolatePoint(zeroDegreeArr);

                if(nodeList.length==3){
                    var edgeVal1 = self.getEdgeVal(isolatePoint, self._trStart);
                    var edgeVal2 = self.getEdgeVal(isolatePoint, self._trEnd);
                    var edgeItem1 = {
                        _first: isolatePoint,
                        _second: self._trStart,
                        _value: edgeVal1
                    };
                    var edgeItem2 = {
                        _first: isolatePoint,
                        _second: self._trEnd,
                        _value: edgeVal2
                    };
                    var tmpArr = [];
                    tmpArr.push(edgeItem1);
                    tmpArr.push(edgeItem2);
                    self.addMatchEdge(tmpArr, nodeList);
                    // 此时的tmpMstNodeArr即为旅行商算法的结果
                    self._trRouteNodeList = nodeList;
                    return;

                }else{
                    // 将孤立点与一度节点连接起来
                    self.doConnectWithOneDegree(isolatePoint, oneDegreeArr, nodeList);
                    // 重新调用该函数
                    self.tspToTravelRoute();
                }
            }else if(zeroDegreeLen == 4){
                var isolateArr = [];
                for(var index in zeroDegreeArr){
                    if(zeroDegreeArr[index]!=this._trStart){
                        if(zeroDegreeArr[index]!=this._trEnd){
                            isolateArr.push(zeroDegreeArr[index]);
                        }
                    }
                }

                var isolateEdge = self.getEdgeVal(isolateArr[0], isolateArr[1]);
                var edgeItem3 = {
                    _first: isolateArr[0],
                    _second: isolateArr[1],
                    _value: isolateEdge
                };
                var tmpArr2 = [];
                tmpArr2.push(edgeItem3);

                // 将匹配的结果添加进去
                self.addMatchEdge(tmpArr2, nodeList);

                self.tspToTravelRoute();    // 重新获取下
            }
        }
    },
    /**
     * 删除与起点终点目的地相联系的边
     * @param nodeList
     */
    removeDesLink: function(nodeList){
        for(var i in nodeList){
            var nodeItem = nodeList[i];
            if((this._trStart == nodeItem._first)||(this._trEnd == nodeItem._first)){
                for(var j in nodeItem._relations){
                    var nodeRItemSecond = nodeItem._relations[j]._second;
                    this.removeAnotherEdge(nodeList, nodeItem._first, nodeRItemSecond);
                }
                nodeItem._relations = [];
            }
        }
    },

    /**
     * 检查每一条边，利用kruskal算法生成最小生成树，主要检验是否形成环
     * @param edgeItem 边关系项
     * @param nodeList 节点列表
     * @param edgeList 边列表
     */
    doKruskal: function(edgeItem, nodeList, edgeList){
        var self = this;
        var vertex = [];    // 保存关系节点
        var first = edgeItem.getFirst();    // 得到第一个节点
        var second = edgeItem.getSecond();  // 得到第二个节点
        // 如果
        if (nodeList.length == 0) {
            vertex.push(first);
            vertex.push(second);
            nodeList.push(vertex);
            edgeList.push(edgeItem);
            return;
        }
        var firstInTree = -1,
            secondInTree = -1;
        // 初始化，查找有没有在nodeList中，是否形成环
        var vertexLen = nodeList.length;
        for(var i=0; i<vertexLen; i++){
            for(var j=0; j<nodeList[i].length; j++){
                if(first==nodeList[i][j]){
                    firstInTree = i;
                }
                if(second==nodeList[i][j]){
                    secondInTree = i;
                }
            }
        }
        if(firstInTree == -1 && secondInTree == -1){
            vertex.push(first);
            vertex.push(second);
            nodeList.push(vertex);
            edgeList.push(edgeItem);
            return;
        }

        if (firstInTree == -1 && secondInTree != -1)// 表示有一个点已经在数组中只把另一个加入就可以了
        {
            nodeList[secondInTree].push(first);
            edgeList.push(edgeItem);
            return;
        }
        if (secondInTree == -1 && firstInTree != -1) // 表示有一个点已经在数组中只把另一个加入就可以了
        {
            nodeList[firstInTree].push(second);
            edgeList.push(edgeItem);
            return;
        }
        if (secondInTree == firstInTree && secondInTree != -1)// 表述两个在同一个组中 会形成环
        {
            return;
        }
        if (firstInTree != secondInTree && firstInTree != -1 && secondInTree != -1)// 表示两个点在不同的组中 需要合并
        {
            nodeList[firstInTree] = nodeList[firstInTree].concat(nodeList[secondInTree]);
            nodeList.splice(secondInTree, 1);
            edgeList.push(edgeItem);
            return;
        }
    },
    /**
     * 根据贪心算法，删除度大于2之间边的联系
     * @param tmpMstNodeArr
     */
    removeEdgeOverTwo: function(tmpMstNodeArr){
        var self = this;
        // 遍历对象数组
        for(var i in tmpMstNodeArr){
            var nodeItem = tmpMstNodeArr[i];
            var nodeItemRelations = nodeItem._relations;
            // 删除度大于2的，只留下度为2的最小两条边
            if(nodeItemRelations.length >= 2){
                nodeItemRelations = self.sortByValueAsc(nodeItemRelations);
                for(var r=0; r<nodeItemRelations.length; r++){
                    var nodeRelationsItem = nodeItemRelations[r];
                    // 从第三条开始删除，删除后要重新获取数组长度
                    if(r>1){
                        nodeItemRelations.splice(r, 1);
                        r--;
                        self.removeAnotherEdge(tmpMstNodeArr, nodeItem._first, nodeRelationsItem._second);
                    }
                }
            }
        }
    },
    /**
     * 删除数组边关系的另一条边
     * @param objArr 对象数组
     * @param first 第一个节点
     * @param second 第二个节点
     */
    removeAnotherEdge: function(objArr, first, second){
        // 遍历对象数组
        for(var i in objArr){
            var item = objArr[i];
            if(item._first == second){
                var itemRelations = item._relations;
                for(var j in itemRelations){
                    if(first == itemRelations[j]._second){
                        itemRelations.splice(j, 1);
                        return;
                    }
                }
            }
        }
    },

    /**
     * 旅行商算法结果的计算
     * @param tmpMstNodeArr
     */
    doGetTsp: function(tmpMstNodeArr){
        var self = this;
        // 如果self._trTspNodeList不为空，需要将其与tmpMstNodeArr合并
        if(self._trTspNodeList.length > 0){
            self._trTspNodeList = self.concatNodeArr(tmpMstNodeArr, self._trTspNodeList);
            tmpMstNodeArr = self._trTspNodeList;
        }

        // 获取0度节点
        var zeroDegreeArr = self.getDegree(tmpMstNodeArr, 0);
        // 获取1度节点
        var oneDegreeArr = self.getDegree(tmpMstNodeArr, 1);

        // 0度节点的个数
        var zeroDegreeLen = zeroDegreeArr.length;
        // 如果0度节点的个数为0，表示此时没有孤立点，只有1度节点和2度节点，能够证明，此时1度节点个数必为偶数，可以进行最小完美匹配
        if(zeroDegreeLen == 0){
            // 获取度为0的节点，进行完美匹配算法
            console.log("可以进行完美匹配了。。。");
            var edgeArr = [];
            // 获取节点之间的边值
            if(oneDegreeArr.length == 2){
                 var edgeval = self.getEdgeVal(oneDegreeArr[0], oneDegreeArr[1]);
                 edgeArr.push({_first:oneDegreeArr[0],_second:oneDegreeArr[1],_value:edgeval});
            }else{
                 edgeArr = self.getNodeEdge(oneDegreeArr, tmpMstNodeArr);
            }
            // 获取最小完美匹配计算的结果
            var matchEdge = self.minPerfectMatch(edgeArr, tmpMstNodeArr);
            // 将匹配的结果添加进去
            self.addMatchEdge(matchEdge, tmpMstNodeArr);
            // 此时的tmpMstNodeArr即为旅行商算法的结果
            self._trTspNodeList = tmpMstNodeArr;
            return;

        }else if(zeroDegreeLen == 1){
            // 直接连接最临近的一度节点
            console.log("可以连接一度节点了");
            // 将孤立点与一度节点连接起来
            self.doConnectWithOneDegree(zeroDegreeArr[0], oneDegreeArr, tmpMstNodeArr);
            // 此时就只剩下一度和二度节点了，就可以进行完美匹配了
            self.doGetTsp(tmpMstNodeArr);
        }else{
            console.log("尼玛，还要循环往复的计算，坑爹啊！！！");
            // 此时表示孤立点有多个，所以要重新开始计算这些孤立点，到最后添加进去
            var nodeEdge = new Array();
            for(var i=0; i< zeroDegreeLen; i++){
                for(var j=i+1; j< zeroDegreeLen; j++){
                    var value = self.getEdgeVal(zeroDegreeArr[i],zeroDegreeArr[j]);
                    if(value != undefined && value != ""){
                        nodeEdge.push(new Edge(zeroDegreeArr[i],zeroDegreeArr[j],value));
                    }
                }

            }
            // 此时计算这些点的
            this.doCalc(nodeEdge);
        }
    },

    /**
     * 获取节点度
     * @param nodeArr
     * @param type 如果type为0，则为获取0度节点，为1则获取1度节点
     */
    getDegree: function(nodeArr, type){
        var arr = [];
        var zeroDegreeArr = [];     // 0度节点数组
        var oneDegreeArr = [];      // 1度节点数组
        for(var i in nodeArr){
            var nodeFirst = nodeArr[i]._first;
            var len = nodeArr[i]._relations.length;
            if(len == 0){
                zeroDegreeArr.push(nodeFirst);
            }else if(len == 1){
                oneDegreeArr.push(nodeFirst);
            }
        }
        if(type==0){
            arr = zeroDegreeArr;
        }else if(type==1){
            arr = oneDegreeArr;
        }
        return arr;
    },
    /**
     * 获取两个节点之间的边值
     * @param first
     * @param second
     * @returns {*}
     */
    getEdgeVal: function(first, second){
        // 边值的信息从最开始保存的边关系数组中获取
        var edgeArr = this._trGbEdgeList;
        for(var i in edgeArr){
            var edgeItem = edgeArr[i];
            var bFirstToFirst = ((edgeItem._first == first) && (edgeItem._second == second));
            var bFirstToSecond = ((edgeItem._first == second) && (edgeItem._second == first));
            if(bFirstToFirst || bFirstToSecond){
                return edgeItem._value;
            }
        }
    },
    /**
     * 获取除起点终点外的另外一个孤立点
     * @param zeroDegreeArr  0度节点数组
     * @returns {*}
     */
    getIsolatePoint: function(zeroDegreeArr){
        var isolatePlace;
        for(var index in zeroDegreeArr){
            if(zeroDegreeArr[index]!=this._trStart){
                if(zeroDegreeArr[index]!=this._trEnd){
                    isolatePlace = zeroDegreeArr[index];
                }
            }
        }
        return isolatePlace;
    },
    /**
     * 最小完美匹配计算结果
     * @param edgeArr
     * @param tmpMstNodeArr
     * @returns {Array}
     */
    minPerfectMatch: function(edgeArr, tmpMstNodeArr){
        var self = this;
        // 将边关系数组按升序排序
        edgeArr = self.sortByValueAsc(edgeArr);

        var vertex = [];
        var vertexMatch = [];
        for(var i in edgeArr){
            var edgeItem = edgeArr[i];
            var isInVertex = self.isVertexInArr(vertex, edgeItem._first) || self.isVertexInArr(vertex, edgeItem._second);
            if(!isInVertex){
                vertex.push(edgeItem._first);
                vertex.push(edgeItem._second);
                vertexMatch.push(edgeItem);
            }
        }
        return vertexMatch;
    },
    /**
     * 将在tmpMstNodeArr中存在的边，从edgeArr中去除掉
     * @param edgeArr
     * @param tmpMstNodeArr
     */
    spliceExistEdge: function(edgeArr, tmpMstNodeArr){
        // 遍历每一条边
        for(var r=0; r<edgeArr.length; r++){
            var bFind = false;
            // 遍历节点数组
            for(var i in tmpMstNodeArr){
                // 如果发现了第一个节点
                var nodeItem = tmpMstNodeArr[i];
                if(nodeItem._first == edgeArr[r]._first){
                    // 则遍历查找第二个节点
                    for(var j in nodeItem._relations){
                        //查找到第二个节点，便是该边在tmpMstNodeArr中存在，则应该从edgeArr中删除掉
                        if(nodeItem._relations[j]._second == edgeArr[j]._second){
                            edgeArr.splice(j, 1);
                            // 表示该条边已经找到，跳出这一重循环
                            bFind = true;
                            break;
                        }
                    }
                }
                // 找到了这条边后，跳出这层循环，同时因为删除了一条边，r应该减一
                if(bFind){
                    r--;
                    break;
                }
            }
        }
    },
    /**
     * 将匹配的边添加到节点数组中去
     * @param matchEdge     匹配的边
     * @param tmpMstNodeArr 节点数组
     */
    addMatchEdge: function(matchEdge, tmpMstNodeArr){
        // 添加进去
        for(var j in matchEdge){
            var matchItem = matchEdge[j];
            for(var i in tmpMstNodeArr){
                var nodeItem = tmpMstNodeArr[i];
                if(nodeItem._first == matchItem._first){
                    nodeItem._relations.push({_second:matchItem._second,_value:matchItem._value});
                }
                if(nodeItem._first == matchItem._second){
                    nodeItem._relations.push({_second:matchItem._first,_value:matchItem._value});
                }
            }
        }
    },
    /**
     * 将孤立点与最近的一度节点连接起来，并添加到节点数组中
     * @param isolatePoint  孤立点
     * @param oneDegreeArr  一度节点数组
     * @param tmpMstNodeArr 节点数组
     */
    doConnectWithOneDegree: function(isolatePoint, oneDegreeArr, tmpMstNodeArr){
        var valArr = [];
        if(oneDegreeArr.length>0){
            for(var i in oneDegreeArr){
                var value = this.getEdgeVal(isolatePoint, oneDegreeArr[i]);
                valArr.push({_first:isolatePoint,_second:oneDegreeArr[i],_value: value});
            }
        }else{
            // 否则，与起点终点相连

        }

        // 获取最小的边
        var minEdge = this.sortByValueAsc(valArr)[0];
        console.log(minEdge);
        for(var i in tmpMstNodeArr){
            var nodeItem = tmpMstNodeArr[i];
            if(nodeItem._first == minEdge._first){
                nodeItem._relations.push({_second: minEdge._second, _value: minEdge._value});
            }
            if(nodeItem._first == minEdge._second){
                nodeItem._relations.push({_second: minEdge._first, _value: minEdge._value});
            }
        }
    },
    /**
     * 合并两个节点数组
     * @param tmpNodeArr 临时生成的节点数组
     * @param gbNodeArr  全局的节点数组
     */
    concatNodeArr: function(tmpNodeArr, gbNodeArr){
        for(var i in tmpNodeArr){
            var tmpNodeItem = tmpNodeArr[i];
            for(var m in gbNodeArr){
                var gbNodeItem = gbNodeArr[m];
                if(tmpNodeItem._first == gbNodeItem._first){
                    gbNodeItem._relations.push(tmpNodeItem._relations);
                }

            }
        }
        return gbNodeArr;
    },
    /**
     * 获取数组中节点之间完全图的边
     * @param nodeArr
     * @param nodeList
     * @returns {Array}
     */
    getNodeEdge: function(nodeArr, nodeList){
        // 根据节点进行分组
        var groupArr = this.getGroupByVertex(nodeArr, nodeList);
        var groupArrLen = groupArr.length;
        // 保存获取节点间关系边的数组
        var edgeObj = [];
        for(var m=0; m<groupArrLen; m++){
            for(var n=m+1; n<groupArrLen; n++){
                this.addNodeEdge(groupArr[m][0], groupArr[n][0], edgeObj);
                this.addNodeEdge(groupArr[m][0], groupArr[n][1], edgeObj);
                this.addNodeEdge(groupArr[m][1], groupArr[n][0], edgeObj);
                this.addNodeEdge(groupArr[m][1], groupArr[n][1], edgeObj);

            }
        }
        return edgeObj;
    },
    /**
     * 添加节点之间的边
     * @param node1
     * @param node2
     * @param edgeObj
     */
    addNodeEdge: function(node1, node2, edgeObj){
        // 获取任意两个节点之间的边值
        var edgeVal = this.getEdgeVal(node1, node2);
        var tmpArr = {
            _first: node1,
            _second: node2,
            _value:edgeVal
        };
        edgeObj.push(tmpArr);
    },
    /**
     * 根据顶点进行分组
     * @param nodeArr
     * @param nodeList
     */
    getGroupByVertex: function(nodeArr, nodeList){
        var vertexArr = [];
        var groupResults = [];
        for(var i in nodeArr){
            var tmpNodeArr = [];
            if(!this.isInArray(vertexArr, nodeArr[i])){
                tmpNodeArr = this.searchGroup(nodeArr[i], tmpNodeArr, nodeList);
                var tmpNodeLen = tmpNodeArr.length;
                vertexArr.push(nodeArr[i]);
                vertexArr.push(tmpNodeArr[tmpNodeLen-1]);
                var tmpGroupArr = [];
                tmpGroupArr.push(nodeArr[i]);
                tmpGroupArr.push(tmpNodeArr[tmpNodeLen-1]);
                groupResults.push(tmpGroupArr);
            }
        }
        return groupResults;
    },
    /**
     * 查找组别，向蜘蛛爬虫一样寻找
     * @param place
     * @param tmpNodeArr
     * @param nodeList
     * @returns {*}
     */
    searchGroup: function(place, tmpNodeArr, nodeList){
        tmpNodeArr.push(place);
        for(var i in nodeList){
            var nodeListItem = nodeList[i];
            if(nodeListItem._first == place){
                for(var j in nodeListItem._relations){
                    var second = nodeListItem._relations[j]._second;
                    if(!this.isInArray(tmpNodeArr, second)){
                        this.searchGroup(second, tmpNodeArr, nodeList);
                    }
                }
            }
        }
        return tmpNodeArr;
    },
    /**
     * 检查顶点是否已存在数组中
     * @param arr
     * @param item
     * @returns {boolean}
     */
    isVertexInArr: function(arr, item){
        for(var i in arr){
            if(arr[i] == item){
                return true;
            }
        }
        return false;
    },
    // 路径规划结果，以节点的形式保存
    show: function(){
        return this._trRouteNodeList;
    },
    // 输出计算结果
    showCalResults: function(){
        console.log(this._trRouteNodeList);
        this.searchRoute(this._trStart);
        if(this._trBSameOnStartEnd){
            this._trRouteList.push(this._trEnd);
        }
        console.log(this._trRouteList);
        return this._trRouteList;
    },
    // 搜索旅行路径
    searchRoute: function(place){
        var tspArrayNode = this._trRouteNodeList;
        this._trRouteList.push(place);
        for(var i in tspArrayNode){
            var tspArrayNodeI = tspArrayNode[i];
            if(tspArrayNodeI._first == place){
                for(var j in tspArrayNodeI._relations){
                    var second = tspArrayNodeI._relations[j]._second;
                    if(!this.isInArray(this._trRouteList, second)){
                        this.searchRoute(second);
                    }
                }
            }

        }
    },
    /**
     * 检查某个值是否在数组中
     * @param arr
     * @param item
     * @returns {boolean}
     */
    isInArray: function(arr, item){
        for(var i in arr){
            if(arr[i] == item){
                return true;
            }
        }
        return false;
    }

}

