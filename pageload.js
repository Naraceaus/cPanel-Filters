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
		case "purge-server-cache":
			sendResponse({target:"popup",title:"purge-server-cache",status:purge_server_cache()});
			break;
		case "heavily-purge-server-cache":
			sendResponse({target:"popup",title:"heavily-purge-server-cache",status:heavily_purge_server_cache()});
			break;
		case "display-parent-fields":
			sendResponse({target:"popup",title:"display-parent-fields",status:display_parent_fields()});
			break;
		case "generate-zone-links":
			sendResponse({target:"popup",title:"generate-zone-links",status:generate_zone_links()});
			break;
		case "mark-orderlines-for-shipping":
			sendResponse({target:"popup",title:"mark-orderlines-for-shipping",status:mark_orderlines_for_shipping()});
			break;
		case "add-sh-cat-to-rates":
			sendResponse({target:"popup",title:"add-sh-cat-to-rates",status:add_sh_cat_to_rates()});
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
	if (filter_elements.length > 0) {
		update_window_url();
	}
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
		high_link.style.position = "absolute";
		high_link.style.left = "50%";
		high_link.style.marginRight = "-50%";
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

//Placing id numebrs in front of shipping method dropdowns on calc shipping for orders
function prepend_method_ids_to_calc_ship(enabled) {
	var itemForms = document.getElementsByName("itemForm");
	if (itemForms.length == 1 && enabled) {
		if (itemForms[0].item != null && itemForms[0].page!=null) {
			if (itemForms[0].item.value=="order" && itemForms[0].page.value=="vieworder") {
				var meth_options = document.querySelectorAll("[name='_odr_sh_gp'] option");

				for (var opt_i = 0; opt_i < meth_options.length; opt_i++) {
					var opt = meth_options[opt_i];
					
					opt.textContent = opt.value + " - " + opt.textContent;
				}
			}
		}
	}
}



// one customer cards add the id in brackets to the end of custom fields
function append_id_to_cust_customer_fields(enabled) {
	if (window.location.pathname == "/_cpanel/customer/view" && enabled) {
		var cu_els = document.querySelectorAll("[name*='_user_-usercustom']");

		for (cu_i = 0; cu_i<cu_els.length; cu_i++) {
			var cust_num = cu_els[cu_i].name.replace("_user_-usercustom","");
			var cu_label = find_parent_with_type(cu_els[cu_i],"label");
			cu_label.childNodes[0].nodeValue = cu_label.childNodes[0].nodeValue+" ("+cust_num+")";
		}

		function find_parent_with_type(element,type)
		{
			console.log(element,type);
			while(element.parentElement.querySelector(type) == null){
				element = element.parentElement;
					console.log(element,type);

			}
			
			return element.parentElement.querySelector(type);
		}
	}
}

//purge cache and refresh page
function purge_server_cache() {
	make_ajax_request("/_cpanel","ajaxfn=system_refresh&ajax=y",purge_server_sucessful);
	return "Purging Cache, page will refresh once cache is purged";
}

function purge_server_sucessful(ajax_response){
	if (ajax_response.responseText == "NSD1;#1|$2|ok$1|1") {
				chrome.runtime.sendMessage({target:"popup",title:"cache-purge",status:"Cache Purged"}, function() {});
				location.reload();
	} else {
				chrome.runtime.sendMessage({target:"popup",title:"cache-purge",status:"Unkown Error Occured. Send this to administrator: "+ajax_response.responseText}, function() {});
				location.reload();
	}
}

//heavily purge cache including querystring appended to js and css files allowing those fields to be purged on all machines
function heavily_purge_server_cache() {
	make_ajax_request("/_cpanel","tkn=webshop&proc=edit&ajax=y",purge_server_cache);
	return "Heavily Purging Cache, page will refresh once cache is purged";
}

