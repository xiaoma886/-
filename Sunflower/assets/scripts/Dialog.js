/**
 * @author Javen 
 * @copyright 2019-03-05 15:21:33 javendev@126.com 
 * @description 统一管理对话框 
 */

let settlementPool = undefined;
let loadingPool = undefined;
let rankDialogPool = undefined;

function newSettlementNode (parent, callBack) {
    let newNode = null;
    if (!settlementPool) {
        settlementPool = new cc.NodePool();
    }
    if (settlementPool.size() > 0) {
        newNode = settlementPool.get();
        setSettlementNode(newNode, parent, callBack);
    } else {
        cc.loader.loadRes("prefab/settlementDialog", cc.Prefab, function(err, prefab) {
            if (err) {
                return;
            }
            newNode = cc.instantiate(prefab);
            setSettlementNode(newNode, parent, callBack);
        });
    }
}

function setSettlementNode (newNode, parent, callBack) {
    parent.addChild(newNode);
    if (callBack) {
        callBack(newNode);
    }
}
/**
 * 显示对话框
 * @param {*} parent 
 * @param {*} number 
 */
function showSettlementDialog (parent, headUrl, name, score, callBack) {
    newSettlementNode(parent, function(node) {
        if (node) {
            let settlementDialog = node.getComponent("SettlementDialog");
            settlementDialog.setData(headUrl, name, score);
            if (callBack) {
                callBack(settlementDialog);
            }
        }
    });
}
/**
 * 隐藏对话框
 * @param {*} node 
 */
function hiddenSettlementDialog (node) {
    if (!node) return;
    let settlementDialog = node.getComponent("SettlementDialog");
    settlementDialog.setNewScore(false);
    settlementPool.put(node);
}



function newLoadingNode (parent, callBack) {
    let newNode = null;
    if (!loadingPool) {
        loadingPool = new cc.NodePool();
    }
    if (loadingPool.size() > 0) {
        newNode = loadingPool.get();
        setLoadlingNode(newNode, parent, callBack);
    } else {
        cc.loader.loadRes("prefab/loadingDialog", cc.Prefab, function(err, prefab) {
            if (err) {
                return;
            }
            newNode = cc.instantiate(prefab);
            setLoadlingNode(newNode, parent, callBack);
        });
    }
}

function setLoadlingNode (newNode, parent, callBack) {
    parent.addChild(newNode);
    if (callBack) {
        callBack(newNode);
    }
}

function showLoadingDialog (parent, callBack) {
    newLoadingNode(parent, function(node) {
        if (node) {
            if (callBack) {
                callBack(node)
            }
        }
    });
}

function hiddenLoadingDialog (node) {
    if (!node) return;
    loadingPool.put(node);
}






function newRankDialogNode (parent, callBack) {
    let newNode = null;
    if (!rankDialogPool) {
        rankDialogPool = new cc.NodePool();
    }
    if (rankDialogPool.size() > 0) {
        newNode = rankDialogPool.get();
        setRankDialogNode(newNode, parent, callBack);
    } else {
        cc.loader.loadRes("prefab/rankDialog", cc.Prefab, function(err, prefab) {
            if (err) {
                return;
            }
            newNode = cc.instantiate(prefab);
            setRankDialogNode(newNode, parent, callBack);
        });
    }
}

function setRankDialogNode (newNode, parent, callBack) {
    parent.addChild(newNode);
    if (callBack) {
        callBack(newNode);
    }
}

function showRankDialog (parent) {
    newRankDialogNode(parent, function(node) {
        if (node) {}
    });
}

function hiddenRankDialog (node) {
    if (!node) return;
    rankDialogPool.put(node);
}
module.exports = {
    //结算对话框
    showSettlementDialog: showSettlementDialog,
    hiddenSettlementDialog: hiddenSettlementDialog,
    //加载中对话框
    showLoadingDialog: showLoadingDialog,
    hiddenLoadingDialog: hiddenLoadingDialog,
    //排行榜对话框
    showRankDialog: showRankDialog,
    hiddenRankDialog: hiddenRankDialog,
};