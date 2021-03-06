﻿/* 
*出票
* @Author: Administrator
* @Date:   2015-01-20 15:50:08
* @Last Modified by:   Administrator
* @Last Modified time: 2015-12-14 17:22:29
* @Last Modified time: 2015-01-27 18:21:24
*/
//总注数
var zhushuzongs = 0;
var newFactCNumber;
var lotteryId;
//确保付款同步，即付款按钮不能频繁点击
var syncPay = true;
//点
var startRebate;       
/**
 * @Author:      muchen
 * @DateTime:    2014-12-03 14:20:09
 * @Description: 进入该页面时调用
 */
function checkOutPageLoadedPanel(){
    catchErrorFun("checkOutPage_init();");
    $("#selectNum_list").scroller({
        verticalScroll : true,
        horizontalScroll : false,
        vScrollCSS: "afScrollbar",
        autoEnable : true
    });
    $("#selectNum_list").scroller().scrollToTop();
    $("#selectNum_list").scroller().clearInfinite();     
}
/**
 * @Author:      muchen
 * @DateTime:    2014-12-03 14:20:23
 * @Description: 离开本页面时调用
 */
function checkOutPageUnloadedPanel(){
  $("#checkOutPage_jixuan").css("display", "");
}
/**
 * @Author:      muchen
 * @DateTime:    2014-12-03 14:19:48
 * @Description: 入口
 */
function checkOutPage_init(){

   checkOutPage_payout();
     //用户选号的记录信息
     addListViewItem();
     var lotteryCate = LotteryInfo.getLotteryTypeByTag(currentTouzhuInfo.lotteryType);
     if(currentTouzhuInfo.sntuo == "3" || currentTouzhuInfo.sntuo == "1" || getplayid(LotteryInfo.getId(lotteryCate,currentTouzhuInfo.lotteryType),LotteryInfo.getMethodId(lotteryCate,currentTouzhuInfo.playMethodIndex))){
       $("#checkOutPage_jixuan").css("display", "none");
    }

    //机选按钮监听
    $("#checkOutPage_jixuan").off('click');
    $("#checkOutPage_jixuan").on('click', function(event) {
        resetFukanFlag();
        checkOut_jixuan();
    });
    //清空号码按钮监听
    $("#checkOutPage_qingkong").off('click');
    $("#checkOutPage_qingkong").on('click', function(event) {
        $("#listviewid").empty();
        localStorageUtils.removeParam("resultList_checkout");
        //总注数
          zhushuzongs = 0;
          checkoutResult=[];
        //确保付款同步，即付款按钮不能频繁点击
          syncPay = true;
        //清空显示的注数和金额
        localStorageUtils.removeParam("zhushuzongs");
        getCheckOutNotesAndMoney (0);
    });

    //更新手选按钮的href,/后参数判断返回彩种页面是普通还是胆拖
    $("#checkOutPage_shouxuan").off('click');
    $("#checkOutPage_shouxuan").on('click', function(event) {
        createInitPanel_Fun(currentTouzhuInfo.lotteryType+"Page",true);
        resetFukanFlag();
    });
     //追号按钮监听
    $("#checkOutPage_zhuihao").off('click');
    $("#checkOutPage_zhuihao").on('click',function(e){
         if($('#checkOutPage_zhushu').html() == 0){
            toastUtils.showToast("至少选择一注",2000);
            $.ui.blockUI(.1);
            setTimeout(function () {
                $.unblockUI();
            }, 2000);
            return;
        }else{
           setPanelBackPage_Fun("zhuiHaoPage");
        }
    });

    //返回,清空所有数据
    $("#checkOutPage_back").off('click');
    $("#checkOutPage_back").on('click',function(e){
             $.ui.popup(
                {
                    title:"提示：",
                    message:'返回将清空已选号码！<br/><br/>您确定返回吗？',
                    cancelText:"关闭",
                    cancelCallback:
                    function(){
                        resetFukanFlag();
                    },
                    doneText:"确定",
                    doneCallback:
                    function(){
                     createInitPanel_Fun(currentTouzhuInfo.lotteryType+"Page",true);                           
                      checkOut_clearData();
                    },
                    cancelOnly:false
                });
    });
}

