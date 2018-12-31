// labelling methods and rates better in the shipping matrix
function prepend_ids_in_ship_matrix() {
	// method prepending
	var method_containers = document.querySelectorAll(".shm-method-info-pl");
	for (var mci = 0; mci < method_containers.length; mci++) {
		cur_met = method_containers[mci];
		
		var name_el = cur_met.querySelector(".shm-method-name");
		while (name_el.children.length > 0) {
			name_el = name_el.children[0];
		}
		var method_id = cur_met.querySelector(".sh-group-id").value;
		name_el.textContent = method_id + " - " + name_el.textContent;
		
	}
	
	//rate prepending
	var rates_containers = document.querySelectorAll(".shm-config-sr");
	for (var rci = 0; rci < rates_containers.length; rci++) {
		cur_rate = rates_containers[rci];
		
		var name_el = cur_rate.querySelector(".sh-method-name");
		while (name_el.children.length > 0) {
			name_el = name_el.children[0];
		}
		var rate_id = cur_rate.querySelector(".sh-ref").value;
		name_el.textContent = rate_id + " - " + name_el.textContent;
		
	}
	
	//label prepending
	var label_containers = document.querySelectorAll(".shm-config-cl");
	for (var rci = 0; rci < label_containers.length; rci++) {
		cur_label = label_containers[rci];
		
		var name_el = cur_label.querySelector(".sh-acc-name");
		while (name_el.children.length > 0) {
			name_el = name_el.children[0];
		}
		var label_id = cur_label.querySelector(".sh-acc-id").value;
		name_el.textContent = label_id + " - " + name_el.textContent;	
	}	
}

prepend_ids_in_ship_matrix();