// Saves options to chrome.storage
function save_options() {
		var on_page_options ={};
  on_page_options["auto-filter-page-url"] = document.getElementById('auto-filter-page-url').checked;
  chrome.storage.sync.set(on_page_options, function() {
    // Update status to let user know options were saved.
    var save_btn = document.getElementById('save');
    save_btn.textContent = 'Saving...';
    setTimeout(function() {
      document.getElementById('save').textContent = 'Options Saved';
						setTimeout(function() {
							document.getElementById('save').textContent = 'Save';
						}, 750);
    }, 750);
  });
}

// Load options from extension onto page
function load_options() {
	chrome.storage.sync.get(null, function(stored_options) {
			document.getElementById('auto-filter-page-url').checked = stored_options["auto-filter-page-url"];
	});
}

document.addEventListener('DOMContentLoaded', load_options);
document.getElementById('save').addEventListener('click', function() {save_options()});