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
	
	var filter_elements = $("[name*='_ftr_'],[name*='_sb_']");	
	filter_elements.each(function(index) {
		var filter_element = $(this);
		filter_string=check_element_add_filter(filter_element, filter_string);
	});
	
	
	//fix ; in the url
	filter_string = filter_string.replace(/;/g,"%3b");
	
	return domain+filter_string;
}

function check_element_add_filter(pot_elem, start_fil_string){
	var new_fil_string = start_fil_string;
	
	//check not null
		if (pot_elem.val()!=null) {
		
		// check if array
		if (pot_elem.val().constructor === Array) {
			$.each(pot_elem.val(), function(index) {
				new_fil_string = append_filter(new_fil_string, pot_elem.attr("name"), this);
			});
		} else	if (pot_elem.val() != "") {
			new_fil_string = append_filter(new_fil_string, pot_elem.attr("name"), pot_elem.val());
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