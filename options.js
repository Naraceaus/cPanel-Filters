//set default options
var on_page_options = {
	"auto-filter-page-url":true,
	auto_filter_page_url:true
};

// Saves options to chrome.storage
function save_options() {
  on_page_options["auto-filter-page-url"] = document.getElementById('auto-filter-page-url').checked;
  on_page_options.auto_filter_page_url = document.getElementById('auto-filter-page-url').checked;
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

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function load_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get(on_page_options, function(stored_options) {
    document.getElementById('auto-filter-page-url').checked = stored_options["auto-filter-page-url"];
  });
}
document.addEventListener('DOMContentLoaded', load_options);
document.getElementById('save').addEventListener('click', function() {save_options()});