
function start_page_analysis() {
	set_pi_value("page-url", window.location.href);
	// check if cPanel exists
	make_ajax_request("/_cpanel","ajax=y", check_login, noCPanel);
}

function check_login(ajax_response) {
	
	if (ajax_response.responseText == "NSD1;#2|$7|content$0|$3|msg$0|") {
		set_pi_value("logged-in", "Yes");
		// checking the webstore settings page
		make_ajax_request("/_cpanel/setup_wizard/webshopconfig","",process_webstore_response,null,true);
		// checking local page content to determine type of webpage
		get_page_info(true, true);
		autoOpenCPanel();
		
	} else if (ajax_response.responseText == "NSD1;#1|$5|error$13|NOT_LOGGED_IN") {
		set_pi_value("logged-in", "No");
		set_pi_value("default-theme", "n.a.");
		set_pi_value("active-theme", "n.a.");
		get_page_info(true, false);
		autoOpenCPanel();
	} else {
		noCPanel(ajax_response);
	}

}

function noCPanel(ajax_response) {
	set_pi_value("logged-in", "n.a.");
	set_pi_value("page-type", "n.a.");
	set_pi_value("page-subtype", "n.a.");
	set_pi_value("default-theme", "n.a.");
	set_pi_value("active-theme", "n.a.");
	set_pi_value("cpanel-link", "n.a.");
}

function autoOpenCPanel() {
	chrome.storage.sync.get(["enable-cPanel-auto-open","cPanel-auto-open-delay"], function(stored_options) {
		//automatically load control panel if one not already open
		if (stored_options["enable-cPanel-auto-open"]) {
			if (Date.now()-window.localStorage.getItem("last_cpanel_opened") > stored_options["cPanel-auto-open-delay"] && !/_cpanel/.test(window.location.pathname)) {
				chrome.runtime.sendMessage({target:"background",title:"auto-open-cpanel",domain:window.location.hostname}, function() {});
				window.localStorage.setItem("last_cpanel_opened", Date.now());
			}
		}
	});
}

function process_webstore_response(response) {
	var cur_active_theme = get_pi_value("active-theme");

	var webstore_page = response.responseText;
	var res_cont = document.createElement("div");
	res_cont.innerHTML = webstore_page;
	theme_ident_el = res_cont.querySelector("[value='TEMPLATELANG']");
	if (theme_ident_el!=null) {
		var theme_sel_name = theme_ident_el.name.replace("cfg","cfgval");
		var theme_sel = res_cont.querySelector("[name='"+theme_sel_name+"']");
		
		set_pi_value("default-theme", theme_sel.value);
		
		if (get_pi_value("page-type") == "cPanel") {
			set_pi_value("active-theme", "n.a.");
		} else {
			//generate list of themes in system for active page dropdown
			var avail_themes = [];
			var theme_opt = theme_sel.children;
			for (var toi = 0; toi < theme_opt.length; toi++) {
				avail_themes.push(theme_opt[toi].value);
			}
			var theme_select = create_select(avail_themes, avail_themes, cur_active_theme,
				{
					id:"active-theme-selector"
				},
				{
					width:"95%"
				}
			)
			theme_select.addEventListener("change", function() {
				reload_new_nview(this.value);
			})
			document.querySelector("#active-theme").innerText = "";
			document.querySelector("#active-theme").appendChild(theme_select);
			theme_select.parentElement.className += " tooltip";
			theme_select.parentElement.dataset.tip = "Change this value to automatically refresh the page with the selected theme displayed";
		}
	} else {
		set_pi_value("#default-theme", "n.a.");
		set_pi_value("#active-theme", "n.a.");
	}
}

