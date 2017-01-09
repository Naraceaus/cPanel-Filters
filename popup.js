$( document ).ready(function() {
	
	
	//setup listener in case popup left open when results returned
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if (request.target=="popup") {
			process_message(request, sender, sendResponse);
		}
	});
	
	$("#refresh-filter").on("click", function () {
		get_filter_url();
	})
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
	$("[name='filter-url']").val(response.filter_url);
}