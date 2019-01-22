export const create_netosd_data = (data, sp) => {
	if (!sp) {
		sp = '|';
	}
	return 'NSD1;' + create_netosd_data_rc(data, {}, sp);
}

export const create_netosd_data_rc = (data, vids, sp) => {
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
}

export const parse_netosd_data = (data, sp) => {
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

export const parse_netosd_data_rc = (data, vds, sp) => {
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