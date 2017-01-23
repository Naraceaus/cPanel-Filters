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
	
	document.getElementById("find-page").addEventListener("click", function () {
		find_page_in_cpanel();
	});
	
	document.getElementById("highlight-adverts").addEventListener("click", function () {
		highlight_ads();
	});
	
	document.getElementById("de-highlight-adverts").addEventListener("click", function () {
		de_highlight_ads();
	});
	
	document.getElementById("purge-cache").addEventListener("click", function () {
		purge_server_cache();
	});
	
	document.getElementById("heavily-purge-cache").addEventListener("click", function () {
		heavily_purge_server_cache();
	});
	
	
	get_filter_url();
});

function process_message(request, sender, sendResponse) {
 //interpret modifications
 console.log(request.title);

 switch (request.title) {
		case "cache-purge":
   update_results(request.status);
			break;
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
		update_results(response.filter_url);
	} else {
		update_results("Error: Please refresh the active tab");
	}
}

function find_page_in_cpanel() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		console.log("tell "+tabs[0].id+" I want to find page in cPanel");
		chrome.tabs.sendMessage(tabs[0].id, {title: "find-page-in-cpanel"}, function(response) {print_found_cpanel_url(response);});  
	});
}

function print_found_cpanel_url(response) {
	if (response!=null) {
		chrome.tabs.create({url:response.cpanel_url,selected:true}, function (tab) {
					update_results(response.cpanel_url);
		});
	} else {
		document.getElementsByName("filter-url")[0].value="Error: Please refresh the active tab";
	}
}

function highlight_ads() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		console.log("tell "+tabs[0].id+" I want to highlight adverts");
		chrome.tabs.sendMessage(tabs[0].id, {title: "highlight-adverts"}, function(response) {print_placed_highlights(response)});  
	});
}

function de_highlight_ads() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		console.log("tell "+tabs[0].id+" I want to de highlight adverts");
		chrome.tabs.sendMessage(tabs[0].id, {title: "de-highlight-adverts"}, function(response) {print_removed_highlights(response)});  
	});
}

function print_placed_highlights(response) {
	if (response!=null) {
		update_results("Placed "+response.num_ads_found+" advert highlights");
	} else {
		document.getElementsByName("filter-url")[0].value="Error: Please refresh the active tab";
	}
}

function print_removed_highlights(response) {
	if (response!=null) {
		update_results("Removed "+response.num_ads_removed+" advert highlights");
	} else {
		document.getElementsByName("filter-url")[0].value="Error: Please refresh the active tab";
	}
}

function purge_server_cache() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		console.log("tell "+tabs[0].id+" I want to purge the server cache");
		chrome.tabs.sendMessage(tabs[0].id, {title: "purge-server-cache"}, function(response) {update_results(response.status)});  
	});
}

function heavily_purge_server_cache() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		console.log("tell "+tabs[0].id+" I want to HEAVILY purge the server cache");
		chrome.tabs.sendMessage(tabs[0].id, {title: "heavily-purge-server-cache"}, function(response) {update_results(response.status)});  
	});
}

function update_results(result) {
	document.getElementsByName("filter-url")[0].value=result;
}