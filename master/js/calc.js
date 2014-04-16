/**
 * 用来计算旅行路径算法
 *
 */

// 所有的算数操作均放在traceAlgrithm中


TravelRoute.Calc = {
    nodeRelationSets: [],

    /**
     * 作为开始执行算法的入口
     * @param arrObj 对象数组
     */
    startCalc: function(arrObj){
        this.nodeRelationSets = arrObj;
        // 先排序
        arrObj = this.sortByWeight(arrObj);
        // 构造最小生成树
        var mstTree = this.createMstTree(arrObj);
        console.log("mstTree:");
        console.log(mstTree);
        var result = this.getNodeByGreed(this.createObjByNode(mstTree));
        console.log("result:");
        console.log(result);
        return result;

    },

    /**
     * 对象数组按权值进行排序
     * @param arrObj 对象数组
     * 要求arrObj有start,end,weight属性
     */
    sortByWeight: function(arrObj){

        arrObj = arrObj.sort(function(a,b){
            return a.weight - b.weight;
        });
        return arrObj;
    },

    /**
     * 利用kruskal算法构造最小生成树
     */
    createMstTree: function(arrObj){
        var self = this;
        //forestArr中含有node,和relation两个数组
        console.log(arrObj);
        var forestArr = [];
        for(var index in arrObj){
            var startPosInForest = self.indexOfDoubleDimension(forestArr, arrObj[index].start);
//            console.log("startPosInForest:"+startPosInForest);
            var endPosInForest = self.indexOfDoubleDimension(forestArr, arrObj[index].end);
//            console.log("endPosInForest:"+endPosInForest);
            if(startPosInForest!=-1){
                // start和end均在森林中
                if(endPosInForest!=-1){
                    //start和end在两个森林中，进行添加和合并
                    if(endPosInForest!=startPosInForest){
                        //合并两个森林到start森林中
                        forestArr[startPosInForest].node = forestArr[startPosInForest].node.concat(forestArr[endPosInForest].node);
                        //删除end森林
                        forestArr.splice(endPosInForest, 1);
                        forestArr[startPosInForest].relation.push(arrObj[index]);

                    }else{//start和end在同一个森林中，不予操作

                    }
                }else{ //start在森林中，end不在
                    forestArr[startPosInForest].node.push(arrObj[index].end);
                    forestArr[startPosInForest].relation.push(arrObj[index]);
                }
            }else{
                // start不在森林中，end在森林中
                if(endPosInForest!=startPosInForest){
                    forestArr[endPosInForest].node.push(arrObj[index].start);
                    forestArr[endPosInForest].relation.push(arrObj[index]);
                }
                else{ //start和end均不在森林中
                    forestArr.push({"node":[arrObj[index].start,arrObj[index].end],"relation":[arrObj[index]]});
                }
            }
        }
        return forestArr[0];
    },

    /**
     * 检验一个值在二维数组的哪一个森林中
     */
    indexOfDoubleDimension: function(dbArr, val){
        if(dbArr.length>0){
            for(var i in dbArr){
                for(var j in dbArr[i].node){
                    if(val == dbArr[i].node[j]){
                        return i;
                    }
                }
            }
        }
        return -1;
    },
    /**
     * 根据节点构造对象数组
     */
    createObjByNode: function(arrObj){
        var nodeArr = [];
        for(var node in arrObj.node){
            nodeArr.push({node:arrObj.node[node],"relation":[]});
        }
        for(var i in arrObj.relation){
            for(var n in nodeArr){
                if(arrObj.relation[i].start == nodeArr[n].node){
                    nodeArr[n].relation.push({"node": arrObj.relation[i].end,"weight":arrObj.relation[i].weight});
                }else{
                    if(arrObj.relation[i].end == nodeArr[n].node){
                        nodeArr[n].relation.push({"node": arrObj.relation[i].start,"weight":arrObj.relation[i].weight});
                    }
                }
            }
        }

        console.log("nodeArr前:");
        console.log(nodeArr);
        return nodeArr;

    },
    /**
     * 根据贪心算法构造将度大于2的删除联系
     * @param nodeArr
     */
    getNodeByGreed: function(nodeArr){

        for(var index in nodeArr){
            if(nodeArr[index].relation.length>2){
                //有大于一条边的需要删除之间的联系
                nodeArr[index].relation = this.sortByWeight(nodeArr[index].relation);
                for(var r in nodeArr[index].relation){
                    if(r>0){
                        nodeArr = this.removeEdge(nodeArr, nodeArr[index].node, nodeArr[index].relation[r].node);
                        nodeArr[index].relation.splice(r, 1);
                    }
                }
            }
        }
        console.log("nodeArr后:");
        console.log(nodeArr);
        return nodeArr;
    },
    /**
     * 移除两个节点之间的联系
     */
    removeEdge: function(arrObj, start, end){
        for(var i in arrObj){
            if(arrObj[i].node == end){
                for(var j in arrObj[i].relation){
                    if(start == arrObj[i].relation[j].node){
                        arrObj[i].relation.splice(j, 1);
                    }
                }
            }
        }
        return arrObj;
    }
};

// demo 测试函数
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


// 测试sortByWeight
//traceObj.sortByWeight(arrObj);

// 开始计算
//TravelRoute.Calc.startCalc(arrObj);




