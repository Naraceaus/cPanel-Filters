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
		case "find-page-in-cpanel":
   sendResponse({target:"popup",title:"found-cpanel-url",cpanel_url:find_url_in_cpanel()});
			break;
		case "highlight-adverts":
			remove_ad_highlight();
			sendResponse({target:"popup",title:"placed-ad-highlights",num_ads_found:place_ad_highlight()});
			break;
		case "de-highlight-adverts":
			sendResponse({target:"popup",title:"removed-ad-highlights",num_ads_removed:remove_ad_highlight()});
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

function find_url_in_cpanel() {
	//cpanel always uses https
	var host = "https://"+window.location.host;
	//remove the preceding "/"
	var path = window.location.pathname.slice(1);
	var cpanel_filter = "/_cpanel/url?_ftr_request_url=^";
	
	return host+cpanel_filter+path;
	
}

function remove_ad_highlight() {
	var num_ads_found = 0;
	var imgs_highlighted = document.querySelectorAll(".ad-high-cont img[src*='/assets/marketing");
	for (var ex_i = 0; ex_i < imgs_highlighted.length; ex_i++) {
		var high_img = imgs_highlighted[ex_i];
		var assumed_high_cont = high_img.parentElement;
		var assumed_cont_par = assumed_high_cont.parentElement;
		
		assumed_cont_par.appendChild(high_img);
		assumed_cont_par.removeChild(assumed_high_cont);
		num_ads_found++;
	}
	
	return num_ads_found;
}

function place_ad_highlight() {
	var num_ads_found = 0;
	var ad_imgs = document.querySelectorAll("img[src*='/assets/marketing']");
	for (var ad_i=0; ad_i < ad_imgs.length; ad_i++) {
		var advert = ad_imgs[ad_i];
		var advert_parent = advert.parentElement;
		var new_cont = document.createElement("div");
		new_cont.className="ad-high-cont";
		new_cont.style.position="relative";
		
		var high_link = document.createElement("a");
		high_link.className="ad-highlight";
		high_link.href=advert.src.replace("/assets/marketing/","/_cpanel/adw/view?id=").replace(".jpg","").replace(".png","");
		var high_btn = document.createElement("button");
		high_btn.type = "button";
		high_btn.textContent = "Open in cPanel";
		high_btn.style.position="absolute";
		high_btn.style.top="0px";
		high_btn.style.right="0px";
		high_link.appendChild(high_btn);
		
		new_cont.appendChild(advert);
		new_cont.appendChild(high_link);
		advert_parent.appendChild(new_cont);
		num_ads_found++;
	}
	return num_ads_found;
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
	
	// refund
	if (stored_options["auto-repair-refund-url"]) {
		repair_url("/_cpanel/refund", {}, ["id"]);
	}
	
	// shipping rates
	if (stored_options["auto-repair-ship-rates-url"]) {
		repair_url("/_cpanel/shippingcostmgr", {}, ["id"]);
		repair_url("/_cpanel/shippingcostmgr/view", {}, ["id"]);
	}
	
	// shipping methods
	if (stored_options["auto-repair-ship-methods-url"]) {
		repair_url("/_cpanel/shippinggroup", {}, ["id"]);
		repair_url("/_cpanel/shippinggroup/view", {}, ["id"]);
	}
	
	// payment terms
	if (stored_options["auto-repair-pay-terms-url"]) {
		repair_url("_cpanel/custerms", {}, ["id"]);
	}
	
	// payment plan
	if (stored_options["auto-repair-pay-plan-url"]) {
		repair_url("/_cpanel/orderplan", {}, ["id"]);
		repair_url("/_cpanel/orderplan/view", {}, ["id"]);
	}
	
	// predefined package
	if (stored_options["auto-repair-pre-pack-url"]) {
		repair_url("/_cpanel/package", {}, ["id"]);
		repair_url("/_cpanel/package/view", {}, ["id"]);
	}
	
	// shipping groups
	if (stored_options["auto-repair-ship-group-url"]) {
		repair_url("/_cpanel/shippingid", {}, ["id"]);
		repair_url("/_cpanel/shippingid/view", {}, ["id"]);
	}
	
	// shipping zones
	if (stored_options["auto-repair-ship-zone-url"]) {
		repair_url("/_cpanel/zone", {}, ["id"]);
		repair_url("/_cpanel/zone/view", {}, ["id"]);1
	}
	
	// product groups
	if (stored_options["auto-repair-prod-group-url"]) {
		repair_url("/_cpanel/itemgroups", {}, ["id"]);
		repair_url("/_cpanel/itemgroups/view", {}, ["id"]);
	}
	
	// dispute reasons
	if (stored_options["auto-repair-dispute-url"]) {
		repair_url("/_cpanel/dispute_reasons", {}, ["id"]);
		repair_url("/_cpanel/dispute_reasons/view", {}, ["id"]);
	}
	
	// SEO Entry
	if (stored_options["auto-repair-seo-url"]) {
		repair_url("/cgi-bin/suppliers/index.cgi", {"item":"seo","page":"view"}, ["id"]);
	}
	
	// canned response
	if (stored_options["auto-repair-canned-url"]) {
		repair_url("/_cpanel/cannedresponses", {}, ["id"]);
		repair_url("/_cpanel/cannedresponses/view", {}, ["id"]);
	}
	
	// custom doc
	if (stored_options["auto-repair-cus-doc-url"]) {
		repair_url("/_cpanel/custom_docs", {}, ["id"]);
		repair_url("/_cpanel/custom_docs/view", {}, ["id"]);
	}
		
	// Custom document template sets
	if (stored_options["auto-repair-seo-url"]) {
		repair_url("/cgi-bin/suppliers/index.cgi", {"item":"doctmpl","page":"view"}, ["id"]);
	}
	
	// import/export templates
	if (stored_options["auto-repair-imp-exp-url"]) {
		repair_url("/cgi-bin/suppliers/index.cgi", {"item":"dsimport","page":"view"}, ["id"]);
		repair_url("/cgi-bin/suppliers/index.cgi", {"item":"dsexport","page":"view"}, ["id"]);
	}
	
	// custom configs
	if (stored_options["auto-repair-cus-conf-url"]) {
		repair_url("/_cpanel/custom_configs", {}, ["id"]);
		repair_url("/_cpanel/custom_configs/view", {}, ["id"]);
	}
			
});