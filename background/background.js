monitorStorage(function(changes) {
	
});

listenForMessages(handleMessages);

function handleMessages(message, sender, send_response) {
	//loc specified then a content script hit a site
	
	switch (message.type) {
		case "analyse":
			
			
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


function analyseSite(domain, path, siteData) {
	// replace preceding slash in string with nothing
	var truncated_path = path.replace(/^\//,"");
	if (siteData == null) {
		siteData = {
			status:"CHECKING FOR NETO",
			loggedin: false,
			domain: domain,
			themes:['LOADING'],
			livetheme:'LOADING',
			last_checked: new Date().getTime()
		};
		
		storeData(domain,siteData);
	}
	// add timestamp check so only check login every X minutes
	if (siteData.status != "NOT A NETO SITE") {
		checkIsNeto();		
	}
	
	/**
	 * Checks if the current page is a Neto site and stores the result.
	 */
	function checkIsNeto() {
		let url = `${domain}/_cpanel`;
		console.log('checking for neto')
		getPage(url, {'ajax': 'y'}, true)
			.then(
				text => {
					console.log(`here is some data ${text}`)
					isNetoResult(text);
				}
			)
	}
	
	/**
	 * Determines if the current page is a Neto site and stores the result
	 * @param {string} text - A string containing the result of getting a cpanel page 
	 */
	async function isNetoResult(text) {
		if (text === '' || text.startsWith("NSD1;")) {
			siteData.status = "NOT A NETO SITE";
		} else {
			siteData.status = "CHECKING LOGIN";
			isLoggedInResult(text);
		}
		storeData(domain,siteData);
	}
	
	/**
	 * Determines if you're logged into the current Neto site and stores the result
	 * @param {string} text 
	 */
	async function isLoggedInResult(text) {
		var response = parse_netosd_data(text)
		if (response.error != null && response.error == "NOT_LOGGED_IN") {
			siteData.status = "NOT LOGGED IN"
			siteData.loggedin = true
		} else if (response.new_csrf_token != null) {
			siteData.status = "LOGGED IN";
			siteData.loggedin = true;
			findPageIncPanel();
			checkTheme();
		} else {
			siteData.status = "WOOPS SOMETHING BROKE";
		}
		storeData(domain,siteDdata);			
	}
	
	/**
	 * Finds the corresponding page in the control page for this webstore page and stores the result
	 */
	async function findPageInCPanel() {
		let url = `${domain}/_cpanel`
		let queries = {
			"tkn": "url",
			"_ftr_request_url": `^${truncated_path}`,
			"ajax": "y"
		}
		let selector = "#ajax-content-pl table tbody tr:first-of-type td:nth-of-type(2) a"
		let storedDomain = `${domain}|${truncatedPath}`
		getPage(url,queries)
			.then(
				doc => {
					let link = doc.querySelector(selector);
					link
						? storeData(storedDomain, link.getAttribute('href'))
						: storeData(storedDomain, "NO RESULTS")
				}
			)
			.catch(
				doc => {
					storeData(storedDomain, "NO RESULTS");
				}
			)
	}
	
	/**
	 * Checks the installed themes and finds the active theme and stores both results
	 */
	async function checkTheme() {
		let url = `${domain}/_cpanel/setup_wizard/webshopconfig`
		getPage(url)
			.then(
				doc => {
					let options = [...doc.querySelector("select[name='cfgval0']").children]
					let themes = []
					let liveTheme = ""
					options.forEach(option => {
						themes.push(option.value)
						option.selected
							? liveTheme = option.value
							: null
					})
					siteData.liveTheme = liveTheme
					siteData.themes = themes
					storeData(domain, siteData)
				}
			)
			.catch(
				doc => {
					siteData.liveTheme = "N.A"
					siteData.themes = ["N.A"]
					storeData(domain, siteData)
				}
			)
		}
}
/**
 * TODO - add description for this function 
 * @param {*} message 
 * @param {*} send_response 
 */
function purgeCache(message, send_response) {
	// request css config to chcek current value
	make_ajax_request(message.loc.domain+"/_cpanel/config/view?id=NETO_CSS_VERSION&mod=main","",readCSSValue,null,true);
	
	function readCSSValue(response) {
		var css_page = response.processed_response;
		var res_cont = document.createElement("div");
		res_cont.innerHTML = css_page;
		
		
		var purge_cache_csrf_token = response.responseText.replace(/[\s\S]*csrfTokenSystemRefresh = '/,"").replace(/';[\s\S]*/,"");
		
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