contextController.displayParentFields = function() {
	var hidden_fields = document.getElementsByClassName("cp-hide-inparent");
	var num_hidden_fields = hidden_fields.length;
	
	
	for (var hfi = 0; hfi < hidden_fields.length;) {
		hidden_fields[0].className = hidden_fields[0].className.replace("cp-hide-inparent","");
	}
}