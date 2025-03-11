import * as storage from '../storage.js';



storage.monitorStorage(function(changes) {
	
});

storage.listenForMessages(handleMessages);

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
				storage.retrieveData(message.loc.domain,function(domain_data) {
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
			truncated_path: truncated_path,
			themes:['LOADING'],
			livetheme:'LOADING',
			last_checked: new Date().getTime()
		};
		
		storage.storeData(domain,siteData);
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
		storage.getPage(url, {'ajax': 'y'})
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
		storage.storeData(domain,siteData);
	}

	/**
	 * Determines if you're logged into the current Neto site and stores the result
	 * @param {string} text - 
	 */
	async function isLoggedInResult(text) {
		var response = storage.parse_netosd_data(text)
		if (response.error != null && response.error == "NOT_LOGGED_IN") {
			siteData.status = "NOT LOGGED IN"
			siteData.loggedin = true
			storage.storeData(domain,siteData);
		} else if (response.new_csrf_token != null) {
			siteData.status = "LOGGED IN";
			siteData.loggedin = true;

			//use offscreen cause I need domparser to analyse fetch results when looking for matching cpanl link/theme options
			console.log('first document')
			chrome.offscreen.createDocument({
				url: 'background/page-searcher.html',
				reasons: ['DOM_PARSER','LOCAL_STORAGE'],
				justification: 'Checking available themes and finding matching Control Panel page for currently viewed Web Page',
			})
			.then(()=> {
				console.log('sending find_page_in_cpanel message to first document')
				storage.sendMessage({
					type: 'find_page_in_cpanel',
					site_data: siteData,
					truncated_path: truncated_path
				}, function(response) {
					console.log('find_page_in_cpanel response');
					console.log(response)
					let storedURL = `${response.site_data.domain}|${response.truncated_path}`;
					storage.storeData(storedURL, response.link);

					chrome.offscreen.closeDocument()
					.then(()=>{

						console.log('second document')
						//use offscreen cause I need domparser to analyse fetch results when looking for matching cpanl link/theme options
						chrome.offscreen.createDocument({
							url: 'background/page-searcher.html',
							reasons: ['DOM_PARSER','LOCAL_STORAGE'],
							justification: 'Checking available themes and finding matching Control Panel page for currently viewed Web Page',
						})
						.then(()=> {
							storage.sendMessage({
								type: 'check_theme',
								site_data: siteData,
							}, function(response) {
								storage.storeData(response.site_data.domain, response.site_data);
								chrome.offscreen.closeDocument();

							});
						})




					})

				});
			}).catch((error)=>{console.log(error)});

		} else {
			siteData.status = "WOOPS SOMETHING BROKE";
			storage.storeData(domain,siteData);
		}
					
	}
	

}
/**
 * 
 * @param {Message} message 		- 
 * @param {function} send_response  - 
 */
function purgeCache(message, send_response) {
	// request css config to chcek current value
	let url = `${message.loc.domain}/_cpanel`
	let queries = {
		"id": "NETO_CSS_VERSION",
		"mod": "main"
	}
	storage.getPage(url, queries)
		.then(
			text => readCSSValue(text)
		)
	
	async function readCSSValue(response) {
		let purge_cache_csrf_token = response.replace(/[\s\S]*csrfTokenSystemRefresh = '/,"").replace(/';[\s\S]*/,"");
		triggerPurgeCache(purge_cache_csrf_token);
	}
	
	async function triggerPurgeCache(csrf_token) {
		let body = {
			csrf_token: csrf_token,
			ajaxfn: 'system_refresh',
			ajax: 'y'
		}
		storage.postPage(url, body)
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
