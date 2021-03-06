
var PAGESIZE_dailyWagesCtt = 10;
var QueryState = -1;

//@ Loaded
function dailyWagesContractThreeLoadedPanel(){
    catchErrorFun("dailyWagesContractThreeInit();");
}

//@ Unloaded
function dailyWagesContractThreeUnloadedPanel(){
    $("#dailyWagesCttList").empty();
    $("#dailyWagesCttScroller").scroller().scrollToTop();
    $("#dailyWagesCttScroller").scroller().clearInfinite();
    QueryState = -1;
}

//@ Init
function dailyWagesContractThreeInit() {
    $("#dailyWages_QueryState").empty();
    var $select=$('<table><tr><td><select name="dailyWagesQueryState" id="dailyWagesQueryState" data-theme="a" data-mini="true" onchange="changedailyWagesState()"><option value="-1" selected="selected">全部</option><option value="1">已签约</option><option value="0">修改待确认</option><option value="2">未签约</option></select></td></tr></table>');
    $("#dailyWages_QueryState").append($select);

    myUserID = localStorageUtils.getParam("myUserID");
    myUserName = localStorageUtils.getParam("username");
    page = 0;
    hasMorePage = true;
    QueryState = $("#dailyWagesQueryState").val();

    var _myScroller =  $("#dailyWagesCttScroller").scroller({
        verticalScroll : true,
        horizontalScroll : false,
        vScrollCSS: "afScrollbar",
        autoEnable : true
    });
    _myScroller.scrollToTop();
    _myScroller.clearInfinite();
    addUseScroller(_myScroller,'dailyWagesCttList','dailyWagesContractByScroll()');
    // Entrace
    loadDailyWagesCtt(QueryState);

    //Search Username
    $("#dailyWagesCttSearch").unbind('click');
    $("#dailyWagesCttSearch").bind('click', function(event) {
        searchDailyWagesUser();
    });

}

//@ 改变查询类型 - 自身 或 下级
function changedailyWagesState() {
    page = 0;
    QueryState = $("#dailyWagesQueryState").val();
    loadDailyWagesCtt(QueryState);
}

//@ First Page
function loadDailyWagesCtt(QueryState) {
    page = 0;
    dailyWagesContract_scroll(QueryState);
}

//@ NextPage
function dailyWagesContractByScroll(){
    QueryState = $("#dailyWagesQueryState").val();
    dailyWagesContract_scroll(QueryState);
}

//@ 请求列表数据
// 接口参数：UserType 和 AgentLevel 用于后台，前台置0即可.
function dailyWagesContract_scroll(QueryState) {
    ajaxUtil.ajaxByAsyncPost1(null, '{"InterfaceName":"GetDayWagesThreeList","ProjectPublic_PlatformCode":2,"UserName":"","DayWagesState":'+ QueryState +',"UserType":0,"AgentLevel":0,"CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_dailyWagesCtt + '}', loaddailyWagesCtt_callBack, '正在加载数据...');
}

//@ 数据返回
function loaddailyWagesCtt_callBack(data){
    if (page == 0) {
        $("#dailyWagesCttList").empty();
        $("#dailyWagesCttScroller").scroller().scrollToTop();
        $("#dailyWagesCttScroller").scroller().clearInfinite();
    }
    if(data ==null){
        toastUtils.showToast("没有数据");
        return;
    }
    var info = data.DayWagesThreeListModels;
    if (data.SystemState == 64 ){
        isHasMorePage(info,PAGESIZE_dailyWagesCtt);

        $.each(info,function (key,val) {
            var modifyDailyWages = {};
            modifyDailyWages.userID = val.UserID;
            modifyDailyWages.userName = val.UserName;
            modifyDailyWages.State = val.State;

            var $li = $('<li><a><dl class="orderList"><dd>用户名:&nbsp;' + val.UserName +
                '</dd><dd>返点:&nbsp;' + val.Rebate +
                '</dd><dd>日工资标准:&nbsp;' + bigNumberUtil.multiply(val.DayWagesProportion,100) +
                '%</dd><dd>状态:&nbsp;'+ getdailyWagesState(val.State)[0] +
                '</dd><dd><button onclick="dailyWages_ModifyCtt(this)" class="modifyCttBtn">'+ getdailyWagesState(val.State)[1] +
                '</button></dd></dl></a></li>').data('dailyWagesCttInfo',modifyDailyWages);

            $("#dailyWagesCttList").append($li);
        });

    }else if(data.SystemState == -1){
        loginAgain();
    }else if (info.length == 0) {
        toastUtils.showToast("没有数据");
        return;
    }else {
        toastUtils.showToast("当前网络不给力，请稍后再试");
        return;
    }
}

//@ 显示下级日工资状态
function getdailyWagesState(state) {
    switch (state){
        case 0:
            return ['待确认','修改契约'];
        case 1:
            return ['已签约','修改契约'];
        case 2:
            return ['未签约','签订契约'];
        case 3:
            return ['已拒绝','修改契约'];
    }
}

//@ 修改或签订契约
function dailyWages_ModifyCtt(element) {
    var info = jsonUtils.toString($(element).parents("li").data('dailyWagesCttInfo'));
    localStorageUtils.setParam("dailyWagesCttInfo",info);
    setPanelBackPage_Fun("modifyDailyWagesThree");
}

//@ 查找用户名
function searchDailyWagesUser(){
    $.ui.popup({
        title:"查询用户名",
        message:'<input type="text" id="searchdailyWagesUser" maxLength="25" placeholder="请输入要查找的用户名" />',
        cancelText:"关闭",
        cancelCallback:
            function(){
            },
        doneText:"确定",
        doneCallback:
            function(){
                var searchUser = $("#searchdailyWagesUser").val();
                if(searchUser == ""){
                    toastUtils.showToast("请输入要查找的用户名");
                    return;
                }
                page = 0;
                QueryState = $("#dailyWagesQueryState").val();
                ajaxUtil.ajaxByAsyncPost1(null, '{"InterfaceName":"GetDayWagesThreeList","ProjectPublic_PlatformCode":2,"UserName":"'+ searchUser +'","DayWagesState":'+ QueryState +',"UserType":0,"AgentLevel":0,"CurrentPageIndex":' + page + ',"CurrentPageSize":' + PAGESIZE_dailyWagesCtt + '}', loaddailyWagesCtt_callBack, '正在加载数据...');
            },
        cancelOnly:false
    });
}
