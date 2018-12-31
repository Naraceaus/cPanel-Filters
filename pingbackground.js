var domain_message = {
	type:'analyse',
	loc: {
		domain: location.hostname,
		path: location.pathname
	}
}
sendMessage(domain_message);
listenForMessages(listenForNViewRequests);

function listenForNViewRequests(request, sender, sendResponse) {
	if (request.type == "check_nview") {
		var preview = "";
		if (/(^|&|\?)nview={0,1}/.test(location.search)) {
			// get nview from query string
			preview = location.search.replace(/.*(^|&|\?)nview={0,1}/,"").replace(/&.*/,"");
		} else {
			//get nview from body class
			preview = document.querySelector("body").className.replace(/^n_/,"");
		}
		
		sendResponse({preview: preview});
	} else 	if (request.type == "check_order_page") {
		var orderpage = document.querySelector("[href='javascript:freeorder();']")!=null && document.querySelector("[id^='line-_rshq0']")!=null;
		sendResponse({orderpage: orderpage});
	} else if(request.type == "mark_orderlines_for_shipping") {
		mark_orderlines_for_shipping();
	}
}



function mark_orderlines_for_shipping() {
	var lines_to_ship = document.querySelectorAll("[id*=line-_rshq]");
	var orderlines_shipped = 0;
	for (var li = 0;li<lines_to_ship.length; li++) {
		var cur_line = lines_to_ship[li];
		var line_id = cur_line.id.replace("line-_rshq","");
		var qty = document.getElementsByName("_itm_qty"+line_id)[0].value;
		cur_line.value = qty;
		
		// trigger change event
		var change_event = document.createEvent("HTMLEvents");
		change_event.initEvent("change", false, true);
		cur_line.dispatchEvent(change_event);
		
		orderlines_shipped++;
	}
	
	if (orderlines_shipped > 0) {
		display_text = "Marked "+orderlines_shipped+" orderlines for shipping";
	} else {
		display_text = "There are no orderlines to mark for shipping";;
	}
	
	document.querySelector("#ship_orderlines .description").innerText = display_text;
}