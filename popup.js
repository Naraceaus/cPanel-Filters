document.addEventListener( "DOMContentLoaded", function() {
	
	
	//setup listener in case popup left open when results returned
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if (request.target=="popup") {
			process_message(request, sender, sendResponse);
		}
	});
	
	document.getElementById("refresh-filter").addEventListener("click", function () {
		get_filter_url();
	});
	get_filter_url();
});

function process_message(request, sender, sendResponse) {
 //interpret modifications
 console.log(request.title);

 switch (request.title) {
  default:
 }
}

function get_filter_url() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
				console.log("tell "+tabs[0].id+" I want filter URL");
    chrome.tabs.sendMessage(tabs[0].id, {title: "get-filter-url"}, function(response) {print_filter_url(response);});  
	});
}

function print_filter_url(response) {
	if (response!=null) {
		document.getElementsByName("filter-url")[0].value=response.filter_url;
	} else {
		document.getElementsByName("filter-url")[0].value="Error: Please refresh the active tab";
	}
}