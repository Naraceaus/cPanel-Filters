contextController.checkNView = function() {
	var orderpage = document.querySelector("[href='javascript:freeorder();']")!=null && document.querySelector("[id^='line-_rshq0']")!=null;
	sendResponse({orderpage: orderpage});
}