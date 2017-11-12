//setup listener in case popup left open when results returned
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	process_message(request, sender, sendResponse);
});

function process_message(request, sender, sendResponse) {
	//interpret modifications
	switch (request.title) {
		case "find-page-in-cpanel":
			sendResponse({target:"popup",title:"found-cpanel-url",cpanel_url:find_url_in_cpanel()});
			break;
		case "reload-new-nview":
			sendResponse({target:"popup",title:"reload-new-nview",status:reload_new_nview(request.theme)});
			break;
//		case "get-page-info":
//			neto_page(function(){},"page-info");
//			break;
		case "generate-dialog":
			createSidePanel();
			break;
		default:
	}
}

function generate_filter_url() {
	var main_url = window.location.hostname+window.location.pathname;
	var filter_string = generate_filter_string();
	
	return main_url+"?"+filter_string;
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

function update_window_url() {
		window.history.replaceState("", "", "?"+generate_filter_string());
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
				// prepend select values
				var meth_options = document.querySelectorAll("[name='_odr_sh_gp'] option");

				for (var opt_i = 0; opt_i < meth_options.length; opt_i++) {
					var opt = meth_options[opt_i];
					
					opt.textContent = opt.value + " - " + opt.textContent;
				}
				
				//create go to method button
				var btn_icon = document.createElement("i");
				btn_icon.className = "icon-large icon-edit";
				var goto_link = document.createElement("a");
				goto_link.appendChild(btn_icon);
				goto_link.href = "javascript:void(0);";
				goto_link.title = "Open current method";
				goto_link.addEventListener('click', function() {
					window.open('https://'+window.location.hostname+'/_cpanel/shippinggroup/view?id='+document.querySelector("[name='_odr_sh_gp']").value,'_blank');
				});
				document.querySelector("[name='_odr_sh_gp']").parentElement.appendChild(goto_link);
			}
		}
	}
}

// labelling methods and rates better in the shipping matrix
function prepend_ids_in_ship_matrix(enabled) {
	// method prepending
	var method_containers = document.querySelectorAll(".shm-method-info-pl");
	for (var mci = 0; mci < method_containers.length; mci++) {
		cur_met = method_containers[mci];
		
		var name_el = cur_met.querySelector(".shm-method-name");
		while (name_el.children.length > 0) {
			name_el = name_el.children[0];
		}
		var method_id = cur_met.querySelector(".sh-group-id").value;
		name_el.textContent = method_id + " - " + name_el.textContent;
		
	}
	
	//rate prepending
	var rates_containers = document.querySelectorAll(".shm-config-sr");
	for (var rci = 0; rci < rates_containers.length; rci++) {
		cur_rate = rates_containers[rci];
		
		var name_el = cur_rate.querySelector(".sh-method-name");
		while (name_el.children.length > 0) {
			name_el = name_el.children[0];
		}
		var rate_id = cur_rate.querySelector(".sh-ref").value;
		name_el.textContent = rate_id + " - " + name_el.textContent;
		
	}
	
	//label prepending
	var label_containers = document.querySelectorAll(".shm-config-cl");
	for (var rci = 0; rci < label_containers.length; rci++) {
		cur_label = label_containers[rci];
		
		var name_el = cur_label.querySelector(".sh-acc-name");
		while (name_el.children.length > 0) {
			name_el = name_el.children[0];
		}
		var label_id = cur_label.querySelector(".sh-acc-id").value;
		name_el.textContent = label_id + " - " + name_el.textContent;
		
	}
	
	
}

function prepend_ids_in_label_config(enabled){
	document.querySelectorAll("[name*='sev_s']").forEach(function(service, index){
		if (/sev_s[0-9]*_m[0-9]/.test(service.name)) {
			serviceLabel = document.querySelector("label[for='"+service.name+"']");
			serviceLabel.innerText = service.value+" - "+serviceLabel.innerText;
		}
	});
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
			while(element.parentElement.querySelector(type) == null){
				element = element.parentElement;

			}
			
			return element.parentElement.querySelector(type);
		}
	}
}

function start_server_purge() {
	document.querySelector("#purge_btn").disabled = true;
	
	var heavy = document.querySelector("#heavy_purge").checked;
	var refresh = document.querySelector("#refresh_purge").checked;
	
	
	if (heavy) {
		heavily_purge_server_cache(refresh);
	} else {
		purge_server_cache(null, refresh);
	}
}

