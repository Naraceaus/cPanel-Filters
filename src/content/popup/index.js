import Vue from 'vue/dist/vue.js'
import * as storage from '../../utils/storage'

console.log('sdfdsfds')

const {
    getTabLocation, 
    sendMessage,
    changeLocation,
    queryTabs,
    sendMessageToID,
	retrieveData,
	monitorStorage
} = storage


const helperUI = new Vue({
	el: '#extension-wrapper',
	data: {
		sitedata: {
			domain:'',
			status:'AWAITING',
			loggedin: false,
			themes:['LOADING'],
			livetheme:'LOADING'
		},
		localpage: 'LOADING',
		purgingcache: false,
		preview: '',
		orderpage: false,
		matrixpage: false,
		parentpage: false
	},
	methods: {
		openLink: function(url) {
			if (typeof(browser) == 'undefined') {
				chrome.tabs.create({url:url});
			} else {
				browser.tabs.create({url:url});
			}
		},
		forceRefresh: function() {
		    getTabLocation(function(loc) {
				sendMessage({
					type:'analyse',
					force_refresh: true,
					loc:loc
				});
			})			
		},
		purgeCache: function(heavy) {
			this.purgingcache = true;
			getTabLocation(function(loc) {
			sendMessage({
					type: 'purge_cache',
					heavy: heavy,
					loc:loc
				}, function(response) {
					this.purgingcache = false;
				});
			})	
		},
		changeTheme: function() {
			var new_theme = this.preview;
			getTabLocation(function(loc) {
				var new_query = loc.query;
				if (/(^|&)nview={0,1}.*?($|&)/.test(new_query)) {
					new_query = new_query.replace(/(^|&)nview={0,1}.*?($|&)/,"");
				}
				if (new_query.length > 0) {
					new_query+="&"
				}
				new_query+="nview="+new_theme;
				changeLocation(loc.id, "https://"+loc.domain+"/"+loc.path+"?"+new_query);
			});
		},
		checkNView: function() {
			var self = this;
			queryTabs({active: true, currentWindow: true}, function(tabs) {
				sendMessageToID(tabs[0].id, {target:"contextController", func: "checkNView"}, function(response) {
					if (typeof(response) != "undefined") {
						self.preview = response.preview;
					}
				});
			})
		},
		checkOrderPage: function() {
			var self = this;
			queryTabs({active: true, currentWindow: true}, function(tabs) {
				sendMessageToID(tabs[0].id, {target:"contextController", func: "checkOrderPage"}, function(response) {
					if (typeof(response) != "undefined") {
						self.orderpage = response.orderpage;
					}
				});
			})			
		},
		checkMatrixPage: function() {
			var self = this;
			queryTabs({active: true, currentWindow: true, url:"*://*/_cpanel/ship"}, function(tabs) {
				self.matrixpage = tabs.length > 0;
			})			
		},
		markOrderlinesForShipping: function() {
			queryTabs({active: true, currentWindow: true}, function(tabs) {
				sendMessageToID(tabs[0].id, {target:"contextController", func: "markOrderlinesForShipping"});
			});			
		},
		toggleShippingMethods: function(state) {
			queryTabs({active: true, currentWindow: true}, function(tabs) {
				sendMessageToID(tabs[0].id, {target:"contextController", func: "toggleShippingMethods", input:{state: state}});
			});			
		},
		checkParentPage: function() {
			var self = this;
			
			queryTabs({active: true, currentWindow: true}, function(tabs) {
				sendMessageToID(tabs[0].id, {target:"contextController", func: "checkParentPage"}, function(response) {
					if (typeof(response) != "undefined") {
						self.parentpage = response.parentpage;
					}
				});
			})			
		},
		displayHiddenParentFields: function() {
			queryTabs({active: true, currentWindow: true}, function(tabs) {
				sendMessageToID(tabs[0].id, {target:"contextController", func:"displayHiddenParentFields"});
			});	
		}
	},
	created: function() {
		this.checkNView();
		this.checkOrderPage();
		this.checkMatrixPage();
		this.checkParentPage();
	}
})

/*
retrieveData('popupstes',getWorked,getFailed);

function setWorked() {
	console.log('set worked');
	retrieveData('popupstes',getWorked,getFailed);
}

function setFailed(error) {
	console.log('set failed')
	console.log(error)
}

function getWorked(item) {
	console.log(item);
	document.querySelector("#test").innerText = item['popupstes'];
}

function getFailed(error) {
	console.log('get failed')
	console.log(error)
}
*/



////////////////////////////////////////////////////////////////


// given an object containing site data, check the URL matches and update the UI to match


function updatePopupWithData() {
	getTabLocation(function(loc) {

		retrieveData(loc.domain,function(stored_site_data) {
			if (stored_site_data[loc.domain] != null) {
				helper_ui.sitedata = stored_site_data[loc.domain];
				retrieveData(loc.domain+"|"+loc.path,function(local_url) {
					if (local_url != null) {
						helper_ui.localpage = local_url[loc.domain+"|"+loc.path];
					}
				});
				
			}
		});
	});

}
updatePopupWithData();

// whenever background updates the site data we need to update the UI (assuming the site url updated is the active tab)
monitorStorage(function(changes) {

	getTabLocation(function(loc) {;
		if (changes[loc.domain] != null) {
			helper_ui.sitedata = changes[loc.domain].newValue;
		} else if (changes[loc.domain+"|"+loc.path] != null) {
			helper_ui.localpage = changes[loc.domain+"|"+loc.path].newValue;
		}
	})
});