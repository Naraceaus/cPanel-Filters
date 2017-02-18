function neto_page(finished_func) {
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
	
	this.check_finished_then_func = function(just_finished) {
		if (just_finished != "" && just_finished != null ) {
			this.tasks[just_finished] = true;
		}
		if (this.tasks_complete()) {
			this.finished_func(this.gen_sum_span());
		}
	}
	
	
	//checking if logged in and is a neto site
	this.success_ajax = function(ajax_response) {
		this.is_neto = true;
		if (ajax_response.responseText == "NSD1;#2|$7|content$0|$3|msg$0|") {
			this.logged_in = true
		} else if (ajax_response.responseText == "NSD1;#1|$5|error$13|NOT_LOGGED_IN") {
			this.logged_in = false;
		} else {
			this.logged_in = "Addon is confused, contact developer with the website you are viewing"
		}
		this.check_finished_then_func("check_ajax");
		this.get_page_info();
	}
	
	this.fail_ajax = function(ajax_response) {
		this.is_neto = false;
		this.logged_in = "n.a.";
		this.check_finished_then_func("check_ajax");
		this.get_page_info();
	}
	
	this.check_for_cpanel = function() {
		make_ajax_request("/_cpanel","ajax=y",this.success_ajax,this.fail_ajax);
	}
	
	//checking page type
	this.get_page_info = function() {
		if (this.is_neto) {
			if (window.location.pathname.match("_cpanel") || window.location.pathname.match("cgi-bin/suppliers/index.cgi")) {
				this.type = "cPanel";
				this.check_finished_then_func("get_type");
				this.check_finished_then_func("gen_cpanel_url");
			} else {
				this.type = "Webstore";
				
				//check body element for page type
				var page_body = document.querySelector("body[class*='n_']");
				if (page_body != null) {
					this.sub_type = page_body.id.replace("n_","");
					this.check_finished_then_func("get_type");
					if (this.logged_in) {
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
						this.cPanel_link = find_url_in_cpanel();
						this.check_finished_then_func("gen_cpanel_url");
					}
					
					
				} else {
					this.type = "n.a.";
					this.sub_type = "n.a.";
					this.check_finished_then_func("get_type");
					this.check_finished_then_func("gen_cpanel_url");
				}
				
				
			}
		} else {
			this.sub_type = "n.a.";
			this.check_finished_then_func("get_type");
			this.check_finished_then_func("gen_cpanel_url");
		}
		
	}
	
	this.logged_in_customer_email = function(request) {
		var page_returned = unescape(request.responseText);
		
		var page_cont = document.createElement("div");
		page_cont.innerHTML = page_returned;
		
		var email = page_cont.querySelector("[name='email']").value;
		this.cPanel_link = window.location.origin+"/_cpanel/customer?_ftr_email="+email;
		this.check_finished_then_func("gen_cpanel_url");
	}

	this.find_direct_url_in_cpanel = function(request) {
		var table_text = unescape(request.responseText.replace(/NSD1;#4\|\$[0-9]*\|[a-zA-Z]*\$[0-9]*\|/,"").replace(/\$[0-9]*\|.*/,""));

		var table_cont = document.createElement("div");
		table_cont.innerHTML = table_text;
		var link_el = table_cont.querySelector("[href*='_cpanel']");
		if (link_el!=null) {
			this.cPanel_link = table_cont.querySelector("[href*='_cpanel']").href;
		} else {
			this.cPanel_link = "";
		}
		this.check_finished_then_func("gen_cpanel_url");
	}
	
	this.gen_sum_span = function() {
		sum="";
		sum+="<span>Active Page: "+this.full_url+"</span><br>"
		sum+="<span>Is Neto Site: "+bool_to_fa_check(this.is_neto)+"</span><br>"
		sum+="<span>Logged Into cPanel: "+bool_to_fa_check(this.logged_in)+"</span><br>"
		if (this.type!="") {
			sum+="<span>Page Type: "+this.type+"</span><br>"
		}
		if (this.sub_type!="") {
			sum+="<span>Page SubType: "+this.sub_type+"</span><br>"
		}
		if (this.identifier.value!="") {
			sum+="<span>"+this.identifier.prefix+": "+this.identifier.value+"</span><br>"
		}
		if (this.cPanel_link != "") {
			sum+="<a href='"+this.cPanel_link+"' target='_blank'>Link to cPanel</a><br>"
		}
		
		return sum;
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
		this.full_url=window.location.href;
		this.is_neto = false;
		this.logged_in = false;
		this.type="";
		this.sub_type="";
		this.identifier = {prefix:"",value:""};
		this.cPanel_link = "";
		this.tasks = {
			check_ajax:false,
			get_type:false,
			gen_cpanel_url:false
		};
		
		this.check_for_cpanel();
	}
	
	this.initialise();
}