//heavily purge cache including querystring appended to js and css files allowing those fields to be purged on all machines
function heavily_purge_server_cache(refresh) {
	make_ajax_request("/_cpanel","tkn=webshop&proc=edit&ajax=y",purge_server_cache, null, false, [refresh]);
	document.querySelector("#purge_btn").innerText = "Updating CSS Config";
}
//purge cache and refresh page
function purge_server_cache(ajax_response, refresh) {

	make_ajax_request("/_cpanel","ajaxfn=system_refresh&ajax=y",purge_server_sucessful, null, false, [refresh]);
	
	var update_text = "Purging Server Cache";
	if (refresh) {
		update_text+=", page will refresh once cache is purged";
	}
	
	document.querySelector("#purge_btn").innerText = update_text;
}

function purge_server_sucessful(ajax_response, refresh){
	document.querySelector("#purge_btn").disabled = false;
	if (ajax_response.responseText == "NSD1;#1|$2|ok$1|1") {
		
		if (refresh) {
			document.querySelector("#purge_btn").innerText = "Cache Purged, Refreshing Page";
			location.reload();
		} else {
			document.querySelector("#purge_btn").innerText = "Cache Purge Complete";
		}
	} else if (ajax_response.responseText == "NSD1;#1|$5|error$13|NOT_LOGGED_IN") {
		document.querySelector("#purge_btn").innerText = "Purge Failed. Login To cPanel First";
	} else {
		document.querySelector("#purge_btn").innerText = "Unkown Error Occured. Please Contact Administrator";
	}
}


function make_ajax_request(path,qry_str,success_func,fail_func,is_get,input) {
	if (input == null || !(input instanceof Array)) {
		input = [];
	}
	var ajax_request = new XMLHttpRequest();
	
	ajax_request.onreadystatechange=function() {
		if (ajax_request.readyState == XMLHttpRequest.DONE ) {
			if (ajax_request.response != null) {
				// remove script tags
				ajax_request.processed_response = ajax_request.response.replace(/[\r\n]*<script[\s\S]*?<\/script>[\r\n]*/g,"")
				//remove style tags
				ajax_request.processed_response = ajax_request.processed_response.replace(/[\r\n]*<style[\s\S]*?<\/style>[\r\n]*/g,"");
				//remove image tags
				ajax_request.processed_response = ajax_request.processed_response.replace(/[\r\n]*<img[\s\S]*?>[\r\n]*/g,"");
			}
			input.unshift(ajax_request);
			if (ajax_request.status == 200) {
				if (typeof(success_func) == "function") {
					success_func.apply(this, input);
				}
			}
			else if (ajax_request.status == 400) {
				chrome.runtime.sendMessage({target:"popup",title:"ajax-result",status:"400 Error, Bad Data"}, function() {});
				if (typeof(fail_func) == "function") {
					fail_func.apply(this, input);
				}
			}
			else if (ajax_request.status == 404) {
				chrome.runtime.sendMessage({target:"popup",title:"ajax-result",status:"404 Error, This site does not have a cPanel"}, function() {});
				if (typeof(fail_func) == "function") {
					fail_func.apply(this, input);
				}
			}
			else {
				chrome.runtime.sendMessage({target:"popup",title:"ajax-result",status:ajax_request.status+" Unknown Error"}, function() {});
				if (typeof(fail_func) == "function") {
					fail_func.apply(this, input);
				}
			}
		}
	}

	var	post_get_value = "POST";
	if (is_get==true) {
		post_get_value = "GET";
	}

	ajax_request.open(post_get_value,"https://"+window.location.host+path, true);
	ajax_request.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
	ajax_request.send(qry_str);
}

//on parent products display fields normally hidden from the user
function display_parent_fields() {
	var hidden_fields = document.getElementsByClassName("cp-hide-inparent");
	var num_hidden_fields = hidden_fields.length;
	
	var display_text = "";
	
	for (var hfi = 0; hfi < hidden_fields.length;) {
		hidden_fields[0].className = hidden_fields[0].className.replace("cp-hide-inparent","");
	}
	
	if (num_hidden_fields > 0) {
		display_text = "Displayed "+num_hidden_fields+" hidden parent fields";
	} else {
		display_text = "No hidden parent fields to display, they are already visible or this is not a parent product";
	}
	
	document.querySelector("#display_parent_fields .description").innerText = display_text;
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
		display_text = "Converted "+num_zones_updated+" zones to links";
	} else {
		display_text = "No zone links to convert";
	}
	
	document.querySelector("#add_zone_links .description").innerText = display_text;
}

