chrome.runtime.onInstalled.addListener(function () {
 initialise_options();
});

function initialise_options() {
	chrome.storage.sync.get(null, function(stored_options) {
		var default_options = {};
		default_options["auto-filter-page-url"]=true;
		default_options["auto-repair-order-url"]=true;
		
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