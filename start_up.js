chrome.runtime.onInstalled.addListener(function () {
 initialise_options();
});

function initialise_options() {
	chrome.storage.sync.get(null, function(stored_options) {
		var default_options = {};
		default_options["auto-filter-page-url"]=true;
		default_options["auto-repair-order-url"]=true;
		default_options["auto-repair-adv-conf-url"]=true;
		default_options["auto-repair-coupon-url"]=true;
		default_options["auto-repair-refund-url"]=true;
		default_options["auto-repair-ship-rates-url"]=true;
		default_options["auto-repair-ship-methods-url"]=true;
		default_options["auto-repair-pay-terms-url"]=true;
		default_options["auto-repair-pay-plan-url"]=true;
		default_options["auto-repair-pre-pack-url"]=true;
		default_options["auto-repair-ship-group-url"]=true;
		default_options["auto-repair-ship-zone-url"]=true;
		default_options["auto-repair-prod-group-url"]=true;
		default_options["auto-repair-dispute-url"]=true;
		default_options["auto-repair-seo-url"]=true;
		default_options["auto-repair-canned-url"]=true;
		default_options["auto-repair-cus-doc-url"]=true;
		default_options["auto-repair-doc-temp-set-url"]=true;
		default_options["auto-repair-imp-exp-url"]=true;
		default_options["auto-repair-cus-conf-url"]=true;
		default_options["prepend-view-order-method-ids"]=true;
		default_options["append-id-to-cust-customer-fields"]=true;
		default_options["prepend-ids-in-ship-matrix"]=true;
		
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
});

function process_message(request, sender, sendResponse) {
 //interpret modifications
 switch (request.title) {
		case "open-tab":
   open_tab(request.url);
			break;
		default:
 }
}

function open_tab(url) {
	chrome.tabs.create({url:url,selected:false}, function (tabs) {});
}