function prepend_ship_ser_id() {
	var ship_ser_opts = document.querySelectorAll("[name*='lnk_shm'] > option");
	for (var ssoi = 0; ssoi < ship_ser_opts.length; ssoi++) {
		var cur_ser_opt = ship_ser_opts[ssoi];
		var ser_id = cur_ser_opt.value;
		var ser_name = cur_ser_opt.innerText;
		if (!ser_name.startsWith(ser_id) && ser_id != "") {
			cur_ser_opt.innerText = ser_id + " - " + ser_name;
		}
	}
	return "Prepended "+ship_ser_opts.length+" service ID(s)";
}

function add_sh_cat_to_methods(){	
	var ad_sh_cat_elem = document.querySelector("[onclick='addShm()']");
	click_element(ad_sh_cat_elem);
	var num_cat_added=1;
	var latestElement = 0;

	for (var i=0;document.getElementsByName("lnk_shid"+i).length>0;i++) {
		latestElement=i;
	}

	var numCats=document.getElementsByName("lnk_shid"+parseInt(latestElement))[0].length;
	for (var j=1;j<=numCats-1;j++) {
		document.getElementsByName("lnk_shid"+parseInt(latestElement+j-1))[0].selectedIndex=j;
		if (j!=numCats-1) {
			click_element(ad_sh_cat_elem);
			num_cat_added++;
		}
	}
	
	//making the services readable
	prepend_ship_ser_id();
	
	document.querySelector("#add_ship_cat .description").innerText = num_cat_added+" categories added to methods";
}

function click_element(element_to_click) {
	var change_event = document.createEvent("HTMLEvents");
	change_event.initEvent("click", true, true);
	element_to_click.dispatchEvent(change_event);
}

function reload_new_nview(new_theme) {
	var current_url = window.location.href;
	var new_url="";
	if (current_url.includes("?")) {
		if (current_url.includes("nview")) {
			new_url = current_url.replace(/nview=[a-zA-Z-_\d]*/,"nview=" + new_theme);
		} else {
			new_url = current_url + "&nview=" + new_theme;
		}
	} else {
		new_url = current_url + "?nview=" + new_theme;
	}
	setTimeout(function(){window.location.href = new_url;},1000);
	return "Refreshing page with " + new_url;
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
	
	if (orderlines_shipped > 0) {
		display_text = "Marked "+orderlines_shipped+" orderlines for shipping";
	} else {
		display_text = "There are no orderlines to mark for shipping";;
	}
	
	document.querySelector("#ship_orderlines .description").innerText = display_text;
}

function add_all_export_fields() {
	document.querySelector("#add_all_export button").disabled = true;
	document.querySelector("#add_all_export .description").innerText = "Adding Fields Please Wait This May Take A While"
	
	var num_fields_added=0;
	function add_field() {
		document.querySelector("[href='javascript:addFields();']").click();
		num_fields_added++;
		return document.querySelector(".itmlist [class*='row']:last-child [id*='opts_']");
	}

	function select_option(element, index) {
		element.selectedIndex = index;
		element.dispatchEvent(new Event('change'));
	}

	if (document.querySelector("[href='javascript:addFields();']") != null && document.querySelector('[href="javascript:proExport(\'Filter\')"]') != null) {
		var cur_prim = add_field();
		var cur_tag;
		var num_prim_val = cur_prim.length;
		for (var pi = 1; pi < num_prim_val; pi++) {
			select_option(cur_prim,pi);
			cur_tag = document.getElementById(cur_prim.id.replace("opts_","tag_"));
			num_tags = cur_tag.length;
			
			if (cur_prim.value.includes("C")) {
				select_option(cur_tag,cur_tag.querySelector("[value*='_ns']").index);
				
				cur_prim = add_field();
				select_option(cur_prim,pi);
				cur_tag = document.getElementById(cur_prim.id.replace("opts_","tag_"));
				
			} else {
				for (ti=1; ti < num_tags; ti++) {
					select_option(cur_tag,ti);			
					cur_prim = add_field();
					select_option(cur_prim,pi);
					cur_tag = document.getElementById(cur_prim.id.replace("opts_","tag_"));
				}
			}
		}
		document.querySelector("#add_all_export .description").innerText = "Added "+num_fields_added+" export fields to export wizard";
		document.querySelector("#add_all_export button").disabled = false;
	} else {
		document.querySelector("#add_all_export .description").innerText = "Error: Page not viable for adding export fields";
	}
	
}

