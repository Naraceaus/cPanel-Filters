// Saves options to chrome.storage
function save_options() {
		var on_page_options ={};
  on_page_options["auto-filter-page-url"] = document.getElementById('auto-filter-page-url').checked;
  on_page_options["auto-repair-order-url"] = document.getElementById('auto-repair-order-url').checked;
  on_page_options["auto-repair-adv-conf-url"] = document.getElementById('auto-repair-adv-conf-url').checked;
  on_page_options["auto-repair-coupon-url"] = document.getElementById('auto-repair-coupon-url').checked;
  on_page_options["auto-repair-refund-url"] = document.getElementById('auto-repair-refund-url').checked;
  on_page_options["auto-repair-ship-rates-url"] = document.getElementById('auto-repair-ship-rates-url').checked;
  on_page_options["auto-repair-ship-methods-url"] = document.getElementById('auto-repair-ship-methods-url').checked;
		
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
			document.getElementById('auto-filter-page-url').checked = stored_options["auto-filter-page-url"];
			document.getElementById('auto-repair-order-url').checked = stored_options["auto-repair-order-url"];
			document.getElementById('auto-repair-adv-conf-url').checked = stored_options["auto-repair-adv-conf-url"];
			document.getElementById('auto-repair-coupon-url').checked = stored_options["auto-repair-coupon-url"];
			document.getElementById('auto-repair-refund-url').checked = stored_options["auto-repair-refund-url"];
			document.getElementById('auto-repair-ship-rates-url').checked = stored_options["auto-repair-ship-rates-url"];
			document.getElementById('auto-repair-ship-methods-url').checked = stored_options["auto-repair-ship-methods-url"];
	});
}

document.addEventListener('DOMContentLoaded', load_options);
document.getElementById('save').addEventListener('click', function() {save_options()});