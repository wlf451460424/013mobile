/* 
* @Author: Administrator
* @Date:   2016-02-17 08:49:36
* @Last Modified by:   Administrator
*/
'use strict';
//用户名
var userName = "";
//真实姓名
var realName = "";
//用户注册银行
var userBank = "";
//用户注册银行卡号
var userBankNo = "";
//资金密码状态
var isHasPayPwd = "";
//用户省份
var userProv = "";
//用户城市
var userCity = "";
/**
 * 进入页面加载
 * [modifyBankInfoLoadedPanel description]
 * @return {[type]} [description]
 */
function modifyBankInfoLoadedPanel(){
  catchErrorFun("modifyBankInfoInit();");
}
/**
 * 页面离开时加载
 * [modifyBankInfoUnloadedPanel description]
 * @return {[type]} [description]
 */
function modifyBankInfoUnloadedPanel(){
	$("#userRealName").val("");
	$("#bankcard").val("");
	$("#Sub_branch").val('');
	$("#bank").empty();
	$("#prov").empty();
	$("#city").empty();
}
/**
 * 初始化
 * [modifyBankInfoInit description]
 * @return {[type]} [description]
 */
function modifyBankInfoInit(){
	$("#bank").empty();
	$("#bank").append('<option value="noselect">请选择银行</option><option value="icbc">中国工商银行</option><option value="abc">中国农业银行</option><option value="ccb">中国建设银行</option><option value="cmb">招商银行</option><option value="comm">交通银行</option><option value="boc">中国银行</option><option value="ceb">中国光大银行</option><option value="citic">中信银行</option><option value="cib">兴业银行</option><option value="psbc">中国邮政银行</option><option value="hxb">华夏银行</option><option value="spdb">上海浦东发展银行</option><option value="bob">北京银行</option><option value="gdb">广发银行</option><option value="gzb">广州银行</option><option value="hzb">杭州银行</option><option value="bos">上海银行</option><option value="sdb">平安银行</option><option value="czb">浙商银行</option><option value="bod">东莞银行</option><option value="cbhb">渤海银行</option>');
	myUserID = localStorageUtils.getParam("myUserID");
	userName = localStorageUtils.getParam("username");
	isHasPayPwd = localStorageUtils.getParam("isHasPayPwd");
	realName = localStorageUtils.getParam("realName");
	// userProv = localStorageUtils.getParam("userProv");
	// userCity = localStorageUtils.getParam("userCity");
	userProv = "";
	userCity = "";
	$("#ProvCity").citySelect({
		prov : userProv, //省份
		city : userCity, //城市
		dist : "", //区县
		nodata : "block", //当子集无数据时，隐藏select
		required : true
	});

	if (realName == "") {
		$("#userRealName").attr("disabled", false);
	} else {
		$("#userRealName").attr("disabled", true);
		$("#userRealName").val(realName.substring(1,0)+"**");
	}
	//绑定button单击事件
	$("#submit").off('click');
	$("#submit").on("click", function() {
		var regu = /^[a-zA-Z0-9\u4e00-\u9fa5]+$/;
		//数字验证
		var sz = /^[0-9]*$/;
		var realNameVal = realName ? realName : $("#userRealName").val();  //判断是否已经存在真实姓名
		var userBankNoVal = $("#bankcard").val();
		var userBankVal = $("#bank").val();
		var subBranch = $("#Sub_branch").val().trim();
		userProv = $("#prov").val();
		userCity = $("#city").val();
		var isDefault = $("#IsDefaultBank").val();

		if (realNameVal == "") {
			toastUtils.showToast("真实姓名不能为空");
			return;
		} else if (!regu.exec(realNameVal)) {
			toastUtils.showToast("持卡人姓名只能由汉字、字母、数字中的任意一种或多种组成");
			return;
		} else if (realNameVal.replace(/[^\x00-\xFF]/g, '**').length < 2) {
			toastUtils.showToast("请输入正确的长度,2-20个字节长度,一个汉字代表两个字节!");
			return;
		} else if (realNameVal.replace(/[^\x00-\xFF]/g, '**').length > 20) {
			toastUtils.showToast("真实姓名长度过长,请重新输入");
			return;
		} else if(/\s/.exec(realNameVal)!=null){
			toastUtils.showToast("真实姓名中不可包含空格");
			return;
		}

		if (userBankVal == "noselect") {
			toastUtils.showToast("开户银行不能为空");
			return;
		}
		if (userBankNoVal == "" || (userBankNoVal.length < 16) || (userBankNoVal.length > 19) || !sz.test(userBankNoVal)) {
			toastUtils.showToast("请输入正确的卡号");
			return;
		}

		if (userProv == '0' && userCity == '00'){
			toastUtils.showToast("请选择开户地址");
			return;
		}

		if (subBranch){
			if (getStrLength_EnCn(subBranch) < 2 || getStrLength_EnCn(subBranch)> 50){
				toastUtils.showToast("支行名称为2-50个字符");
				return;
			} else if(!regu.exec(subBranch)){
				toastUtils.showToast("只能由汉字、字母或数字组成");
				return;
			}
		}else{
			toastUtils.showToast("请输入支行名称");
			return;
		}

		//弹窗二次确认
		$.ui.popup(
			{
				title:"确认银行资料",
				message:'<p style="line-height: 22px;text-align:left;padding-left:15%;">持卡人姓名 : <i class="redtext">'+ ( $("#userRealName").val().slice(0,1)+ "**") +'</i><br>开户银行 : <i class="redtext">'+ bankValue[userBankVal].name+'</i><br>卡号 : <i class="redtext">'+userBankNoVal +'</i>'+ showBankLoca(userProv,userCity) + showBankSub(subBranch)+'</p>',
				cancelText:"取消",
				cancelCallback:
					function(){
					},
				doneText:"确定",
				doneCallback:
					function(){
					var param = '{"ProjectPublic_PlatformCode":2,"InterfaceName":"AddBankCard","Username":"'+userName+'","RealName":"' +realNameVal+ '","User_ID":"'+myUserID+'","BankCode":"' + userBankVal + '","CardNumber":"' + userBankNoVal + '","Province":"' + userProv + '","City":"' + userCity + '","BranchName":"'+ subBranch +'"}';
					ajaxUtil.ajaxByAsyncPost1(null, param, saveCallBack_info,null);
					},
				cancelOnly:false
			});
	});
}

