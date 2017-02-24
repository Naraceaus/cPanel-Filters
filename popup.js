document.addEventListener( "DOMContentLoaded", function() {
	
	
	//setup listener in case popup left open when results returned
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if (request.target=="popup") {
			process_message(request, sender, sendResponse);
		}
	});
	
	document.getElementById("refresh-filter").addEventListener("click", function () {
		get_filter_url();
	});
	
	document.getElementById("highlight-adverts").addEventListener("click", function () {
		highlight_ads();
	});
	
	document.getElementById("de-highlight-adverts").addEventListener("click", function () {
		de_highlight_ads();
	});
	
	document.getElementById("purge-cache").addEventListener("click", function () {
		purge_server_cache();
	});
	
	document.getElementById("heavily-purge-cache").addEventListener("click", function () {
		heavily_purge_server_cache();
	});
	
	document.getElementById("display-parent-fields").addEventListener("click", function () {
		display_parent_fields();
	});
	
	document.getElementById("generate-zone-links").addEventListener("click", function () {
		generate_zone_links();
	});
	
	document.getElementById("mark-orderlines-for-shipping").addEventListener("click", function () {
		mark_orderlines_for_shipping();
	});
	
	document.getElementById("add-sh-cat-to-methods").addEventListener("click", function () {
		add_sh_cat_to_methods();
	});
	
	document.getElementById("prepend-ship-ser-id").addEventListener("click", function () {
		prepend_ship_ser_id();
	});
	
	document.getElementById("gen-animal-binary").addEventListener("click", function () {
		document.getElementById("console").value = convert_num_to_emoji(document.getElementById("console").value);
	});
	
	document.getElementById("add-all-export-fields").addEventListener("click", function () {
		add_all_export_fields();
	});
	
	document.getElementById('options-link').addEventListener("click", function() {
  if (chrome.runtime.openOptionsPage) {
    // New way to open options pages, if supported (Chrome 42+).
    chrome.runtime.openOptionsPage();
  } else {
    // Reasonable fallback.
    window.open(chrome.runtime.getURL('options.html'));
  }
	});
	
	var group_btns = document.querySelectorAll("[data-group-button]");
	for (var gb_i = 0; gb_i < group_btns.length; gb_i++) {
		group_btns[gb_i].addEventListener("click", bind_group_select());
	}
	
	get_filter_url();
	
	get_page_info();
	document.getElementById("page-info-refresh").addEventListener("click", function() {
		get_page_info();
	});
	
	//display version of extension
	document.getElementById("version-number").innerText = " "+chrome.runtime.getManifest().version;
});

function process_message(request, sender, sendResponse) {
 //interpret modifications
 console.log(request.title);

 switch (request.title) {
		case "cache-purge":
		case "ajax-result":
   update_results(request.status);
			break;
		case "page-info":
			print_page_info(request.page_details)
			break;
		case "page-info-item":
			update_page_info(request)
			break;

			default:
 }
}

function get_page_info() {
	document.getElementById("page-info-load-icon").className = document.getElementById("page-info-load-icon").className.replace("fa-check","fa-spinner")+" fa-spin";
	document.getElementById("page-info-load-text").innerHTML = "Page Information Is Loading";
	//document.getElementById("page-info").style.filter = "blur(5px)";
	
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		console.log("tell "+tabs[0].id+" I want filter URL");
		chrome.tabs.sendMessage(tabs[0].id, {title: "get-page-info"}, function(response) {});  
	});
}

function print_page_info(info) {
	document.getElementById("page-info-load-icon").className = document.getElementById("page-info-load-icon").className.replace("fa-spinner","fa-check").replace(/ *fa-spin/g,"");
	document.getElementById("page-info-load-text").innerHTML = "Page Information";
	document.getElementById("page-info").innerHTML = info;
	document.getElementById("page-info").style.filter = "blur(0)";
}

