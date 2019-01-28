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
		getPage(url, {'ajax': 'y'})
			.then(
				text => {
					isNetoResult(text);
				}
			)
	}
	
	/**
	 * Determines if the current page is a Neto site and stores the result
	 * @param {string} text - A string containing the result of getting a cpanel page 
	 */
	async function isNetoResult(text) {
		console.log(text == undefined);
		if (text != undefined && !(text === "") && text.startsWith("NSD1;")) {
			siteData.status = "CHECKING LOGIN";
			isLoggedInResult(text);
		} else {
			siteData.status = "NOT A NETO SITE";
		}
		storeData(domain,siteData);
	}

	/**
	 * Determines if you're logged into the current Neto site and stores the result
	 * @param {string} text - 
	 */
	async function isLoggedInResult(text) {
		var response = parse_netosd_data(text)
		if (response.error != null && response.error == "NOT_LOGGED_IN") {
			siteData.status = "NOT LOGGED IN"
			siteData.loggedin = true
		} else if (response.new_csrf_token != null) {
			siteData.status = "LOGGED IN";
			siteData.loggedin = true;
			findPageInCPanel();
			checkTheme();
		} else {
			siteData.status = "WOOPS SOMETHING BROKE";
		}
		storeData(domain,siteData);			
	}
	
	/**
	 * Finds the corresponding page in the control page for this webstore page and stores the result
	 */
	async function findPageInCPanel() {
		let url = `${domain}/_cpanel/url`
		let queries = {
			"_ftr_request_url": `^${truncated_path}`
		}
		let selector = "#ajax-content-pl table tbody tr:first-of-type td:nth-of-type(2) a"
		let storedDomain = `${domain}|${truncated_path}`
		getPage(url, queries)
			.then(
				text => {
					let parser = new DOMParser()
					let link = parser.parseFromString(text, "text/html").querySelector(selector);
					console.log("parse link");
					console.log(parser.parseFromString(text, "text/html"));
					console.log(link);
					link
						? storeData(storedDomain, link.getAttribute('href'))
						: storeData(storedDomain, "NO RESULTS")
				}
			)
			.catch(
				result => {
					console.log('Error');
					console.log(result);
					storeData(storedDomain, "NO RESULTS");
				}
			)
	}
	
	/**
	 * Checks the installed themes and finds the active theme and stores both results
	 */
	async function checkTheme() {
		let url = `${domain}/_cpanel/setup_wizard`
		let queries = {
			"id": "webshopconfig"
		}
		getPage(url, queries)
			.then(
				result => {
					console.log("chjecktheme ajax response");
					console.log(result)
					let parser = new DOMParser()
					let options = [...parser.parseFromString(result, "text/html").querySelector("select[name='cfgval0']").children]
					let themes = []
					let livetheme = ""
					options.forEach(option => {
						themes.push(option.value)
						option.selected
							? livetheme = option.value
							: null
					})
					siteData.livetheme = livetheme
					siteData.themes = themes
					storeData(domain, siteData)
				}
			)
			.catch(
				result => {
					console.log("ERROR");
					console.log(result);
					siteData.livetheme = "N.A"
					siteData.themes = ["N.A"]
					storeData(domain, siteData)
				}
			)
		}
}
/**
 * 
 * @param {Message} message 		- 
 * @param {function} send_response  - 
 */
function purgeCache(message, send_response) {
	// request css config to chcek current value
	let url = `${message.loc.domain}/_cpanel/config/view`
	let queries = {
		"id": "NETO_CSS_VERSION",
		"mod": "main"
	}
	getPage(url, queries)
		.then(
			text => readCSSValue(text)
		)
	
	async function readCSSValue(response) {
		let purge_cache_csrf_token = response.replace(/[\s\S]*csrfTokenSystemRefresh = '/,"").replace(/';[\s\S]*/,"");

		if (message.heavy) {
			let parser = new DOMParser()
			let doc = parser.parseFromString(response, "text/html")
			var newCSSVersion = parseInt(doc.querySelector("[name='value']").value) + 1;
			let token = doc.querySelector("[name='csrf_token']").value;
			var body = {
				csrf_token: token,
				item: 'config',
				page: 'view',
				action: 'edit',
				mod: 'main',
				id: 'NETO_CSS_VERSION',
				value: newCSSVersion
			}
			postPage(url, body)
				.then(
					text => triggerPurgeCache(purge_cache_csrf_token)			
				)
		} else {
			triggerPurgeCache(purge_cache_csrf_token);
		}
	}
	
	async function triggerPurgeCache(csrf_token) {
		let body = {
			csrf_token: csrf_token,
			ajaxfn: 'system_refresh',
			ajax: 'y'
		}
		postPage(url, body)
			.then(
				text => {
					if (typeof(browser) == 'undefined') {
						chrome.tabs.reload(message.loc.id);
					} else {
						browser.tabs.reload(message.loc.id);
					}
					send_response({'boop':'adoop'});
				}
			)
	}
}
