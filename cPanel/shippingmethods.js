	var ship_ser_opts = document.querySelectorAll("[name*='lnk_shm'] > option");
	for (var ssoi = 0; ssoi < ship_ser_opts.length; ssoi++) {
		var cur_ser_opt = ship_ser_opts[ssoi];
		var ser_id = cur_ser_opt.value;
		var ser_name = cur_ser_opt.innerText;
		if (!ser_name.startsWith(ser_id) && ser_id != "") {
			cur_ser_opt.innerText = ser_id + " - " + ser_name;
		}
	}