//@ 判断是否显示省市
function showBankLoca(prov,city) {
	if (prov!='0' && city!='00'){
		var provName = data1[prov-1]['text'];
		var cityList = data1[prov-1]['city'];
		var cityName = "";
		$.each(cityList,function (k,v) {
			if (city == v.id){
				cityName = v.text;
			}
		});
	return '<br>开户地址 : <i class="redtext">'+provName+'-'+cityName+'</i>';
	}else{
		return "";
	}
}
//@ 判断是否显示支行
function showBankSub(subBranch) {
	var sub = subBranch.replace(/(^\s+)|(\s+$)/g, "");
	if (sub){
		return '<br>支行名称 : <i style="word-break: break-all;" class="redtext">'+sub+'</i>';
	}else{
		return "";
	}
}
/**
 * Description 修改银行卡资料回调函数
 * @param
 * @return data 服务端返数据
 */
function saveCallBack_info(data) {
	if (data.SystemState == 64) {
		if (data.ErrorLocal == 1) {
			localStorageUtils.setParam("isBankInfoChangeSuc", 'true');
			realName = realName ? realName : $("#userRealName").val();  //判断是否已经存在真实姓名
			userProv = $("#prov").val();
			userCity = $("#city").val();
			//更新本地数据
			localStorageUtils.setParam("realName", realName);
			// localStorageUtils.setParam("userProv", userProv);
			// localStorageUtils.setParam("userCity", userCity);
            toastUtils.showToast(data.Message);
			setPanelBackPage_Fun('showBankInfo');
		} else if(data.ErrorLocal == -1) {
			toastUtils.showToast(data.Message);
		} else if(data.ErrorLocal == 0){
			toastUtils.showToast(data.Message);
		} else if(data.ErrorLocal == -2){
			toastUtils.showToast(data.Message);
		}
	}else {
		toastUtils.showToast("资料更新失败!");
	}
}

/*验证真实姓名中不可输入空格*/
function realNameNoSpace(e,realNameText) {
	var reg = /\s/;
	if(reg.exec(realNameText)!=null){
		$("#userRealName").val(realNameText.replace(/(^\s*)|(\s*$)/g,""));
	}
}