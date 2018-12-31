function auto_filter_setup() {
	var filter_elements = document.querySelectorAll("[name*='_ftr_'],[name*='_sb_']");	
	for (var fil_i = 0; fil_i < filter_elements.length; fil_i++) {
		filter_elements[fil_i].addEventListener('input', function() {update_window_url()});
	}
	if (filter_elements.length > 0) {
		update_window_url();
	}
}

function update_window_url() {
		window.history.replaceState("", "", "?"+generate_filter_string());
}

function generate_filter_string() {
	var filter_qs = new queryString(window.location.search);
	
	var filter_elements = document.querySelectorAll("[name*='_ftr_'],[name*='_sb_']");	
	for (var fil_i = 0; fil_i < filter_elements.length; fil_i++) {
		filter_qs=check_element_add_filter(filter_elements[fil_i], filter_qs);
	}
	
	//fix ; in the url
	var filter_string = filter_qs.toString().replace(/;/g,"%3b");
	return filter_string;
}


function check_element_add_filter(pot_elem, start_fil_qs){
	var new_fil_qs = start_fil_qs;
	
	// check for multiple type select
	if (pot_elem.selectedOptions != null && pot_elem.multiple) {
		for (var el_i = 0; el_i < pot_elem.selectedOptions.length; el_i++) {
			new_fil_qs.add_key(pot_elem.getAttribute("name"), pot_elem.selectedOptions[el_i].value);
		}
	} // else check if value exists
	else if (pot_elem.value!=null) {
		if (pot_elem.value != "") {
			new_fil_qs.add_key(pot_elem.getAttribute("name"), pot_elem.value);
		} else if (start_fil_qs.get_key(pot_elem.getAttribute("name")) != null) {
			new_fil_qs.remove_key(pot_elem.getAttribute("name"));
		}
	}
	return new_fil_qs;
}

function queryString(start_string) {
	
	this.contents = {};	
	
	this.add_key = function(key, value){
		this.contents[key] = value;
	}
	this.remove_key = function(key){
		delete this.contents[key];
	}
	this.add_from_string = function(qs) {
		qs = qs.replace("?","");
		if (qs.length > 0) {
			var qs_arr = qs.split("&");
			for (var qsi = 0; qsi < qs_arr.length; qsi++) {
				var qs_pair_str = qs_arr[qsi];
				qs_par_arr = qs_pair_str.split("=");
				this.add_key(qs_par_arr[0], qs_par_arr[1]);
			}
		}
	}
	
		
	if (typeof(start_string) == "string") {
		this.add_from_string(start_string);
	}
	
	this.get_key = function(key){
		return this.contents[key];
	}
	
	this.toString = function(){
		var result = "";
		var keys = Object.keys(this.contents);
		for (var ki = 0; ki < keys.length; ki++) {
			var key = keys[ki];
			var value = this.contents[key];
			result+=key
			if (value!=undefined) {
				result+="="+value;
			}
			if (ki != keys.length-1) {
				result+="&";
			}
		}
		return result;
	}
	
	
	return this;
}

auto_filter_setup();