//checking page type
function get_page_info(is_neto, logged_in) {
	if (is_neto) {
		if (window.location.pathname.match("_cpanel") || window.location.pathname.match("cgi-bin/suppliers/index.cgi")) {
			set_pi_value("page-type","cPanel");
			set_pi_value("page-subtype","n.a.");
			set_pi_url("cpanel-link",window.location.href);
		} else {
			set_pi_value("page-type","Webstore");
			set_pi_url("cpanel-link", find_url_in_cpanel(), "If you login to the control panel you'll get a better link");
			//check body element for page type
			var page_body = document.querySelector("body[id*='n_'],body[class*='n_']");
			if (page_body != null) {
				set_pi_value("page-subtype",page_body.id.replace("n_",""));
				set_pi_value("active-theme",page_body.className.replace("n_",""));
				if (logged_in) {
					switch (get_pi_value("page-subtype")) {
						case "customer_account":
							make_ajax_request("/_myacct/edit_account","",logged_in_customer_email);
							break;
						case "category":
						case "product":
						default:
							//slice is to remove first "/"
							make_ajax_request("/_cpanel","tkn=url&_ftr_request_url=^"+window.location.pathname.slice(1)+"&ajax=y",this.find_direct_url_in_cpanel);
							break;
					}
				} else {
					set_pi_url("cpanel-link",find_url_in_cpanel(), "If you login to the control panel you'll get a better link");
				}
				
				
			} else {
				set_pi_value("page-type","n.a.");
				set_pi_value("page-subtype","n.a.");
				set_pi_value("active-theme",("n.a."));
			}
		}
	} else {
		set_pi_value("active-theme","n.a.");
		set_pi_value("page-type","n.a.");
		set_pi_value("page-subtype","n.a.");
		set_pi_value("cpanel-link","n.a.");
	}
}

function logged_in_customer_email(request) {
	var page_returned = unescape(request.responseText);
	
	var page_cont = document.createElement("div");
	page_cont.innerHTML = page_returned;
	
	var email = page_cont.querySelector("[name='email']").value;
	set_pi_url("cpanel-link", window.location.origin+"/_cpanel/customer?_ftr_email="+email, "Don't forget to use the ctrl or cmd key to open in a new tab");
}

find_direct_url_in_cpanel = function(request) {
	var table_text = unescape(request.responseText.replace(/NSD1;#4\|\$[0-9]*\|[a-zA-Z]*\$[0-9]*\|/,"").replace(/\$[0-9]*\|.*/,""));

	var table_cont = document.createElement("div");
	table_cont.innerHTML = table_text;
	var link_el = table_cont.querySelector("[href*='_cpanel']");
	var direct_URL = "";
	if (link_el!=null) {
		direct_URL = table_cont.querySelector("[href*='_cpanel']").href;
	} else {
		direct_URL = "";
	}
	set_pi_url("cpanel-link", direct_URL, "Don't forget to use the ctrl or cmd key to open in a new tab")
}

function set_pi_value(id, value) {
	var pi_input = document.querySelector("#"+id+"-value");
	if (pi_input == null) {
		document.querySelector("#"+id).innerText = "";
		pi_input = create_element("input",
			{
				id:id+"-value",
				value:"...",
				type:"text",
				disabled:true
			},
			{
				width:"95%"
			});
		document.querySelector("#"+id).appendChild(pi_input);
	}
	if (pi_input!=null) {
		pi_input.value = value;
	}
	checkPageAnalysisFinished();
}

function set_pi_url(id, url, tooltip) {
	document.querySelector("#"+id).innerText = "";
	var pi_link = create_element("a",
		{
			href:url,
			innerText:url
		});
	
	if (tooltip != null) {
		pi_link.className = "tooltip";
		pi_link.dataset.tip = tooltip;
	}
	
	document.querySelector("#"+id).appendChild(pi_link);
}

function get_pi_value(id) {
	var pi_input = document.querySelector("#"+id+"-value");
	if (pi_input!=null) {
		return pi_input.value
	}
	return null;
}

function checkPageAnalysisFinished() {
	var all_info_elems = document.querySelectorAll("#page-info-cont input, #page-info-cont select");
	var finished = true;
	for (iei = 0; iei < all_info_elems.length; iei++) {
		var info_elem = all_info_elems[iei];
		if (get_pi_value(info_elem.id.replace("-value","")) == "...") {
			finished = false;
		}
	}
	if (finished) {
		document.getElementById("page-info-load-text").innerText = "Analysis Complete";
	}
}

function reload_new_nview(new_theme) {
	var current_url = window.location.href;
	var new_url="";
	if (current_url.includes("?")) {
		if (current_url.includes("nview")) {
			new_url = current_url.replace(/nview=[a-zA-Z-_]*/,"nview=" + new_theme);
		} else {
			new_url = current_url + "&nview=" + new_theme;
		}
	} else {
		new_url = current_url + "?nview=" + new_theme;
	}
	setTimeout(function(){window.location.href = new_url;},1000);
	return "Refreshing page with " + new_url;
}