/**
 * @Author:      muchen
 * @DateTime:    2014-12-13 09:50:10
 * @Description: 清空记录
 */
function checkOut_clearData() {
    localStorageUtils.removeParam("resultList_checkout");
     currentTouzhuInfo=[];
    //总注数
      zhushuzongs = 0;
      checkoutResult=[];
    //确保付款同步，即付款按钮不能频繁点击
      syncPay = true;
    //清空显示的注数和金额
    localStorageUtils.removeParam("zhushuzongs");
}
/**
 * @Author:      muchen
 * @DateTime:    2014-12-03 14:18:03
 * @Description: 付款按钮点击
 */
function checkOutPage_payout() {
    $("#checkOutPage_payout").off('click');
    $("#checkOutPage_payout").on('click', function(event) {
        if(!syncPay){
            return;
        }
        syncPay=false;
        if($('#checkOutPage_zhushu').text() == 0){
            toastUtils.showToast("至少选择一注",2000);
            $.ui.blockUI(.1);
            setTimeout(function () {
                $.unblockUI();
            }, 2000);
            return;
        }

        //提示
        var danQiMsg = getDanQiBonus(currentTouzhuInfo.lotteryType);
        $.ui.popup(
        {
            title:"提示：",
            message:''+ danQiMsg +'您共投' + $('#checkOutPage_zhushu').text() +'注,共' + $('#checkOutPage_money').text() +'元，请确认',
            cancelText:"关闭",
            cancelCallback:
            function(){
                resetFukanFlag();
            },
            doneText:"确定",
            doneCallback:
            function(){
                getQiHao();
            },
            cancelOnly:false
        });
    });
}

/**
 * 获取最新期号
 */
function getQiHao(){
  lotteryId=LotteryInfo.getLotteryIdByTag(currentTouzhuInfo.lotteryType);
  var params='{"LotteryCodeEnum": ' + lotteryId + ',"ProjectPublic_PlatformCode":2,"InterfaceName":"GetCurrLotteryIssue"}';
    ajaxUtil.ajaxByAsyncPost1(null,params,function(data){
        if(data.SystemState == 64) {
           newFactCNumber=data.IssueNumber;
           fukuanPost();
        } else if(data.SystemState == -1){
           loginAgain();
        }else{//如果查询期号失败则提示并返回购彩大厅
            toastUtils.showToast("期号获取失败");
        }
    },null);
}

/**
 * @Author:      muchen
 * @DateTime:    2014-12-03 14:21:00
 * @Description:  付款时的post请求
 */
