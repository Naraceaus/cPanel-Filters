chrome.runtime.onInstalled.addListener(function () {
 initialise_options();
});

function initialise_options() {
	chrome.storage.sync.get(null, function(stored_options) {
		var default_options = {};
		default_options["prepend-view-order-method-ids"]=true;
		default_options["append-id-to-cust-customer-fields"]=true;
		default_options["prepend-ids-in-ship-matrix"]=true;
		default_options["enable-cPanel-auto-open"]=true;
		default_options["cPanel-auto-open-delay"]=0;
		default_options["minimise-tracking"]="globally";
		default_options["close-tracking"]="per-site";
		default_options["blacklist-domains"]=["www.neto.com.au","goto.neto.com.au","developers.neto.com.au"];
		
		var def_opt_keys = Object.keys(default_options);
		
		//loop over default settings and if they aren't set in extension options, set them to the default value
		for (var key_i = 0; key_i < def_opt_keys.length; key_i++) {
			if (stored_options[def_opt_keys[key_i]]==null) {
				var new_setting={};
				new_setting[def_opt_keys[key_i]] = default_options[def_opt_keys[key_i]]
				chrome.storage.sync.set(new_setting, function() {});
			}
		}
		
		chrome.storage.sync.set(default_options, function() {});
	});
}


//setup listener in so the backround page can do things with chrome.tabs that content scripts can't do
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.target=="background") {
		process_message(request, sender, sendResponse);
	}
	return true;
});

function process_message(request, sender, sendResponse) {
 //interpret modifications
 switch (request.title) {
		case "open-tab":
			open_tab(request.url);
			break;
		case "auto-open-cpanel":
			autoOpenCPanel(request.domain, sender.tab);
			break;
		case "get-n-view":
			checkNView(request.url, sendResponse);
		default:
 }
}

function open_tab(url) {
	chrome.tabs.create({url:url,selected:false}, function (tabs) {});
}

function autoOpenCPanel(domain, sender_tab) {
	var new_tab_options = {url:"https://"+domain+"/_cpanel",selected:false};
	if (sender_tab != null) {
		new_tab_options.index = sender_tab.index+1;
		new_tab_options.windowId = sender_tab.windowId;
	}
	chrome.tabs.query({url:["*://"+domain+"/_cpanel/*", "*://"+domain+"/cgi-bin/suppliers/index.cgi/*"]}, function (tabs_found) {
		if (tabs_found.length == 0) {
			chrome.tabs.create(new_tab_options, function (tabs) {});
		}
	});
}

function checkNView(url, sendResponse) {
	chrome.cookies.get({url:url,name:"ninfo_view"}, function(cookie) {
		var nview = null;
		
		if (cookie!=null) {
			var cookie_value_arr = decodeURIComponent(cookie.value).split("|");
			nview = cookie_value_arr[cookie_value_arr.length-1];
		}
		sendResponse({nview:nview});
	})
}

chrome.browserAction.onClicked.addListener(function callback(active_tab) {
	chrome.tabs.sendMessage(active_tab.id, {target:"tab",title:"generate-dialog"}, null, function() {});

});