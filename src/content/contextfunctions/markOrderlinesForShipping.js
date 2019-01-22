contextController.markOrderLinesForShipping = function() {
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
}