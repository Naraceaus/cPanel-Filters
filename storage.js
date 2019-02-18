function storeData(key, value, success, error) {
	var item_set={};
	item_set[key] = value;
	if (typeof(browser) == 'undefined') {
		chrome.storage.local.set(item_set,success)
	} else {
		browser.storage.local.set(item_set)
			.then(success, error);
	}
}

function retrieveData(keys,success,error) {
	if (typeof(browser) == 'undefined') {
		chrome.storage.local.get(keys,success)
	} else {
		browser.storage.local.get(keys)
			.then(success, error);
	}	
}

function monitorStorage(callback) {
	if (typeof(browser) == 'undefined') {
		var browser = chrome;
	}
	
	browser.storage.onChanged.addListener(callback);
}


function sendMessage(data, proc_response) {
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

function sendMessageToID(id, data, proc_response) {
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

function listenForMessages(func) {
	if (typeof(browser) == 'undefined') {
		chrome.runtime.onMessage.addListener(func);
	} else {
		browser.runtime.onMessage.addListener(func);
	}
}

function queryTabs(filter, func) {
	if (typeof(browser) == 'undefined') {
		chrome.tabs.query(filter, func);
	} else {
		browser.tabs.query(filter).then(func);
	}
}

// retrieve active tab domain and run domain through callback
function getTabLocation(callback) {
	if (typeof(browser) == 'undefined') {
		chrome.tabs.query(
			{
				currentWindow: true,
				active: true
			}, 
			processTabLocation
		);
	} else {
		browser.tabs.query({
			currentWindow: true,
			active: true
		})
		.then(processTabLocation);
	}

	
	function processTabLocation(tabs) {
		
		
		if (tabs.length > 0) {
			
			var loc = {
				id: tabs[0].id,
				url: tabs[0].url,
				domain: extractDomain(tabs[0].url),
				path: extractPath(tabs[0].url),
				query: extractQueryString(tabs[0].url)
			}
			callback(loc);
		}
	}
}

function changeLocation(tab_id, url) {
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

function extractDomain(full_url) {
	return full_url.replace(/http.*\/\//,"").replace(/\/.*/,"").replace(/\?.*/,"");
}
function extractPath(full_url) {
	return full_url.replace(/http.*\/\//,"").replace(/.*?(\/|$)/,"").replace(/\?.*/,"");
}
function extractQueryString(full_url) {
	return full_url.replace(/.*?(\?|$)/,"")
}

function create_netosd_data(data, sp) {
	if (!sp) {
		sp = '|';
	}
	return 'NSD1;' + create_netosd_data_rc(data, {}, sp);
};
function create_netosd_data_rc(data, vids, sp) {
	var rtn = '';
	if (data instanceof Array) {
		rtn = '@';
		var ctr = data.length;
		rtn += '' + ctr + sp;
		for (var i = 0; i < ctr; i++) {
			rtn += '' + create_netosd_data_rc(data[i], vids, sp);
		}
	} else if (data instanceof Object) {
		rtn = '#';
		var ctr = 0;
		for (var k in data) {
			ctr++;
		}
		rtn += '' + ctr + sp;
		for (var k in data) {
			rtn += '' + create_netosd_data_rc(k, vids, sp) + create_netosd_data_rc(data[k], vids, sp);
		}
	} else {
		rtn = '$';
		var tmp = escape(data);
		rtn += tmp.length + sp + tmp;
	}
	return rtn;
};
function parse_netosd_data(data, sp) {
	if (!sp) {
		sp = '|';
	}
	var txt = data.substr(0, 5);
	data = data.substr(5);
	if (txt == 'NSD1;') {
		var tmp = parse_netosd_data_rc(data, [], sp);
		return tmp[1];
	}
	return null;
};
function parse_netosd_data_rc(data, vds, sp) {
	if (!sp) {
		sp = '|';
	}
	var typ = '$';
	var len = '';
	var kvdata;
	var cur = 0;
	typ = data.substr(cur, 1);
	if (typ == '#' || typ == '@' || typ == '&' || typ == '$') {
		var done = false;
		while (!done && cur < data.length) {
			cur++;
			var chr = data.substr(cur, 1);
			if (chr == '|') {
				done = true;
			} else {
				len += chr;
			}
		}
		len = parseInt(len);
		if (!isNaN(len) && len >= 0) {
			data = data.substr(cur + 1);
			if (typ == '@' || typ == '#') {
				if (typ == '@') {
					kvdata = [];
				} else {
					kvdata = {};
				}
				vds.push(kvdata);
				if (typ == '@') {
					for (var i = 0; i < len; i++) {
						var tmp = parse_netosd_data_rc(data, vds, sp);
						data = tmp[0];
						kvdata.push(tmp[1]);
					}
				} else {
					for (var i = 0; i < len; i++) {
						var tmpk = parse_netosd_data_rc(data, vds, sp);
						data = tmpk[0];
						var tmp = parse_netosd_data_rc(data, vds, sp);
						data = tmp[0];
						kvdata[tmpk[1]] = tmp[1];
					}
				}
				return [data, kvdata];
			} else if (typ == '&') {
				if (len - 1 < vds.length) {
					return [data, vds[len - 1]];
				}
				return (data,
				null);
			} else if (typ == '$') {
				var txt = unescape(data.substr(0, len));
				txt = txt.replace(/%u{([0-9A-Za-z]+)}/g, function($1, $2) {
					return String.fromCharCode(parseInt('0x' + $2));
				});
				data = data.substr(len);
				return [data, txt];
			}
		}
	}
	return [data, kvdata];
}

/**
 * Returns a Promise with a Document or string from the given URL with query parameters.
 * Promise returns an object with a text and dom attribute if needDom is true.
 * @param {string} url 				- The URL to get the Document from 
 * @param {object} queries 			- An Object of key-value pairs of query parameters. Defaults to an empty object
 */
async function getPage(url, queries={}, needDom=false) {
	return new Promise((resolve, reject) => {
		let uri = `https://${url}?`
		Object.entries(queries).forEach(pair => {
			uri = `${uri}${pair[0]}=${pair[1]}&`
		})
		fetch(uri)
			.then(
				response => response.text()
			)
			.then(
				body =>resolve(body)
			)
			.catch(
				err => reject('')
			)
	})
}

/**
 * Returns a Promise with a Document or string from the given URL with query parameters.
 * Promise returns text result
 * @param {string} url 				- The URL to get the Document from 
 * @param {object} parameters 		- An Object of key-value pairs of query parameters. Defaults to an empty object
 */
async function postPage(url, parameters={}) {
	return new Promise((resolve, reject) => {
		let uri = `https://${url}`
		let opts = {
			method: "POST",
			body: jsonToFormData(parameters),
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			}
		}
		fetch(uri, opts)
			.then(
				response => response.text()
			)
			.then(
				text => resolve(text)
			)
			.catch(
				text => reject('')
			)
	})
}

/**
 * Converts a JSON object into a form data string. Does not supported nested data.
 * @param {object} json the JSON object.
 * @returns {string} the encoded form data.
 */
const jsonToFormData = json =>
  Object.keys(json)
    .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(json[key]))
    .join("&");