function fukuanPost(){
       //装载向服务器提交的数据
        var paramList = [];
           $.each(checkoutResult, function(index, objStr) {
                var checkoutParam = {
                    toString : function() {
                        return JSON.stringify(this);
                    }
                };
                var obj = objStr;
                var playMethod=LotteryInfo.getPlayMethodId(LotteryInfo.getLotteryTypeByTag(checkoutResult[index].lotteryType),checkoutResult[index].lotteryType,checkoutResult[index].playMethodIndex);
                checkoutParam.BetContent = tzContentToNum(LotteryInfo.getLotteryIdByTag(checkoutResult[index].lotteryType), playMethod, obj.nums);
                checkoutParam.BetCount = obj.notes;
                checkoutParam.PlayCode = playMethod;
                checkoutParam.IssueNumber = newFactCNumber;
                checkoutParam.BetRebate = obj.rebates.split(",")[0];
                checkoutParam.BetMoney = obj.money;
                checkoutParam.BetMultiple = obj.multiple;

                if(obj.sntuo==1){
                    checkoutParam.BetMode = 1;
                }else if(obj.sntuo==2){
                    checkoutParam.BetMode = 16;
                }else if(obj.sntuo==3){
                    checkoutParam.BetMode = 8;
                }else{
                    checkoutParam.BetMode = 0;
                }
                paramList.push(checkoutParam);
            });

        if (1000 < paramList.length) {
            resetFukanFlag();
            toastUtils.showToast("您的订单不能超过1000条!");
            return;
        }

        if (paramList.length <= 0) {
            resetFukanFlag();
            toastUtils.showToast("您当前网速不给力，建议稍后重新操作!");
            return;
        }
     ajaxUtil.ajaxByAsyncPost(null, '{"UserIDList":[0],"ProjectPublic_PlatformCode":2,"InterfaceName":"GetUserAllMoney"}', function(response) {
           if (true == response.state) {
                var yue = response.lotteryMoney;
                var totalMoney = $('#checkOutPage_money').html();
                var result = bigNumberUtil.minus(yue, totalMoney);
                var zero = new BigNumber("0");
                if (result >= zero) {   
                    var params = '{"UserBetInfo":{"LotteryCode":'+ parseInt(lotteryId, 10) +',"Bet":[' + paramList.join(",") +']},"ProjectPublic_PlatformCode":2,"InterfaceName":"UserBet20160412"}';
                    ajaxUtil.ajaxByAsyncPost(null,params,function(data) {
                                if (null == data) {
                                    toastUtils.showToast("您当前网速不给力，建议稍后重新操作!");
                                    return;
                                }

                                if(true == data.state){
                                    var childrens = $("#listviewid").children();
                                    $.each(childrens, function(index, item) {
                                            $(item).remove();
                                    });
                                    $.ui.blockUI(.2);
                                    ajaxUtil.ajaxByAsyncPost(null, '{"UserIDList":[0],"ProjectPublic_PlatformCode":2,"InterfaceName":"GetUserAllMoney"}', function(response) {
                                        if (true == response.state) {
                                            var yue = response.lotteryMoney;
                                            localStorageUtils.setParam("lotteryMoney", yue); //保存余额
                                        }
                                    });

                                    //*** 弹窗显示查看记录的按钮 ****
                                    $.ui.popup(
                                        {
                                            title:"提示：",
                                            message:'投注成功',
                                            cancelText:"查看记录",
                                            cancelCallback:
                                                function(){
                                                   //@ 重置为默认玩法
                                                   /* if(currentTouzhuInfo.lotteryType){
                                                        eval(currentTouzhuInfo.lotteryType+"ResetPlayType()");
                                                    }*/
                                                    localStorageUtils.removeParam("playMode");
                                                    localStorageUtils.removeParam("playBeiNum");
                                                    localStorageUtils.removeParam("playFanDian");
                                                    createInitPanel_Fun("myBettingRecords",true);
                                                    //清除数据
                                                    checkOut_clearData();
                                                    //cancel
                                                    if($.query("BODY DIV#mask")){
                                                        $.query("BODY DIV#mask").unbind("touchstart");
                                                        $.query("BODY DIV#mask").unbind("touchmove");
                                                        $("BODY DIV#mask").remove();
                                                    }
                                                },
                                            doneText:"继续投注",
                                            onShow:function(){
                                                setTimeout(function(){
                                                    if($.query("BODY DIV#mask").length == 0){
                                                        opacity = " style='opacity:0.8;'";
                                                        $.query("BODY").prepend($("<div id='mask'" + opacity + "></div>"));
                                                        $.query("BODY DIV#mask").bind("touchstart", function (e) {
                                                            e.preventDefault();
                                                        });
                                                        $.query("BODY DIV#mask").bind("touchmove", function (e) {
                                                            e.preventDefault();
                                                        });
                                                    }
                                                },50);
                                            },
                                            doneCallback:
                                                function(){
                                                    createInitPanel_Fun(currentTouzhuInfo.lotteryType+"Page",true);
                                                    //清除数据
                                                    checkOut_clearData();
                                                    //done
                                                    if( $.query("BODY DIV#mask")){
                                                        $.query("BODY DIV#mask").unbind("touchstart");
                                                        $.query("BODY DIV#mask").unbind("touchmove");
                                                        $("BODY DIV#mask").remove();
                                                    }
                                                },
                                            cancelOnly:false
                                        });
                                }else{
                                    if (data.mark == -1){
                                        toastUtils.showToast("您还没有完成与下级的分红契约，无法投注！");
                                    }else{
                                        resetFukanFlag();
                                        toastUtils.showToast("投注失败");
                                    }
                                }
                           },null);
                      } else {
                            resetFukanFlag();
                            toastUtils.showToast("余额不足");
                     }
                }else if (-1 == response.state){
                            loginAgain();
                }else if(response.SystemState=="-2"){
                    toastUtils.showToast("您的账号已在别处登录");
                    loginAgain();
                }else {
                    resetFukanFlag();
                    toastUtils.showToast("获取余额失败！");
                }
         },'正在生成订单');
}

