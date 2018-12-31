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
		console.log('procesing tab location');
		console.log(tabs);
		if (tabs.length > 0) {
			console.log(tabs[0].url);
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




function make_ajax_request(url,qry_str,success_func,fail_func,is_get,input) {
	if (input == null || !(input instanceof Array)) {
		input = [];
	}
	var ajax_request = new XMLHttpRequest();
	
	ajax_request.onreadystatechange=function() {
		if (ajax_request.readyState == XMLHttpRequest.DONE ) {
			if (ajax_request.response != null) {
				// remove script tags
				ajax_request.processed_response = ajax_request.response.replace(/[\r\n]*<script[\s\S]*?<\/script>[\r\n]*/g,"")
				//remove style tags
				ajax_request.processed_response = ajax_request.processed_response.replace(/[\r\n]*<style[\s\S]*?<\/style>[\r\n]*/g,"");
				//remove image tags
				ajax_request.processed_response = ajax_request.processed_response.replace(/[\r\n]*<img[\s\S]*?>[\r\n]*/g,"");
			}
			input.unshift(ajax_request);
			if (ajax_request.status == 200) {
				if (typeof(success_func) == "function") {
					success_func.apply(this, input);
				}
			}
			else {
				if (typeof(fail_func) == "function") {
					fail_func.apply(this, input);
				}
			}
		}
	}

	var	post_get_value = "POST";
	if (is_get==true) {
		post_get_value = "GET";
	}

	ajax_request.open(post_get_value,"https://"+url, true);
	ajax_request.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
	ajax_request.send(qry_str);
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
