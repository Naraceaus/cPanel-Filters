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

function setup_auto_url() {
		var filter_elements = document.querySelectorAll("[name*='_ftr_'],[name*='_sb_']");	
		for (var fil_i = 0; fil_i < filter_elements.length; fil_i++) {
			filter_elements[fil_i].addEventListener('input', function() {update_window_url()});
		}
		update_window_url();
}

function generate_order_url() {
	var order_url = "/cgi-bin/suppliers/index.cgi?item=order&page=vieworder"
	var order_id = document.getElementsByName("itemForm")[0].id.value;
	var order_string="&id="+order_id;
	
	var warehouse_string="";
	//only include warehouse section if the element exists (it doesn't on quote pages)
	if (document.getElementsByName("itemForm")[0].warehouse != null) {
			var view_warehouse = document.getElementsByName("itemForm")[0].warehouse.value;
			warehouse_string = "&warehouse="+view_warehouse;
	}
	
	return order_url+order_string+warehouse_string;
}

function regenerate_order_url () {
	window.history.replaceState("", "", generate_order_url());
}

function generate_adv_conf_url() {
	var adv_conf_url = "/cgi-bin/suppliers/index.cgi?item=config&page=view"
	var adv_conf_id = document.getElementsByName("itemForm")[0].id.value;
	var adv_conf_string="&id="+adv_conf_id;
	
	var mod_val = document.getElementsByName("itemForm")[0].mod.value;
	var mod_string = "&mod="+mod_val;
	
	return adv_conf_url+adv_conf_string+mod_string;
}

function regenerate_adv_conf_url () {
	window.history.replaceState("", "", generate_adv_conf_url());
}

// URL automations
chrome.storage.sync.get(null, function(stored_options) {
	// automatically update filter page url
	if (stored_options["auto-filter-page-url"]) {
		setup_auto_url();
	}
	
	// automatically repair order page URL
	if (stored_options["auto-repair-order-url"]) {
		// possibly replace with some sort of document.itemForm element value checks
		if (document.querySelectorAll("form[name='itemForm'] input[name='page'][value='vieworder']").length == 1 && document.querySelectorAll("form[name='itemForm'] input[name='item'][value='order']").length == 1) {
			regenerate_order_url();
		}
	}
	
	// automatically repair advanced config URL
	if (stored_options["auto-repair-adv-conf-url"]) {
		// possibly replace with some sort of document.itemForm element value checks
		if (document.querySelectorAll("form[name='itemForm'] input[name='page'][value='view']").length == 1 && document.querySelectorAll("form[name='itemForm'] input[name='item'][value='config']").length == 1) {
			regenerate_adv_conf_url();
		}
	}
});
