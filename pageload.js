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
	var domain = window.location.hostname+window.location.pathname;
	var filter_string = "";
	
	var filter_elements = document.querySelectorAll("[name*='_ftr_'],[name*='_sb_']");	
	for (var fil_i = 0; fil_i < filter_elements.length; fil_i++) {
		filter_string=check_element_add_filter(filter_elements[fil_i], filter_string);
	}
	
	//fix ; in the url
	filter_string = filter_string.replace(/;/g,"%3b");
	
	return domain+filter_string;
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