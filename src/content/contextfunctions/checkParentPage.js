contextController.checkNView = function() {
	var parentpage = window.location.pathname == "/_cpanel/products/view" && document.querySelector("span[title='Parent Product']") != null;
			sendResponse({parentpage: parentpage});
}