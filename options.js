var option_elements = document.querySelectorAll("input, select");

// Saves options to chrome.storage
function save_options() {
		var on_page_options ={};
		
		for (var oei = 0; oei < option_elements.length; oei++) {
			var option_elem = option_elements[oei];
			var option_key = option_elem.id;
			switch(option_elem.type) {
				case "checkbox":
					on_page_options[option_key] = option_elem.checked;
					break;
				case "text":
				default:
					on_page_options[option_key] = option_elem.value;
					break;
			}
		}
			
		// Update status to let user know options were saved.
		var save_btn = document.getElementById('save');
		save_btn.textContent = 'Saving...';
  chrome.storage.sync.set(on_page_options, function() {
			document.getElementById('save').textContent = 'Options Saved';
			setTimeout(function() {
				document.getElementById('save').textContent = 'Save';
			}, 750);
  });
}

// Load options from extension onto page
function load_options() {
	chrome.storage.sync.get(null, function(stored_options) {
		console.log();
		for (var oei = 0; oei < option_elements.length; oei++) {
			var option_elem = option_elements[oei];
			var option_val = stored_options[option_elem.id];
			console.log(option_elem, option_val);
			if (option_val != null) {
				switch(option_elem.type) {
					case "checkbox":
						option_elem.checked = option_val;
						break;
					case "text":
					default:
						option_elem.value = option_val;
						break;
				} 
			}
		}
		
	});
}

document.addEventListener('DOMContentLoaded', load_options);
document.getElementById('save').addEventListener('click', function() {save_options()});