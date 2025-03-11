import * as storage from '../storage.js';
var uiIframe = document.getElementById('ui');

function openLink(url) {
    if (typeof(browser) == 'undefined') {
        chrome.tabs.create({url:url});
    } else {
        browser.tabs.create({url:url});
    }
}

function forceRefresh() {
    storage.getTabLocation(function(loc) {
        storage.sendMessage({
            type:'analyse',
            force_refresh: true,
            loc:loc
        });
    })			
}
//heavy is irrelevant as the css cache busting query string always gets reset by purging cache now
function purgeCache(event) {
    storage.getTabLocation(function(loc) {
        storage.sendMessage({
            type: 'purge_cache',
            heavy: false,
            loc:loc
        }, function(response) {
            event.data.action = "purge_complete";
            respondToUI(event, event.data);

            console.log(response)
        });
    })	
}

function changeTheme(event) {
    storage.getTabLocation(function(loc) {
        let new_query = loc.query;
        new_query.set('nview',event.data.newtheme);
        storage.changeLocation(loc.id, "https://"+loc.domain+"/"+loc.path+"?"+new_query);
    });
}

function checkNView(event) {
    storage.queryTabs({active: true, currentWindow: true}, function(tabs) {
        storage.sendMessageToID(tabs[0].id, {type: "check_nview"}, function(response) {
            if (typeof(response) != "undefined") {
                updateUI("preview", response.preview, event);
            }
        });
    })
}

function checkMatrixPage(event) {
    storage.queryTabs({active: true, currentWindow: true, url:"*://*/_cpanel/ship"}, function(tabs) {
        updateUI("matrixpage", tabs.length > 0, event);
    })	
}

function markOrderlinesForShipping() {
    storage.queryTabs({active: true, currentWindow: true}, function(tabs) {
        storage.sendMessageToID(tabs[0].id, {type: "mark_orderlines_for_shipping"});
    });
}

function toggleShippingMethods(event) {
    storage.queryTabs({active: true, currentWindow: true}, function(tabs) {
        storage.sendMessageToID(tabs[0].id, {type: "toggle_shipping_methods", state: event.data.state});
    });	
}

function checkParentPage(event) {
    storage.queryTabs({active: true, currentWindow: true}, function(tabs) {
        storage.sendMessageToID(tabs[0].id, {type: "check_parent_page"}, function(response) {
            if (typeof(response) != "undefined") {
                updateUI("parentpage", response.parentpage, event);
            }
        });
    })		
}

function toggleParentFields() {
    storage.queryTabs({active: true, currentWindow: true}, function(tabs) {
        storage.sendMessageToID(tabs[0].id, {type: "display_hidden_parent_fields"});
    });	
}

//-------------
function respondToUI(event,data) {
    event.source.postMessage(data,"*");
}


function updateUI(key, value, event=null) {
    let target = uiIframe.contentWindow;
    if (event != null) {
        target = event.source;
    }
    target.postMessage({action:"update_field", key:key, value:value},"*");
}

function checkOrderpage(event) {
    storage.queryTabs({active: true, currentWindow: true}, function(tabs) {
        storage.sendMessageToID(tabs[0].id, {type: "check_order_page"}, function(response) {
            if (typeof(response) != "undefined") {
                updateUI("orderpage", response.orderpage, event);
            }
        });
    });	
}

function updatePopupWithData(event) {
	storage.getTabLocation(function(loc) {
        updateUI("taburl", loc.url, event);
		storage.retrieveData(loc.domain,function(stored_site_data) {
			console.log('retrieved site date');
			console.log(stored_site_data[loc.domain]);
			if (stored_site_data[loc.domain] != null) {
                updateUI("sitedata", stored_site_data[loc.domain], event);
				storage.retrieveData(loc.domain+"|"+loc.path,function(local_url) {
					if (local_url != null) {
						console.log('loaded local pagfe for ', loc.domain+"|"+loc.path);
						console.log(local_url[loc.domain+"|"+loc.path]);
                        updateUI("localpage", local_url[loc.domain+"|"+loc.path], event);
					}
				});
				
			}
		});
	});

}

// whenever background updates the site data we need to update the UI (assuming the site url updated is the active tab)
// might need to put this in checkOrderPage to wait for iframe to be "ready"
storage.monitorStorage(function(changes) {

	storage.getTabLocation(function(loc) {
        updateUI("taburl", loc.url);
		if (changes[loc.domain] != null) {
            updateUI("sitedata", changes[loc.domain].newValue);
		} else if (changes[loc.domain+"|"+loc.path] != null) {
            updateUI("localpage", changes[loc.domain+"|"+loc.path].newValue);
		}
	})


	
});

window.addEventListener('message', function (event) {

    console.log('recevied message: ', event.data.action);
    console.log(event);

	switch (event.data.action) {
        case 'check_order_page':
            checkOrderpage(event);
            break;
        case 'update_popup_with_data':
            updatePopupWithData(event);
            break;
        case 'open_link':
            openLink(event.data.url);
            break;
        case 'force_refresh':
            forceRefresh();
            break;
        case 'purge_cache':
            purgeCache(event);
            break;
        case 'change_theme':
            changeTheme(event);
            break;
        case 'check_nview':
            checkNView(event);
            break;
        case 'mark_orderlines_for_shipping':
            markOrderlinesForShipping();
            break;
        case 'toggle_shipping_methods':
            toggleShippingMethods(event);
            break;
        case 'check_matrix_page':
            checkMatrixPage(event);
            break;
        case 'check_parent_page':
            checkParentPage(event);
            break;
        case 'toggle_parent_fields':
            toggleParentFields();
            break;
        case 'resize':
            resizeUI(event);
    }
});

function resizeUI(event) {
    uiIframe.height = event.data.height + "px";
    uiIframe.width = event.data.width + "px";
}

//ping iframe to give it something to respond to
console.log('ping ui to give it origin');
uiIframe.addEventListener("load", () => {
    uiIframe.contentWindow.postMessage({action: "hello"},"*");
});