function update_page_info(request) {
	console.log(request);
	switch (request.name) {
		case "act-page-url":
		case "cpanel-link":
			update_info_link(request.name, request.value);
			break;
		
		case "page-type":
		case "page-subtype":
		case "default-theme":
		case "active-theme":
			update_info_text(request.name, request.value);
			break;
			
		case "is-neto":
		case "logged-in":
		case "page-info-load-icon":
			update_info_bool(request.name, request.value);
			break;

	}
	
	if (request.show_load == false) {
		document.getElementById(request.name).className = document.getElementById(request.name).className.replace(/[ ]*fa-spin/,"").replace(/[ ]*fa-spinner/,"");
	} else if (request.show_load == true) {
		document.getElementById(request.name).className = document.getElementById(request.name).className.replace(/[ ]*fa-spin/,"").replace(/[ ]*fa-spinner/,"");
		document.getElementById(request.name).className = document.getElementById(request.name).className + " fa-spin fa-spinner";
	}
	if (request.hide == true) {
		document.getElementById(request.name).style.display="none";
		document.getElementById(request.name+"-label").style.display="none";
	} else if (request.hide == false) {
		document.getElementById(request.name).style.display="initial";
		document.getElementById(request.name+"-label").style.display="initial";
	}
}

function update_info_link(id, value) {
	if (value!="" && value!=null) {
		document.getElementById(id).href = value;
		document.getElementById(id).innerHTML = value;
	} else {
		document.getElementById(id).href = "";
		document.getElementById(id).innerHTML = "n.a.";
	}
}

function update_info_text(id, value) {
	document.getElementById(id).innerHTML = value;
}

function update_info_bool(id, value) {
	if (value == true) {
		document.getElementById(id).className = document.getElementById(id).className.replace(/[ ]*fa-[a-zA-z]*/g,"");
		document.getElementById(id).className = document.getElementById(id).className + " fa-check fa-fw";
	} else if (value == false) {
		document.getElementById(id).className = document.getElementById(id).className.replace(/[ ]*fa-[a-zA-z]*/g,"");
		document.getElementById(id).className = document.getElementById(id).className + " fa-times fa-fw";
	}
}

function get_filter_url() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
				console.log("tell "+tabs[0].id+" I want filter URL");
    chrome.tabs.sendMessage(tabs[0].id, {title: "get-filter-url"}, function(response) {print_filter_url(response);});  
	});
}

function print_filter_url(response) {
	if (response!=null) {
		update_results(response.filter_url);
	} else {
		update_results("Error: Please refresh the active tab");
	}
}

function print_found_cpanel_url(response) {
	if (response!=null) {
		chrome.tabs.create({url:response.cpanel_url,selected:true}, function (tab) {
					update_results(response.cpanel_url);
		});
	} else {
		document.getElementsByName("filter-url")[0].value="Error: Please refresh the active tab";
	}
}

function highlight_ads() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		console.log("tell "+tabs[0].id+" I want to highlight adverts");
		chrome.tabs.sendMessage(tabs[0].id, {title: "highlight-adverts"}, function(response) {print_placed_highlights(response)});  
	});
}

function de_highlight_ads() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		console.log("tell "+tabs[0].id+" I want to de highlight adverts");
		chrome.tabs.sendMessage(tabs[0].id, {title: "de-highlight-adverts"}, function(response) {print_removed_highlights(response)});  
	});
}

function print_placed_highlights(response) {
	if (response!=null) {
		update_results("Placed "+response.num_ads_found+" advert highlights");
	} else {
		document.getElementsByName("filter-url")[0].value="Error: Please refresh the active tab";
	}
}

function print_removed_highlights(response) {
	if (response!=null) {
		update_results("Removed "+response.num_ads_removed+" advert highlights");
	} else {
		document.getElementsByName("filter-url")[0].value="Error: Please refresh the active tab";
	}
}

function purge_server_cache() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		console.log("tell "+tabs[0].id+" I want to purge the server cache");
		chrome.tabs.sendMessage(tabs[0].id, {title: "purge-server-cache"}, function(response) {update_results(response.status)});  
	});
}

