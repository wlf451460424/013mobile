
/*进入panel时调用*/
function transferRecordDetailLoadedPanel(){
	catchErrorFun("transferRecordDetailInit();");
}
/*离开panel时调用*/
function transferRecordDetailUnloadedPanel(){
	 
}
function transferRecordDetailInit(){
    var myTransferRecordItem = JSON.parse(localStorageUtils.getParam("myTransferRecord"));
    $("#transferDetail_order").html(myTransferRecordItem.orderId);
    $("#transferDetail_source").html(transferDetail(myTransferRecordItem.DetailsSource));
    $("#transferDetail_money").html(myTransferRecordItem.TransferMoney);
    $("#transferDetail_state").html(myTransferRecordItem.state);
    $("#transferDetail_time").html(myTransferRecordItem.InsertTime);
    $("#transferDetail_maks").html(myTransferRecordItem.Marks);
}