function make_ajax_request(path,qry_str,success_func) {
	var ajax_request = new XMLHttpRequest();
	
	ajax_request.onreadystatechange=function() {
					if (ajax_request.readyState == XMLHttpRequest.DONE ) {
								if (ajax_request.status == 200) {
									if (ajax_request.responseText != "NSD1;#1|$5|error$13|NOT_LOGGED_IN") {
												success_func(ajax_request);
									} else {
												chrome.runtime.sendMessage({target:"popup",title:"ajax-result",status:"Server Request Failed. You are not logged into the cPanel. Please login to perfom this function"}, function() {});
									}
								}
								else if (ajax_request.status == 400) {
											chrome.runtime.sendMessage({target:"popup",title:"ajax-result",status:"400 Error, Bad Data"}, function() {});
								}
								else if (ajax_request.status == 404) {
											chrome.runtime.sendMessage({target:"popup",title:"ajax-result",status:"404 Error, This site does not have a cPanel"}, function() {});
								}
								else {
												chrome.runtime.sendMessage({target:"popup",title:"ajax-result",status:ajax_request.status+" Unknown Error"}, function() {});
								}
					}
	}
	ajax_request.open("POST","https://"+window.location.host+path, true);
	ajax_request.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
	ajax_request.send(qry_str);
}

//on parent products display fields normally hidden from the user
function display_parent_fields() {
	var hidden_fields = document.getElementsByClassName("cp-hide-inparent");
	var num_hidden_fields = hidden_fields.length;
	
	for (var hfi = 0; hfi < hidden_fields.length;) {
		hidden_fields[0].className = hidden_fields[0].className.replace("cp-hide-inparent","");
	}
	
	if (num_hidden_fields > 0) {
		return "Displayed "+num_hidden_fields+" parent fields";
	}
	return "No parent fields to display, make sure your active";
}

// add link shipping zones on services and rates
function generate_zone_links() {
	var zone_rows = document.querySelectorAll("[id*='znrow']");

	var num_zones_updated = 0;
	for (var zr_i = 0; zr_i < zone_rows.length; zr_i++) {
		var zone_row = zone_rows[zr_i];
		var zone_el_ref = zone_row.id.replace("znrow","");
		var zone_id = document.querySelector("[name='ra_zone"+zone_el_ref+"']").value;
		var code_element = document.getElementById("zncode"+zone_el_ref);
		if (code_element.firstChild.nodeName == "#text") {
			var zone_link = document.createElement("a");
			zone_link.innerText = code_element.innerText;
			zone_link.href = window.location.protocol+"//"+window.location.host+"/_cpanel/zone/view?id="+zone_id;
			code_element.replaceChild(zone_link, code_element.firstChild);
			num_zones_updated++;
		}
	}
	
	if (num_zones_updated > 0) {
		return "Converted "+num_zones_updated+" zones to links";
	}
	return "No zone links to convert";
}

function add_sh_cat_to_rates(){
	click_ad_sh_cat();
	var num_cat_added=1;
	var latestElement = 0;

	for (var i=0;document.getElementsByName("lnk_shid"+i).length>0;i++) {
		latestElement=i;
	}

	var numCats=document.getElementsByName("lnk_shid"+parseInt(latestElement))[0].length;
	for (var j=1;j<=numCats-1;j++) {
		console.log(latestElement+j-1);
		document.getElementsByName("lnk_shid"+parseInt(latestElement+j-1))[0].selectedIndex=j;
		if (j!=numCats-1) {
			click_ad_sh_cat();
			num_cat_added++;
		}
	}

	return num_cat_added+" category(-y+ies) added to rates";
	
	function click_ad_sh_cat() {
		var change_event = document.createEvent("HTMLEvents");
		change_event.initEvent("click", false, true);
		document.querySelector("[onclick='addShm()']").dispatchEvent(change_event);
	}
}

function mark_orderlines_for_shipping() {
	var lines_to_ship = document.querySelectorAll("[id*=line-_rshq]");
	var orderlines_shipped = 0;
	for (var li = 0;li<lines_to_ship.length; li++) {
		var cur_line = lines_to_ship[li];
		var line_id = cur_line.id.replace("line-_rshq","");
		var qty = document.getElementsByName("_itm_qty"+line_id)[0].value;
		cur_line.value = qty;
		
		// trigger change event
		var change_event = document.createEvent("HTMLEvents");
		change_event.initEvent("change", false, true);
		cur_line.dispatchEvent(change_event);
		
		orderlines_shipped++;
	}
	
	if (num_zones_updated > 0) {
		return "Marked "+num_zones_updated+" orderlines for shipping";
	}
	return "There are no orderlines to mark for shipping";
	
}

// Page Load Automations
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
	
	prepend_method_ids_to_calc_ship(stored_options["prepend-view-order-method-ids"]);
	append_id_to_cust_customer_fields(stored_options["append-id-to-cust-customer-fields"]);
});