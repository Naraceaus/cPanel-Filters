function neto_page(finished_func, info_target) {
	this.tasks_complete = function() {
		task_keys = Object.keys(this.tasks);
		var finished = true;
		for (ki = 0; ki < task_keys.length; ki++) {
			if (!this.tasks[task_keys[ki]]) {
				finished = false;
			}
		}		
		return finished;
	}
	
	this.update_popup_info = function(name, value, show_load, hide) {
		if (this.info_target!=null) {
			chrome.runtime.sendMessage({target:"popup",title:"page-info-item",name:name,value:value,show_load:show_load,hide:hide},function() {});
		}
		
	}
	
	this.update_info_entry = function(id, value) {
		if (id!="" && id!=null) {
			this[id] = value;
			this.tasks[id] = true;
		}
		if (this.tasks_complete()) {
			update_popup_info("page-info-load-icon",true,false,false);
			this.finished_func(this);
		}
		this.update_popup_info(id, value, false, false);
	}
	
	this.process_webstore_response = function(response){
		var webstore_page = response.responseText;
		var res_cont = document.createElement("div");
		res_cont.innerHTML = webstore_page;
		theme_ident_el = res_cont.querySelector("[value='TEMPLATELANG']");
		console.log(theme_ident_el);
		if (theme_ident_el!=null) {
			var theme_sel_name = theme_ident_el.name.replace("cfg","cfgval");
			update_info_entry("default-theme",res_cont.querySelector("[name='"+theme_sel_name+"']").value);
		} else {
			update_info_entry("default-theme","n.a.");
		}
	}
	
	
	//checking if logged in and is a neto site
	this.success_ajax = function(ajax_response) {
		update_info_entry("is-neto", true)
		if (ajax_response.responseText == "NSD1;#2|$7|content$0|$3|msg$0|") {
			update_info_entry("logged-in", true);
			make_ajax_request("/_cpanel/setup_wizard/webshopconfig","",this.process_webstore_response,null,true);
		} else if (ajax_response.responseText == "NSD1;#1|$5|error$13|NOT_LOGGED_IN") {
			update_info_entry("logged-in", false)
			update_info_entry("default-theme","n.a.");
		} else {
			//todo errors for bool
			//this.logged_in = "Addon is confused, contact developer with the website you are viewing"
		}
		this.get_page_info();
	}
	
	this.fail_ajax = function(ajax_response) {
		update_info_entry("is-neto",false);
		update_info_entry("logged-in",false);
		update_info_entry("default-theme","n.a.");
		this.get_page_info();
	}
	
	this.check_for_cpanel = function() {
		make_ajax_request("/_cpanel","ajax=y",this.success_ajax,this.fail_ajax);
	}
	
	//checking page type
	this.get_page_info = function() {
		if (this["is-neto"]) {
			if (window.location.pathname.match("_cpanel") || window.location.pathname.match("cgi-bin/suppliers/index.cgi")) {
				update_info_entry("page-type","cPanel");
				update_info_entry("cpanel-link",window.location.href);
			} else {
				update_info_entry("page-type","Webstore");
				
				//check body element for page type
				var page_body = document.querySelector("body[id*='n_']");
				if (page_body != null) {
					update_info_entry("page-subtype",page_body.id.replace("n_",""));
					update_info_entry("active-theme",page_body.className.replace("n_",""));
					if (this["logged-in"]) {
						switch (this.sub_type) {
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
						update_info_entry("cpanel-link",find_url_in_cpanel());
					}
					
					
				} else {
					update_info_entry("page-type","n.a.");
					update_info_entry("page-subtype","n.a.");
					update_info_entry("active-theme",("n.a."));
				}
			}
		} else {
			update_info_entry("active-theme","n.a.");
			update_info_entry("page-type","n.a.");
			update_info_entry("page-subtype","n.a.");
			update_info_entry("cpanel-link","n.a.");
		}
	}
	
	this.logged_in_customer_email = function(request) {
		var page_returned = unescape(request.responseText);
		
		var page_cont = document.createElement("div");
		page_cont.innerHTML = page_returned;
		
		var email = page_cont.querySelector("[name='email']").value;
		update_info_entry("cpanel-link", window.location.origin+"/_cpanel/customer?_ftr_email="+email);
	}

	this.find_direct_url_in_cpanel = function(request) {
		var table_text = unescape(request.responseText.replace(/NSD1;#4\|\$[0-9]*\|[a-zA-Z]*\$[0-9]*\|/,"").replace(/\$[0-9]*\|.*/,""));

		var table_cont = document.createElement("div");
		table_cont.innerHTML = table_text;
		var link_el = table_cont.querySelector("[href*='_cpanel']");
		if (link_el!=null) {
			update_info_entry("cpanel-link", table_cont.querySelector("[href*='_cpanel']").href);
		} else {
			update_info_entry("cpanel-link","");
		}
	}
	
	function bool_to_fa_check(value) {
		if (typeof(value)=="boolean") {
			if (value) {
				return "<span class='fa fa-fw fa-check'></span>";
			} else {
				return "<span class='fa fa-fw fa-times'></span>";
			}
		}
		return value;
	}
	
	this.initialise = function() {
		this.finished_func = finished_func;
		this.info_target=info_target;

		this.tasks = {
			"act-page-url":false,
			"cpanel-link":false,
			"default-theme":false,
			"active-theme":false,
			"page-type":false,
			"page-subtype":false,
			"is-neto":false,
			"logged-in":false
		};
		
		this.update_info_entry("act-page-url",window.location.href,false,false);
		this["cpanel-link"]="",
		this["page-type"]="",
		this["page-subtype"]="",
		this["is-neto"]=false,
		this["logged-in"]=false

		
		this.check_for_cpanel();
	}
	
	this.initialise();
}