function heavily_purge_server_cache() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		console.log("tell "+tabs[0].id+" I want to HEAVILY purge the server cache");
		chrome.tabs.sendMessage(tabs[0].id, {title: "heavily-purge-server-cache"}, function(response) {update_results(response.status)});  
	});
}

function display_parent_fields() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		console.log("tell "+tabs[0].id+" I want parent fields made visible");
		chrome.tabs.sendMessage(tabs[0].id, {title: "display-parent-fields"}, function(response) {update_results(response.status)});  
	});
}

function generate_zone_links() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		console.log("tell "+tabs[0].id+" I want to generate zone links");
		chrome.tabs.sendMessage(tabs[0].id, {title: "generate-zone-links"}, function(response) {update_results(response.status)});  
	});
}

function mark_orderlines_for_shipping() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		console.log("tell "+tabs[0].id+" I want to mark orderlines for shipping");
		chrome.tabs.sendMessage(tabs[0].id, {title: "mark-orderlines-for-shipping"}, function(response) {update_results(response.status)});  
	});
}

function add_sh_cat_to_methods() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		console.log("tell "+tabs[0].id+" I want to categories to shipping methods");
		chrome.tabs.sendMessage(tabs[0].id, {title: "add-sh-cat-to-methods"}, function(response) {update_results(response.status)});  
	});
}

function prepend_ship_ser_id() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		console.log("tell "+tabs[0].id+" I want to prepend ids to shipping services");
		chrome.tabs.sendMessage(tabs[0].id, {title: "prepend-ship-ser-id"}, function(response) {update_results(response.status)});  
	});
}

function add_all_export_fields() {
	update_results("Adding eport fields, the page may become unresponive for a brief period");
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		console.log("tell "+tabs[0].id+" to add all the export fields to the export wizard");
		chrome.tabs.sendMessage(tabs[0].id, {title: "add-all-export-fields"}, function(response) {update_results(response.status)});  
	});
}

function update_results(result) {
	document.getElementsByName("filter-url")[0].value=result;
}

function bind_group_select() {
	return function() {
		// what group was clicked
		var btn_group = this.getAttribute("data-group-button");
		
		//unactivate all the menu buttons
		var all_btns = document.querySelectorAll("[data-group-button]");
		for (var ab_i = 0; ab_i < all_btns.length; ab_i++) {
			all_btns[ab_i].className=all_btns[ab_i].className.replace(/[\b ]active\b/g,"");
		}
		
		//actiate the clicked menu button
		this.className+=" active";
		
		//hide all functinoal mbuttons
		var all_btns = document.querySelectorAll("[data-group]");
		for (var ab_i = 0; ab_i < all_btns.length; ab_i++) {
			all_btns[ab_i].style.display="none";
		}

		// dislay all functional buttons in appropriate group
		var vis_btns = document.querySelectorAll("[data-group~='"+btn_group+"']");
		for (var vb_i = 0; vb_i < vis_btns.length; vb_i++) {
			vis_btns[vb_i].style.display="block";
		}
	}
}


//dumb silly things
function convert_num_to_emoji(input){
	var output="";
	var split_input = input.split(/(\d+)/);
	for (var si = 0; si < split_input.length; si++) {
		output+=gen_binary_emoji(split_input[si]);
	}
	return output;
}


function gen_binary_emoji(input) {
	var emoji_ones = [
		'sheep',
		'bird',
		'tiger',
		'octopus',
		'blowfish',
		'beetle',
		'dromedary_camel',
		'wolf',
		'snail',
		'ram',
		'boar',
		'cow',
		'cow2',
		'tropical_fish',
		'cat',
		'cat2',
		'scorpion',
		'horse'
	]

	number = parseInt(input);
	if (isNaN(number)) {
		return input;
		} else {
		var num_bin = number.toString(2);
		num_emj = "";
		for (char=0; char<num_bin.length; char++) {
			if (num_bin[char] == '0') {
				num_emj+=":rainbowsheep:"
			} else {
				num_emj+=":"+emoji_ones[Math.floor((Math.random() * emoji_ones.length))]+":"
			}
		}
		return num_emj;
	}
}