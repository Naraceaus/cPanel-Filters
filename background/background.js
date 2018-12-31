monitorStorage(function(changes) {
	console.log(changes);
});

listenForMessages(handleMessages);

function handleMessages(message, sender, send_response) {
	//loc specified then a content script hit a site
	console.log(message);
	switch (message.type) {
		case "analyse":
			console.log(message);
			console.log('had force refresh: ',message.force_refresh != null && message.force_refresh)
			if (message.force_refresh != null && message.force_refresh) {
				// refresh site without checking what we learned already
				analyseSite(message.loc.domain, message.loc.path);
			} else {
				// pull from loc storage the site info, if there is none initiate checks
				//otherwise check the last updated timestamp and only initiate check if it's older than X
				retrieveData(message.loc.domain,function(domain_data) {
					analyseSite(message.loc.domain, message.loc.path, domain_data[message.loc.domain]);
				});				
			}
			break;
		case "purge_cache":
			purgeCache(message, send_response);
			return true;
			break;
	}

}


function analyseSite(domain, path, site_data) {
	// replace preceding slash in string with nothing
	var truncated_path = path.replace(/^\//,"");
	if (site_data == null) {
		site_data = {
			status:"CHECKING FOR NETO",
			loggedin: false,
			domain: domain,
			themes:['LOADING'],
			livetheme:'LOADING',
			last_checked: new Date().getTime()
		};
		console.log('created empty template for site ', domain);
		storeData(domain,site_data);
	}
	// add timestamp check so only check login every X minutes
	if (site_data.status != "NOT A NETO SITE") {
		checkIsNeto();		
	}
	
	
	function checkIsNeto() {
		make_ajax_request(domain+"/_cpanel","ajax=y",isNetoResult,isNetoResult)
	}
	
	function isNetoResult(ajax_response) {
		if (ajax_response.status != 200 || !ajax_response.responseText.startsWith("NSD1;")) {
			site_data.status = "NOT A NETO SITE";
			storeData(domain,site_data);
		} else {
			site_data.status = "CHECKING LOGIN";
			storeData(domain,site_data);
			isLoggedInResult(ajax_response);
		}
	}
	
	function isLoggedInResult(ajax_response) {
		var response_to_json = parse_netosd_data(ajax_response.responseText);
		if (response_to_json.error != null && response_to_json.error == "NOT_LOGGED_IN") {
			site_data.status = "NOT LOGGED IN";
			site_data.loggedin = false;
			storeData(domain,site_data);
		} else if (response_to_json.new_csrf_token != null) {
			site_data.status = "LOGGED IN";
			site_data.loggedin = true;
			storeData(domain,site_data);	
			findPageIncPanel();

			
		} else {
			console.log('bugger');
			console.log(ajax_response.responseText);
			site_data.status = "WOOPS SOMETHING BROKE";
			storeData(domain,site_data);			
		}
	}
	
	function findPageIncPanel() {

		make_ajax_request(domain+"/_cpanel","tkn=url&_ftr_request_url=^"+truncated_path+"&ajax=y",function(response) {
			var url_table = document.createElement("div");
			url_table.innerHTML = parse_netosd_data(response.processed_response).content;
			console.log(url_table);
			var total_urls_elem = url_table.querySelector('[name="itm_total"]');
			console.log(total_urls_elem);
			console.log(total_urls_elem.value);
			if (total_urls_elem != null && parseInt(total_urls_elem.value) > 0) {
				var link_elem = url_table.querySelector('a[href*="?id="]');
				console.log(link_elem);
				if (link_elem != null) {
					storeData(domain+"|"+truncated_path,link_elem.getAttribute('href'));
					checkTheme();
				} else {
					storeData(domain+"|"+truncated_path,"NO RESULTS");
				}					
			} else {
				storeData(domain+"|"+truncated_path,"NO RESULTS");
			}
		});
	}
	
	function checkTheme() {
		make_ajax_request(domain+"/_cpanel/setup_wizard/webshopconfig","",checkThemeResponse,null,true);
		
		function checkThemeResponse(response) {
			var webstore_page = response.processed_response;
			var res_cont = document.createElement("div");
			res_cont.innerHTML = webstore_page;
			theme_ident_el = res_cont.querySelector("[value='TEMPLATELANG']");
			if (theme_ident_el!=null) {
				var theme_sel_name = theme_ident_el.name.replace("cfg","cfgval");
				var theme_sel = res_cont.querySelector("[name='"+theme_sel_name+"']");
				
				// store live theme
				site_data.livetheme = theme_sel.value;
				
				
				//generate list of themes in system for active page dropdown
				var avail_themes = [];
				var theme_opt = theme_sel.children;
				for (var toi = 0; toi < theme_opt.length; toi++) {
					avail_themes.push(theme_opt[toi].value);
				}
				//store available themes
				site_data.themes = avail_themes;
				
				storeData(domain,site_data);
			} else {
				// store fact couldn't find themes
				site_data.livetheme = 'N.A.';
				site_data.themes = ['N.A.'];
				storeData(domain,site_data);
			}
		}
	}
}
var testelem;
function purgeCache(message, send_response) {
	
	// request css config to chcek current value
	make_ajax_request(message.loc.domain+"/_cpanel/config/view?id=NETO_CSS_VERSION&mod=main","",readCSSValue,null,true);
	
	function readCSSValue(response) {
		var css_page = response.processed_response;
		var res_cont = document.createElement("div");
		res_cont.innerHTML = css_page;
		
		
		var purge_cache_csrf_token = response.responseText.replace(/[\s\S]*csrfTokenSystemRefresh = '/,"").replace(/';[\s\S]*/,"");
		
		console.log(purge_cache_csrf_token);
		console.log(res_cont);
		testelem = res_cont;
		if (message.heavy) {
			var new_css_num = parseInt(res_cont.querySelector("[name='value']").value)+1;
			var update_qry_str = "csrf_token="+res_cont.querySelector("[name='csrf_token']").value+
				"&item=config&page=view&action=edit&mod=main&id=NETO_CSS_VERSION"+
				"&value="+new_css_num;
			// update css value with incremented amount
			make_ajax_request(message.loc.domain+"/_cpanel/config/view",update_qry_str,function(response) {
				triggerPurgeCache(purge_cache_csrf_token) 			
			});
		} else {
			triggerPurgeCache(purge_cache_csrf_token);
		}
	}
	
	function triggerPurgeCache(csrf_token) {
		console.log('csrf token');
		console.log(csrf_token);
		
		var update_qry_str = "csrf_token="+csrf_token+
			"&ajaxfn=system_refresh&ajax=y";
		// update css value with incremented amount
		make_ajax_request(message.loc.domain+"/_cpanel",update_qry_str,function(response) {
			//TODO refresh purgecached tab
			if (typeof(browser) == 'undefined') {
				chrome.tabs.reload(message.loc.id);
			} else {
				browser.tabs.reload(message.loc.id);
			}
			// TODO try cacth arouynd send_response in case popup is closed before purge cache finishes
			send_response({'boop':'adoop'});
		});
	}
}