/**
 *点击“付款”按钮时，如果提交数据异常中断，则需重置某些数据
 */
function resetFukanFlag() {
    //表示用户可以点击“付款”按钮
    syncPay = true;
}

/**
 * @Author:      muchen
 * @DateTime:    2014-12-03 14:17:27
 * @Description: 动态创建投注列表item
 */
function addListViewItem() {
    $("#listviewid").empty();
    zhushuzongs=0;
    var zongjine = 0;
    $.each(checkoutResult, function(k, v){
        if(!isNullObj(v)){
            zongjine = bigNumberUtil.add(zongjine,v.money).toString();
            //所有-定位胆，北京快乐8-五行，江苏快3-和值-单挑一骰，pk拾-猜冠军，大小单双，都只显示playType的名称。
            if((LotteryInfo.getLotteryTypeByTag(v.lotteryType) == "sd" || LotteryInfo.getLotteryTypeByTag(v.lotteryType) == "pls")
                && v.playTypeIndex == 4){//3D  排列3不定胆
                getItemLi(v.nums, v.playType+"_"+v.playMethod.substring(0,2), v.notes,k,Number(v.multiple), v.rebates, v.playMode,v.money);
            }else if(LotteryInfo.getLotteryTypeByTag(v.lotteryType) == "ssc" && v.playMethodIndex == 57){//时时彩定位胆
                getItemLi(v.nums, v.playType+"_"+ v.playMethod, v.notes,k,Number(v.multiple), v.rebates, v.playMode,v.money);
            }else if(LotteryInfo.getLotteryTypeByTag(v.lotteryType) == "ssc" && v.playTypeIndex == 9){//时时彩大小单双
                getItemLi(v.nums, v.playMethod+v.playType, v.notes,k,Number(v.multiple), v.rebates, v.playMode,v.money);
            }else if(LotteryInfo.getLotteryTypeByTag(v.lotteryType) == "esf" && (v.playTypeIndex == 3 || v.playTypeIndex == 4)){//11选5定位胆/不定胆
                getItemLi(v.nums, v.playMethod+v.playType, v.notes,k,Number(v.multiple), v.rebates, v.playMode,v.money);
            }else if(LotteryInfo.getLotteryTypeByTag(v.lotteryType) == "esf" && v.playTypeIndex == 2){//11选5前一
                getItemLi(v.nums, v.playType, v.notes,k,Number(v.multiple), v.rebates, v.playMode,v.money);
            }else if(LotteryInfo.getLotteryTypeByTag(v.lotteryType) == "ssl" && (v.playTypeIndex == 3 || v.playTypeIndex == 4)){//上海时时乐前一/后一
                getItemLi(v.nums, v.playType, v.notes,k,Number(v.multiple), v.rebates, v.playMode,v.money);
            }else if(v.playMethod == v.playType){
                getItemLi(v.nums, v.playType, v.notes,k,Number(v.multiple), v.rebates, v.playMode,v.money);
            }else{
                getItemLi(v.nums, v.playType+"_"+ v.playMethod, v.notes,k,Number(v.multiple), v.rebates, v.playMode,v.money);
            }
        }
    });
    getCheckOutNotesAndMoney(zongjine);
    //获取彩种标题
    $("#ticcket_name").html(LotteryInfo.getLotteryNameByTag(currentTouzhuInfo.lotteryType));
}

/**
 * @Author:      muchen
 * @DateTime:    2014-12-03 14:16:06
 * @Description: 机选
 */
