//setup listener in case popup left open when results returned
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	process_message(request, sender, sendResponse);
});

function process_message(request, sender, sendResponse) {
	//interpret modifications
	switch (request.title) {
		case "get-filter-url":
   sendResponse({target:"popup",title:"filter-url",filter_url:generate_filter_url()});

			break;
		case "clear-out":
			clear_modifications();
			break;
		default:
	}
}

function generate_filter_url() {
	var main_url = window.location.hostname+window.location.pathname;
	var filter_string = generate_filter_string();
	
	return main_url+filter_string;
}

function generate_filter_string() {
	var filter_string = "";
	
	var filter_elements = document.querySelectorAll("[name*='_ftr_'],[name*='_sb_']");	
	for (var fil_i = 0; fil_i < filter_elements.length; fil_i++) {
		filter_string=check_element_add_filter(filter_elements[fil_i], filter_string);
	}
	
	//fix ; in the url
	filter_string = filter_string.replace(/;/g,"%3b");
	
	return filter_string;
}


function check_element_add_filter(pot_elem, start_fil_string){
	var new_fil_string = start_fil_string;
	
	// check for multiple type select
	if (pot_elem.selectedOptions != null && pot_elem.multiple) {
		for (var el_i = 0; el_i < pot_elem.selectedOptions.length; el_i++) {
			new_fil_string = append_filter(new_fil_string, pot_elem.getAttribute("name"), pot_elem.selectedOptions[el_i].value);
		}
	} // else check if value exists
	else if (pot_elem.value!=null) {
		if (pot_elem.value != "") {
			new_fil_string = append_filter(new_fil_string, pot_elem.getAttribute("name"), pot_elem.value);
		}
	}
	return new_fil_string;
}

function append_filter(original_string, filter_name, filter_value) {
	
	var new_string = original_string;
	if (new_string.length > 0) {
		new_string+="&";
	} else {
		new_string+="?"
	}
	new_string+=filter_name+"="+filter_value;
	
	return new_string;
}

function update_window_url() {
		window.history.replaceState("", "", generate_filter_string());
}

function auto_filter_setup() {
		var filter_elements = document.querySelectorAll("[name*='_ftr_'],[name*='_sb_']");	
		for (var fil_i = 0; fil_i < filter_elements.length; fil_i++) {
			filter_elements[fil_i].addEventListener('input', function() {update_window_url()});
		}
		update_window_url();
}

function gen_repair_url(base_path, required_inputs, optional_inputs) {
	//make sure base url matches
	if (base_path != window.location.pathname) {
		return null;
	}
	
	requirements_met = true;
	var repaired_url = base_path + "?";
	
	var req_keys = Object.keys(required_inputs);
	
	// add required inputs
	for (var req_i = 0; req_i < req_keys.length; req_i++) {
		req_element = document.getElementsByName("itemForm")[0][req_keys[req_i]];
		if (req_element!=null) {
			if (req_element.value == required_inputs[req_keys[req_i]]) {
				repaired_url+=req_keys[req_i]+"="+req_element.value+"&"
			}	else {
			requirements_met = false;
			break;
			}
		}else {
			requirements_met = false;
			break;
		}
	}
	
	//add options inputs
	for (var opt_i = 0; opt_i < optional_inputs.length; opt_i++) {
		opt_element = document.getElementsByName("itemForm")[0][optional_inputs[opt_i]];
		if (opt_element!=null) {
			repaired_url+=optional_inputs[opt_i]+"="+opt_element.value+"&"
		}
	}
	
	if (requirements_met) {
		return repaired_url.slice(0, -1);
	} else {
		return null;
	}
}

function repair_url(base_path,required_input,optional_input) {
	var	new_url= gen_repair_url(base_path,required_input,optional_input);
		if (new_url!=null) {
				window.history.replaceState("", "", new_url);
	}
}

// URL automations
chrome.storage.sync.get(null, function(stored_options) {
	// automatically update filter page url
	if (stored_options["auto-filter-page-url"]) {
		auto_filter_setup();
	}

	// order
	if (stored_options["auto-repair-order-url"]) {
		repair_url("/cgi-bin/suppliers/index.cgi", {"item":"order","page":"vieworder"}, ["id","warehouse"]);
	}	
	// advanced config
	if (stored_options["auto-repair-adv-conf-url"]) {
		repair_url("/cgi-bin/suppliers/index.cgi", {"item":"config","page":"view"}, ["id","mod"]);
	}
	
	// coupon
	if (stored_options["auto-repair-coupon-url"]) {
		repair_url("/cgi-bin/suppliers/index.cgi", {"item":"discounts","page":"view"}, ["id"]);
	}
});


	
