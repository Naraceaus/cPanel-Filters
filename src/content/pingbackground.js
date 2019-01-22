// might move this to it's own content script
var domain_message = {
	type:'analyse',
	loc: {
		domain: location.hostname,
		path: location.pathname
	}
}
sendMessage(domain_message);

var contextController = function() {
	function listenForContextRequests(request, sender, sendResponse) {
		if (request.target == "contextController" && this[request.func] != undefined) {
			var response = this[request.func](request.input);
			if (typeof response != "undefined") {
				sendResponse(response);
			}
		}
	};
	
	listenForMessages(listenForContextRequests);
	
	return this;
}



