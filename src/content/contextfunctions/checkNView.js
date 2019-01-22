contextController.checkNView = function() {
	var preview = "";
	if (/(^|&|\?)nview={0,1}/.test(location.search)) {
		// get nview from query string
		preview = location.search.replace(/.*(^|&|\?)nview={0,1}/,"").replace(/&.*/,"");
	} else {
		//get nview from body class
		preview = document.querySelector("body").className.replace(/^n_/,"");
	}
	
	return({preview: preview});
}