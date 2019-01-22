/**
 * Store some data to the browser's local storage
 * @param {string} key - Key in local storage to store data
 * @param {string} value - Value in local storage to store data
 * @param {function} success - Callback function to run if store is successful
 * @param {function} error  - Callback function to run if store is unsuccessful
 */
export const storeData = (key, value, success, error) => {
	var item_set={};
	item_set[key] = value;
	if (typeof(browser) == 'undefined') {
		chrome.storage.local.set(item_set,success)
	} else {
		browser.storage.local.set(item_set)
			.then(success, error);
	}
}

/**
 * Retrieve data from the browser's local storage
 * @param {string[]} keys - array of keys to get data from
 * @param {function} success - Callback function to run if store is successful
 * @param {function} error - Callback function to run if store is unsuccessful
 */
export const retrieveData = (keys,success,error) => {
	if (typeof(browser) == 'undefined') {
		chrome.storage.local.get(keys,success)
	} else {
		browser.storage.local.get(keys)
			.then(success, error);
	}	
}

/**
 * Monitor local storage for changes and call the callback function on a change
 * @param {function} callback - Function to callback on storage changes
 */
export const monitorStorage = (callback) => {
	if (typeof(browser) == 'undefined') {
		var browser = chrome;
	}
	
	browser.storage.onChanged.addListener(callback);
}

/**
 * Send message to all tabs in the browser
 * @param {*} data - Data to send to all tabs
 * @param {function} proc_response - Callback function if successful
 */
export const sendMessage = (data, proc_response) => {
	if (typeof(browser) == 'undefined') {
		chrome.runtime.sendMessage(data, proc_response);
	} else {
		if (proc_response != null) {
			browser.runtime.sendMessage(data).then(proc_response);
		} else {
			browser.runtime.sendMessage(data)
		}
	}
}

/**
 * 
 * @param {integer} id - ID of tab in the browser
 * @param {*} data - Data to send to the specific tab
 * @param {function} proc_response - Function to call on success
 */
export const sendMessageToID = (id, data, proc_response) => {
	if (typeof(browser) == 'undefined') {
		chrome.tabs.sendMessage(id, data, proc_response);
	} else {
		if (proc_response != null) {
			browser.tabs.sendMessage(id, data).then(proc_response);
		} else {
			browser.tabs.sendMessage(id, data)
		}
	}
}

/**
 * Listen for new messages to the current tab
 * @param {function} func - Function to call on a new message
 */
export const listenForMessages = (func) => {
	if (typeof(browser) == 'undefined') {
		chrome.runtime.onMessage.addListener(func);
	} else {
		browser.runtime.onMessage.addListener(func);
	}
}

/**
 * 
 * @param {string} filter - String to filter tab titles by 
 * @param {function} func - Function to call on successful 
 */
export const queryTabs = (filter, func) => {
	if (typeof(browser) == 'undefined') {
		chrome.tabs.query(filter, func);
	} else {
		browser.tabs.query(filter).then(func);
	}
}

/**
 * Get the URL for the current tab and pass it to the callback function
 * @param {function} callback - function to pass URL to
 */
export const getTabLocation = (callback) => {
	if (typeof(browser) == 'undefined') {
		chrome.tabs.query(
			{
				currentWindow: true,
				active: true
			}, 
			tabs => {
				if (tabs.length > 0) {
					callback({...tabs[0]})
				}
			}
		);
	} else {
		browser.tabs.query({
			currentWindow: true,
			active: true
		})
		.then(
			tabs => {
				callback({...tabs[0]})	
			}
		)
	}
}

/**
 * Change the URL of the provided tab
 * @param {integer} tab_id - ID of tab to change the URL of 
 * @param {string} url - Url to change the URL to
 */
export const changeLocation = (tab_id, url) => {
	if (typeof(browser) == 'undefined') {
		chrome.tabs.update(
			tab_id,
			{
				url: url
			}
		);
	} else {
		browser.tabs.update(
			tab_id,
			{
				url: url
			}
		);
	}
}