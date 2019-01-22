contextController.toggleShippingMethods = function(input) {
	var hide_class="";
	if (input.state=='hide') {
		hide_class="hidden";
	}
	[...document.querySelectorAll(".shm-method-info-pl span")].filter(a => a.textContent == "- Inactive").map(a => a.closest('tr')).forEach(a => a.className = hide_class);
}