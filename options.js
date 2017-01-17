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
  on_page_options["auto-repair-pay-terms-url"] = document.getElementById('auto-repair-pay-terms-url').checked;
  on_page_options["auto-repair-pay-plan-url"] = document.getElementById('auto-repair-pay-plan-url').checked;
  on_page_options["auto-repair-pre-pack-url"] = document.getElementById('auto-repair-pre-pack-url').checked;
  on_page_options["auto-repair-ship-group-url"] = document.getElementById('auto-repair-ship-group-url').checked;
  on_page_options["auto-repair-ship-zone-url"] = document.getElementById('auto-repair-ship-zone-url').checked;
  on_page_options["auto-repair-prod-group-url"] = document.getElementById('auto-repair-prod-group-url').checked;
  on_page_options["auto-repair-dispute-url"] = document.getElementById('auto-repair-dispute-url').checked;
  on_page_options["auto-repair-seo-url"] = document.getElementById('auto-repair-seo-url').checked;
  on_page_options["auto-repair-canned-url"] = document.getElementById('auto-repair-canned-url').checked;
  on_page_options["auto-repair-cus-doc-url"] = document.getElementById('auto-repair-cus-doc-url').checked;
  on_page_options["auto-repair-doc-temp-set-url"] = document.getElementById('auto-repair-doc-temp-set-url').checked;
  on_page_options["auto-repair-imp-exp-url"] = document.getElementById('auto-repair-imp-exp-url').checked;
  on_page_options["auto-repair-cus-conf-url"] = document.getElementById('auto-repair-cus-conf-url').checked;
  on_page_options["prepend-view-order-method-ids"] = document.getElementById('prepend-view-order-method-ids').checked;
		
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
			document.getElementById('auto-repair-pay-terms-url').checked = stored_options["auto-repair-pay-terms-url"];
			document.getElementById('auto-repair-pay-plan-url').checked = stored_options["auto-repair-pay-plan-url"];
			document.getElementById('auto-repair-pre-pack-url').checked = stored_options["auto-repair-pre-pack-url"];
			document.getElementById('auto-repair-ship-group-url').checked = stored_options["auto-repair-ship-group-url"];
			document.getElementById('auto-repair-ship-zone-url').checked = stored_options["auto-repair-ship-zone-url"];
			document.getElementById('auto-repair-prod-group-url').checked = stored_options["auto-repair-prod-group-url"];
			document.getElementById('auto-repair-dispute-url').checked = stored_options["auto-repair-dispute-url"];
			document.getElementById('auto-repair-seo-url').checked = stored_options["auto-repair-seo-url"];
			document.getElementById('auto-repair-canned-url').checked = stored_options["auto-repair-canned-url"];
			document.getElementById('auto-repair-cus-doc-url').checked = stored_options["auto-repair-cus-doc-url"];
			document.getElementById('auto-repair-doc-temp-set-url').checked = stored_options["auto-repair-doc-temp-set-url"];
			document.getElementById('auto-repair-imp-exp-url').checked = stored_options["auto-repair-imp-exp-url"];
			document.getElementById('auto-repair-cus-conf-url').checked = stored_options["auto-repair-cus-conf-url"];
	});
}

document.addEventListener('DOMContentLoaded', load_options);
document.getElementById('save').addEventListener('click', function() {save_options()});