function get_import_find_replace() {
	var repText = '"Find","Replace","Exact Match","Reg Exp","Replace All","Case Sensitive","Multi Line","Column","Priority"\n';
	var findElements = document.querySelectorAll("[name*='rep_find']");

	for (var fei = 0; fei < findElements.length; fei++) {
		//add find
		repText = addCSVCellFromElement(repText, "[name='rep_find"+fei+"']");
		
		//add replace
		repText = addCSVCellFromElement(repText, "[name='rep_rep"+fei+"']");
		
		//add exact match
		repText = addCSVCellFromElement(repText, "[name='rep_exm"+fei+"']");
			
		//add regular exp
		repText = addCSVCellFromElement(repText, "[name='rep_reg"+fei+"']");
			
		//add replace all
		repText = addCSVCellFromElement(repText, "[name='rep_all"+fei+"']");
			
		//add case sensitive
		repText = addCSVCellFromElement(repText, "[name='rep_cas"+fei+"']");
			
		//add multi line
		repText = addCSVCellFromElement(repText, "[name='rep_mul"+fei+"']");
			
		//add column
		repText = addCSVCellFromElement(repText, "[name='rep_col"+fei+"']");

		//add priority
		repText = addCSVCellFromElement(repText, "[name='rep_pri"+fei+"']");

		repText = addCSVRow(repText);
	}

	create_download_file("find_and_replace.csv", repText);

	function addCSVCellFromElement(csvText, selector) {
		var elem = document.querySelector(selector);
		var delimeter = "";
		if (csvText.slice(-1) == '"') {
			delimeter = ",";
		}
		
		if (elem != undefined) {
			return csvText+delimeter+'"'+elem.value.replace(/"/g,'""')+'"';
		} else {
			return csvText+delimeter+',""';
		}
	}

	function addCSVRow(csvText) {
		return csvText+'\n';
	}
}

function create_download_file(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function add_goto_search_element() {
	var search_bar = document.createElement("input");
	search_bar.id = "search";
	search_bar.placeholder= "Enter keyword to search for a page 🔥";
	search_bar.style.width="100%";
	search_bar.style.boxSizing="border-box";
	search_bar.style.borderRadius="2px";
	search_bar.style.border="1px solid #EFEFEF";
	search_bar.style.fontSize="22px";
	search_bar.style.lineHeight="3em";
	search_bar.style.height="74px";
	search_bar.style.padding="70px";
	
	search_bar.addEventListener("keyup",goto_search);
	
	document.body.insertBefore(search_bar, document.body.children[0]);
}

function goto_search() {
	var search_term=this.value;

	var site_rows = document.querySelectorAll("tbody tr");
	// loop over sites
	for (sri = 0; sri < site_rows.length; sri++) {
		var is_match=false;
		var cur_site = site_rows[sri];

		if (search_term != "") {
			var site_children = cur_site.children;
			//loop over site elements searching for value
			for (ci = 0; ci < site_children.length; ci++) {
				var child_elem = site_children[ci];
				if (child_elem.textContent.toLowerCase().includes(search_term.toLowerCase())) {
					is_match = true;
				}
			}
		} else {
			is_match=true;
		}
		if (is_match) {
			cur_site.style.display="table-row";
		} else {
			cur_site.style.display="none";
		}
	}
}

function add_ebay_proc_search_element() {
	// search bar to type keyword in
	var search_bar = document.createElement("input");
	search_bar.id = "cf-search";
	search_bar.placeholder= "Enter keyword to search hidden process content 🔥";
	search_bar.style.boxSizing="border-box";
	search_bar.style.borderRadius="2px";
	search_bar.style.border="1px solid #EFEFEF";
	search_bar.style.width="300px";
	document.querySelector(".page-title").appendChild(search_bar);
	
	var num_pages = 1;
	var pagination = document.querySelectorAll("[href^='javascript:$.cpGoToPage(']")[document.querySelectorAll("[href^='javascript:$.cpGoToPage(']").length-2];
	if (pagination != null) {
		num_pages = parseInt(pagination.textContent);
	}
	
	//label for num pages
	var num_label = document.createElement("label");
	num_label.textContent = "Num Pages:";
	num_label.style.display="inline";
	
	// number of pages to search
	var num_search  = document.createElement("select");
	num_search.id = "cf-search-num-pages";
	num_search.style.width="50px";
	for (var ni=1; ni <=  num_pages; ni++) {
		var num_elem = document.createElement("option");
		num_elem.textContent = ni;
		num_elem.value=ni;
		num_search.appendChild(num_elem);
	}
	
	num_label.appendChild(num_search);
	document.querySelector(".page-title").appendChild(num_label);
	
	//submit search button
	var search_go = document.createElement("button");
	search_go.id = "cf-search-btn";
	search_go.setAttribute("data-state","ready");
	search_go.textContent = "Run Keyword Search";
	search_go.addEventListener("click",ebay_proc_search);
	document.querySelector(".page-title").appendChild(search_go);

}

function ebay_proc_search() {
	var search_btn = document.getElementById("cf-search-btn")
	var search_elem = document.getElementById("cf-search");
	var num_pages_elem = document.getElementById("cf-search-num-pages");

	if (search_btn.getAttribute('data-state') == "ready") {
		search_btn.setAttribute("data-state","running");
		search_btn.setAttribute("data-cur-page","1");
		search_btn.textContent = "Stop Search";
		search_elem.setAttribute('disabled',true);
		num_pages_elem.setAttribute('disabled',true);
		

		
		
		var proc_filt = generate_filter_qs();
		proc_filt.add_key("_sb_pgnum","1");
		proc_filt.add_key("proc","");
		proc_filt.add_key("tkn","ebproclog");
		proc_filt.add_key("fn","");
		proc_filt.add_key("ajax","y");
		
		//loop through pager counter ajaxing the results and opening tabs that match
		make_ajax_request("/_cpanel",proc_filt.toString(),process_ebay_proc_search);
		
	} else if (search_btn.getAttribute('data-state') == "running") {
		search_btn.setAttribute("data-state","ready");
		search_btn.setAttribute("data-cur-page","1");
		search_btn.textContent = "Run Keyword Search";
		
		search_elem.removeAttribute('disabled');
		
		num_pages_elem.removeAttribute('disabled');
	}
}

function process_ebay_proc_search(request) {

	var search_btn = document.getElementById("cf-search-btn")
	var search_elem = document.getElementById("cf-search");
	var num_pages_elem = document.getElementById("cf-search-num-pages");
	
	var search_term = search_elem.value;
	var cur_page = parseInt(search_btn.getAttribute("data-cur-page"));
	var table_text = unescape(request.responseText.replace(/NSD1;#4\|\$[0-9]*\|[a-zA-Z]*\$[0-9]*\|/,"").replace(/\$[0-9]*\|.*/,""));
	
	if (search_btn.getAttribute("data-state")=="running") {
		var table_cont = document.createElement("div");
		table_cont.innerHTML = table_text;
		
		var mags_found = [];
		var pot_rows=table_cont.querySelectorAll(".row0");
		for (var pri = 0; pri < pot_rows.length; pri++) {
			var row = pot_rows[pri];
			if (row.textContent.indexOf(search_term)>0) {
				mags_found.push(row.querySelector("[data-toggle='collapse']").getAttribute("href").replace("#collapse",""));
			}
			
		}
		if (mags_found.length > 0) {
			var new_page_qry = generate_filter_qs();
			new_page_qry.add_key("_sb_pgnum",cur_page);
			new_page_qry.add_key("cf_mags",mags_found.toString());
			chrome.runtime.sendMessage({target:"background",title:"open-tab",url:'https://'+window.location.hostname+'/_cpanel/ebproclog?'+new_page_qry.toString()}, function() {});
		}
		
		if (cur_page < num_pages_elem.value) {
			cur_page++;
			search_btn.setAttribute("data-cur-page", cur_page)
			var proc_filt = generate_filter_qs();
			proc_filt.add_key("proc","");
			proc_filt.add_key("tkn","ebproclog");
			proc_filt.add_key("fn","");
			proc_filt.add_key("ajax","y");
			proc_filt.add_key("_sb_pgnum",cur_page);
			
			//loop through pager counter ajaxing the results and opening tabs that match
			make_ajax_request("/_cpanel",proc_filt.toString(),process_ebay_proc_search);
		} else {
			search_btn.setAttribute("data-state","ready");
			search_btn.setAttribute("data-cur-page","1");
			search_btn.textContent = "Run Keyword Search";
			search_elem.removeAttribute('disabled');
			num_pages_elem.removeAttribute('disabled');
		}
	}
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

function generate_filter_qs() {
	var filter_qs = new queryString;
	
	var filter_elements = document.querySelectorAll("[name*='_ftr_'],[name*='_sb_']");	
	for (var fil_i = 0; fil_i < filter_elements.length; fil_i++) {
		filter_qs.add_key(filter_elements[fil_i].name, filter_elements[fil_i].value);
	}
	
	return filter_qs;
}

function check_eBay_process(ajax_response, reset = false) {

	var total_running_ebay_proc_ids = [];
	var stuck_ebay_proc_ids = [];
	
	var eBay_running_process_list = document.createElement("div");
	eBay_running_process_list.innerHTML = ajax_response.processed_response;
	
	var running_check_boxes = eBay_running_process_list.querySelectorAll("[name^='itm']");
	for (var itm_i = 0; itm_i < running_check_boxes.length; itm_i++) {
		var cur_itm = running_check_boxes[itm_i];
		if (cur_itm.name != "itm_total") {
			var cur_proc_id = cur_itm.value;
			var proc_start_time_text = cur_itm.parentElement.parentElement.children[9].innerText;
			var proc_start_date = new Date(proc_start_time_text.replace(/[()]/g,""))
			var now_date = new Date();
			// if running for more than hour mark as stalled
			if (now_date - proc_start_date > 1000*60*60) {
				stuck_ebay_proc_ids.push(cur_proc_id);
			}
			total_running_ebay_proc_ids.push(cur_proc_id);
		}
	}
	if (stuck_ebay_proc_ids.length > 0) {
		create_stuck_ebay_popup();
	}
	
	if (reset){

		if (document.querySelector("#reset_ebay_batch_btn") != null) {
			document.querySelector("#reset_ebay_batch_btn").disabled="true";
		}


		if (total_running_ebay_proc_ids.length > 0) {
			if (document.querySelector("#stuck_ebay_output") != null) {
				document.querySelector("#stuck_ebay_output").innerText = "Stopping eBay processes: "+total_running_ebay_proc_ids;
			}
			
			// stop eBay processes
				var procs_stopped=0;
				for (var proc_i = 0; proc_i < total_running_ebay_proc_ids.length; proc_i++) {
					var cur_proc_id = total_running_ebay_proc_ids[proc_i];
					make_ajax_request("/_cpanel/ebprocmgr","proc=stop&itm0="+cur_proc_id+"&itm_total=1",function() {
						
						procs_stopped++;
						if (procs_stopped >= total_running_ebay_proc_ids.length) {
							if (document.querySelector("#stuck_ebay_output") != null) {
								document.querySelector("#stuck_ebay_output").innerText = "Searching for running eBay batch process";
							}
							
							// find running ebay_batch process to stop it
							make_ajax_request("/_cpanel/procmgr?_ftr_module=ebay_batch&_ftr_status=Running&_sb_limit=1","",reset_ebay_batch,null,true);
						}
					});
				}
		} else {
			if (document.querySelector("#stuck_ebay_output") != null) {
				document.querySelector("#stuck_ebay_output").innerText = "No running eBay Processes. Checking ebay_batch";
			}
			
			// find running ebay_batch process to stop it
			make_ajax_request("/_cpanel/procmgr?_ftr_module=ebay_batch&_ftr_status=Running&_sb_limit=1","",reset_ebay_batch,null,true);
		}

	}
}

function reset_ebay_batch(ajax_response) {
	var ebay_batch_list = document.createElement("div");
	ebay_batch_list.innerHTML = ajax_response.processed_response;
	
	var running_check_boxes = ebay_batch_list.querySelectorAll("[name^='itm']");
	
	var found_running_ebay_batch = false;
	
	for (var itm_i = 0; itm_i < running_check_boxes.length; itm_i++) {
		var cur_itm = running_check_boxes[itm_i];
			if (cur_itm.name != "itm_total") {
			var cur_proc_id = cur_itm.value;
			found_running_ebay_batch = true;
			if (document.querySelector("#stuck_ebay_output") != null) {
				document.querySelector("#stuck_ebay_output").innerText = "Stopping ebay_batch processes: "+cur_proc_id;
			}
			make_ajax_request("/_cpanel/ebprocmgr?proc=stop&itm0="+cur_proc_id+"&itm_total=1","",start_new_ebay_batch,null,true);
			break;
		}
	}
	if (!found_running_ebay_batch) {
		if (document.querySelector("#stuck_ebay_output") != null) {
			document.querySelector("#stuck_ebay_output").innerText = "No running ebay_batch. Starting new ebay_batch: "+cur_proc_id;
		}
		make_ajax_request("/_cpanel/ebprocmgr?proc=stop&itm0="+cur_proc_id+"&itm_total=1","",start_new_ebay_batch,null,true);		
	}
	
}

function start_new_ebay_batch() {
	if (document.querySelector("#stuck_ebay_output") != null) {
		document.querySelector("#stuck_ebay_output").innerText = "Looking for pending ebay_batch process";
	}
	make_ajax_request("/_cpanel/procmgr?_ftr_module=ebay_batch&_ftr_status=Pending&_sb_limit=1","",function(ajax_response) {
		var ebay_batch_list = document.createElement("div");
		ebay_batch_list.innerHTML = ajax_response.processed_response;
		
		var found_pending = false;
		
		var pending_check_boxes = ebay_batch_list.querySelectorAll("[name^='itm']");
		for (var itm_i = 0; itm_i < pending_check_boxes.length; itm_i++) {
			var cur_itm = pending_check_boxes[itm_i];
				if (cur_itm.name != "itm_total") {
				found_pending=true;
				var cur_proc_id = cur_itm.value;
				if (document.querySelector("#stuck_ebay_output") != null) {
					document.querySelector("#stuck_ebay_output").innerText = "Starting ebay_batch processes: "+cur_proc_id;
				}
				make_ajax_request("/_cpanel/procmgr?proc=run&id="+cur_proc_id+"&_ftr_pid="+cur_proc_id,"",function(ajax_response) {
					if (document.querySelector("#stuck_ebay_output") != null) {
						document.querySelector("#stuck_ebay_output").innerText = "eBay process reset complete";
					}
				},null,true);
				break;
			}
		}
		
		if (!found_pending) {
			if (document.querySelector("#stuck_ebay_output") != null) {
				document.querySelector("#stuck_ebay_output").innerText = "No pending ebay_batch. Adding new process to queue";
			}
			make_ajax_request("/_cpanel/batchproc?proc=ebay","",start_new_ebay_batch,null,true);
		}
		
	},null,true);

}

function initialise() {

		// Page Load Automations
	chrome.storage.sync.get(null, function(stored_options) {
		// automatically update filter page url
		auto_filter_setup();

		// order
		repair_url("/cgi-bin/suppliers/index.cgi", {"item":"order","page":"vieworder"}, ["id","warehouse"]);
		// advanced config
		repair_url("/cgi-bin/suppliers/index.cgi", {"item":"config","page":"view"}, ["id","mod"]);

		// coupon
		repair_url("/cgi-bin/suppliers/index.cgi", {"item":"discounts","page":"view"}, ["id"]);

		// refund
		repair_url("/_cpanel/refund", {}, ["id"]);

		// shipping rates
		repair_url("/_cpanel/shippingcostmgr", {}, ["id"]);
		repair_url("/_cpanel/shippingcostmgr/view", {}, ["id"]);

		// shipping methods
		repair_url("/_cpanel/shippinggroup", {}, ["id"]);
		repair_url("/_cpanel/shippinggroup/view", {}, ["id"]);

		// payment terms
		repair_url("_cpanel/custerms", {}, ["id"]);

		// payment plan
		repair_url("/_cpanel/orderplan", {}, ["id"]);
		repair_url("/_cpanel/orderplan/view", {}, ["id"]);

		// predefined package
		repair_url("/_cpanel/package", {}, ["id"]);
		repair_url("/_cpanel/package/view", {}, ["id"]);

		// shipping groups
		repair_url("/_cpanel/shippingid", {}, ["id"]);
		repair_url("/_cpanel/shippingid/view", {}, ["id"]);

		// shipping zones
		repair_url("/_cpanel/zone", {}, ["id"]);
		repair_url("/_cpanel/zone/view", {}, ["id"]);1
		
		// product groups
		repair_url("/_cpanel/itemgroups", {}, ["id"]);
		repair_url("/_cpanel/itemgroups/view", {}, ["id"]);
		
		// dispute reasons
		repair_url("/_cpanel/dispute_reasons", {}, ["id"]);
		repair_url("/_cpanel/dispute_reasons/view", {}, ["id"]);
		
		// SEO Entry
		repair_url("/cgi-bin/suppliers/index.cgi", {"item":"seo","page":"view"}, ["id"]);
		
		// canned response
		repair_url("/_cpanel/cannedresponses", {}, ["id"]);
		repair_url("/_cpanel/cannedresponses/view", {}, ["id"]);
		
		// custom doc
		repair_url("/_cpanel/custom_docs", {}, ["id"]);
		repair_url("/_cpanel/custom_docs/view", {}, ["id"]);
			
		// Custom document template sets
		repair_url("/cgi-bin/suppliers/index.cgi", {"item":"doctmpl","page":"view"}, ["id"]);
		
		// import/export templates
		repair_url("/cgi-bin/suppliers/index.cgi", {"item":"dsimport","page":"view"}, ["id"]);
		repair_url("/cgi-bin/suppliers/index.cgi", {"item":"dsexport","page":"view"}, ["id"]);
		
		// custom configs
		repair_url("/_cpanel/custom_configs", {}, ["id"]);
		repair_url("/_cpanel/custom_configs/view", {}, ["id"]);
		
		prepend_method_ids_to_calc_ship(stored_options["prepend-view-order-method-ids"]);
		prepend_ids_in_ship_matrix(stored_options["prepend-ids-in-ship-matrix"])
		prepend_ids_in_label_config(stored_options["prepend-ids-in-label-config"])
		append_id_to_cust_customer_fields(stored_options["append-id-to-cust-customer-fields"]);
		prepend_ship_ser_id();
		
		if (document.querySelector("[onclick='addShm()']") != null) {
			document.querySelector("[onclick='addShm()']").addEventListener("click",function(){prepend_ship_ser_id()});
		}
		
		// query string based automations
		var current_qs = new queryString(window.location.search);

		//auto-open magnifying glasses
		var mags = current_qs.get_key('cf_mags');
		if (mags != undefined && mags!="") {
			var mags_array = mags.split(",");
			for (mai = 0; mai < mags_array.length; mai++) {
				var mag_num = mags_array[mai];
				click_element(document.querySelector("[href='#collapse"+mag_num+"']"));
			}
		}
		

		
	});

	if (window.location.pathname=="/_cpanel/ebproclog") {
		add_ebay_proc_search_element();
	}

	// load the dialog box depending on auto close settings and possibly per domain settings
	chrome.storage.sync.get(["close-tracking","helper-closed","blacklist-domains"], function(stored_options) {
		var set_to_create = false;
		if (!(stored_options["blacklist-domains"].includes(window.location.hostname))) {
			switch(stored_options["close-tracking"]) {
				case "globally":
					if (!stored_options["helper-closed"]) {
						createSidePanel();
					}
					break;
				case "per-site":
					if (window.localStorage.getItem("helper-closed")!="true") {
						createSidePanel();
					}
					break;
				case "none":
					createSidePanel();
					break;
			} 
		}
	});
}

function createSidePanel() {
	if (document.querySelector("#cPanel_checker_dialogue")==null) {
		create_dialog_window();
		create_purge_panel();

		// TODO double check the check system and create ebay stuck proces poopup when needed
		//create_stuck_ebay_popup();
		create_context_panel();
		create_info_panel();

		// check eBay backlog
		if (window.location.pathname.includes("_cpanel")) {
		//	make_ajax_request("/_cpanel/ebprocmgr?_ftr_status=Running","",check_eBay_process,null,true);

		}

		// generate page info
		start_page_analysis();
	}
	// track global closed
	chrome.storage.sync.set({"helper-closed":false}, function() {});
	// track per site closed
	window.localStorage.setItem("helper-closed", false);
}

// don't initialise anything if not a Neto site. If we don't know if Neto site find out
var cur_page_is_neto = localStorage.getItem('is_neto');

if (cur_page_is_neto == null) {
	function setIsNeto(response) {
		cur_page_is_neto = true;
		localStorage.setItem('is_neto', cur_page_is_neto);
		initialise();
	}
	function setIsNotNeto(response) {
		cur_page_is_neto = false;
		localStorage.setItem('is_neto', cur_page_is_neto);
	}
	
	make_ajax_request("/_cpanel","ajax=y", setIsNeto, setIsNotNeto);
} else if (cur_page_is_neto.toLowerCase() == "true") {
	initialise();
}


//Not neto site related hence does not occur within initialise
if (window.location.hostname=="goto.production.neto.net.au" || window.location.hostname=="goto.neto.com.au") {
	add_goto_search_element();
}