function checkOut_jixuan(){
    var lotteryCate = LotteryInfo.getLotteryTypeByTag(currentTouzhuInfo.lotteryType);
    if(currentTouzhuInfo.sntuo == "3" || currentTouzhuInfo.sntuo == "1" || getplayid(LotteryInfo.getId(lotteryCate,currentTouzhuInfo.lotteryType),LotteryInfo.getMethodId(lotteryCate,currentTouzhuInfo.playMethodIndex))){
        toastUtils.showToast("不能机选，请手选号码！",2000);
        $.ui.blockUI(.1);
        setTimeout(function () {
            $.unblockUI();
        }, 2000);
    }else {
        var conId = getLotteryConid();
        var randomObject = clickForRandom(eval(currentTouzhuInfo.lotteryType + '_checkOutRandom'),[currentTouzhuInfo.playTypeIndex,currentTouzhuInfo.playMethodIndex]);
        var submitParams = new LotterySubmitParams();
            submitParams.lotteryType = currentTouzhuInfo.lotteryType;
            submitParams.playType = currentTouzhuInfo.playType;
            submitParams.playMethod =  currentTouzhuInfo.playMethod ;
            submitParams.playTypeIndex = currentTouzhuInfo.playTypeIndex ;
            submitParams.playMethodIndex = currentTouzhuInfo.playMethodIndex ;
            submitParams.nums = randomObject.nums;
            submitParams.notes = randomObject.notes;
            submitParams.sntuo = randomObject.sntuo;
            submitParams.multiple = randomObject.multiple;
            submitParams.rebates = randomObject.rebates;
            submitParams.playMode = randomObject.playMode;
            submitParams.money = randomObject.money;
            submitParams.award = randomObject.award;
            submitParams.maxAward = randomObject.maxAward;

            checkoutResult.splice(0, 0, submitParams);
            refreshLocalResultList(checkoutResult);
            addListViewItem();
    }
}

/**
 * @Author:      muchen
 * @DateTime:    2014-12-13 09:29:24
 * @Description:  计算组数和金额
 */
function getCheckOutNotesAndMoney (zongjine){
    if(zhushuzongs==null){
        $("#checkOutPage_zhushu").html("0");
    }else{
        $("#checkOutPage_zhushu").html(zhushuzongs);
    }
    $("#checkOutPage_money").html(parseFloat(zongjine));
    $("#checkOut_lottery_money").html(localStorageUtils.getParam("lotteryMoney"));
}

/**
 * @Author:      muchen
 * @DateTime:    2014-12-13 11:37:23
 * @Description: 随机创建删除按钮id
 */
function getConID(){
    return "conID" + parseInt(Math.random() * 1000000);
}

 /**
  * @Author:      muchen
  * @DateTime:    2014-12-13 11:36:40
  * @Description: 创建投注信息的每一个item
  */
 function getItemLi(nums, playName, notes, conId, multiple, playRebates, playMode, money, zongjine){
     var temp = zongjine;
     var $itemLi = $('<li class="delNumF" style="background: #fff;padding-top: 0px;padding-bottom: 2px;padding-right: 1px;padding-left: 1px;"><div class="delNum"><p style="color: #dd2936;font-size: 16px;width: 88%;font-weight: bold;overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">'+ nums +'</p><p style="color: #9B9A9A;"><span >'+ playName +'</span>&nbsp;&nbsp;<span data-inline="true">'+ notes +'</span>注&nbsp;&nbsp;<span>'+multiple+'</span>倍<br />返点<span>['+playRebates+']</span>&nbsp;&nbsp;<span>'+getPlayMode(playMode)+'</span>&nbsp;&nbsp;<span>'+money+'</span>元</p></div></li>');
     var $itemLi_a = $('<div onclick="del(' + conId + ')" id="' + conId + '" style="position: absolute;left:80%;top:10%;width:50px;height:50px;text-align:center;padding-top:10px;"><img src="images/del.png" style="width:24px; height:24px;"/></div>');
     $itemLi.append($itemLi_a);
     $("#listviewid").append($itemLi);
     zhushuzongs += parseInt(notes);
 }
// 判断并显示每一注的投注模式  requirement
function getPlayMode(playMode) {
    switch(playMode) {
        case "4":
            return "元模式";
            break;
        case "2":
            return "角模式";
            break;
        case "1":
            return "分模式";
            break;
        case "8":
            return "厘模式";
            break;
        default: break;
    }
}

//动态删除LI
function del(liId) {
    checkoutResult.splice(liId, 1);
    //动态创建投注列表view
    addListViewItem();
}

/**
 * 判断对象是否为空
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
function isNullObj(obj){
    for(var i in obj){
        if(obj.hasOwnProperty(i)){
            return false;
        }
    }
    return true;
}
