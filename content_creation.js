
var task_bar_narrow = "20px";
var task_bar_expanded = "324px";

function create_element(type, attributes, style) {
	// make saure style and attributes are actually objects
	if (style==null || typeof(style) != "object") {
		style={};
	}
	if (attributes==null || typeof(attributes) != "object") {
		attributes={};
	}
	
	//set default values if not specified (helps prevent in page styling affecting the popup
	var def_styles = {
		fontSize:"14px",
		color:"black",
		padding:"initial",
		margin:"initial",
		fontFamily:"arial",
		borderRadius:"initial"
	}
	var def_style_keys = Object.keys(def_styles);
	for (var dsi = 0; dsi < def_style_keys.length; dsi++) {
		if (style[def_style_keys[dsi]] == null) {
			style[def_style_keys[dsi]] = def_styles[def_style_keys[dsi]];
		}
		
	}
	
	var new_element = document.createElement(type);
	var att_keys = Object.keys(attributes);
	for (var ati = 0; ati < att_keys.length; ati++) {
		var att_name = att_keys[ati];
		var att_value = attributes[att_keys[ati]];
		
		new_element[att_name] = att_value;
	}
	
	apply_styles(new_element, style);
		
	return new_element;
}


function apply_styles(element, style, store_ident) {
	
	var style_keys = Object.keys(style);
	for (var si = 0; si < style_keys.length; si++) {
		var style_name = style_keys[si];
		var style_value = style[style_keys[si]];
		
		element.style[style_name] = style_value;
		if (store_ident != "" && store_ident != null) {
			window.localStorage.setItem(store_ident+"_"+style_name, style_value);
		}
		
	}
}

function loadStyleFromLocal(element, store_ident, style_arr, ignore_blank) {
	for (var si = 0; si < style_arr.length; si++) {
		var style = style_arr[si];
		var style_value = window.localStorage.getItem(store_ident+"_"+style);
		if (ignore_blank != true || (style_value != null && style_value != "")) {
			element.style[style] = style_value;
		}
	}
	
}

function create_select(option_values, option_text, selected_value, attributes, style) {
	if (option_text == null) {
		option_text = option_values;
	}
	var sel_elem = create_element("select", attributes, style);
	for (oi = 0; oi < option_values.length; oi++) {
		var opt_val = option_values[oi]
		var opt_text = option_text[oi] != null ? option_text[oi] : option_values[oi];
		
		var opt_elem =  create_element("option", {
			value:opt_val,
			innerText:opt_text
		})
		
		if (opt_val == selected_value) {
			opt_elem.selected = true;
			opt_elem.innerText = opt_text + "(current)";
		}
		
		sel_elem.appendChild(opt_elem);
	}
	
	return sel_elem;
}

// create in window dialog
function create_dialog_window() {
	
	
	//making the hover minisme work
	//add css rules based on a class being set which will be toggled on and off by button
	var hover_styles = document.createElement('style');
	// Append style element to head
	document.head.appendChild(hover_styles);

	hover_styles.sheet.insertRule("#cPanel_checker_dialogue.snap-left {left:0px !important; justify-content:flex-start !important}",0);
	hover_styles.sheet.insertRule("#cPanel_checker_dialogue.snap-top {top:0px !important; justify-content:flex-start !important}",0);
	hover_styles.sheet.insertRule("#cPanel_checker_dialogue.snap-right {right:0px !important; justify-content:flex-end !important}",0);
	hover_styles.sheet.insertRule("#cPanel_checker_dialogue.snap-bottom {bottom:0px !important; justify-content:flex-end !important}",0);

	hover_styles.sheet.insertRule("#cPanel_checker_dialogue.snap-left #ch_resize,#cPanel_checker_dialogue.snap-right #ch_resize {min-width:"+task_bar_narrow+" !important;min-height:324px !important;}",0);
	hover_styles.sheet.insertRule("#cPanel_checker_dialogue.snap-top #ch_resize,#cPanel_checker_dialogue.snap-bottom #ch_resize {min-height:"+task_bar_narrow+" !important;}",0);

	// min height for left and right snap

	hover_styles.sheet.insertRule("#cPanel_checker_dialogue.auto-minimize.snap-left,#cPanel_checker_dialogue.auto-minimize.snap-right {width:"+task_bar_narrow+" !important;}",0);
	hover_styles.sheet.insertRule("#cPanel_checker_dialogue.auto-minimize.snap-left:hover,#cPanel_checker_dialogue.auto-minimize.snap-right:hover {width:420px !important}",0);
	hover_styles.sheet.insertRule("#cPanel_checker_dialogue.auto-minimize.snap-top,#cPanel_checker_dialogue.auto-minimize.snap-bottom {max-height:"+task_bar_narrow+" !important;}",0);
	hover_styles.sheet.insertRule("#cPanel_checker_dialogue.auto-minimize.snap-top:hover,#cPanel_checker_dialogue.auto-minimize.snap-bottom:hover {height:auto !important;max-height:600px !important;}",0);

	
    hover_styles.sheet.insertRule(`
		 #cPanel_checker_dialogue .tooltip {
			opacity: 1;  
			position:relative;
			white-space:initial;
			bottom:initial;
			left: initial;
			background:initial;
			color:initial;
			padding:initial;
			line-height:initial;
			height:initial;
			opacity:initial;  
			transition:initial; 	
		}
	`,0);
	//styling to make tooltips work+
	hover_styles.sheet.insertRule(`
		#cPanel_checker_dialogue .tooltip::before {
			content: attr(data-tip);
			font-size: 10px;
			position:absolute;
			z-index: 1000001;
			white-space:normal;
			bottom:9999px;
			left: 0px;
			background:#000;
			color:#e0e0e0;
			padding:7px 7px;
			opacity: 0;  
			transition:opacity 0.4s ease-out; 						
		}
	`,0);
    hover_styles.sheet.insertRule(`
		#cPanel_checker_dialogue .tooltip:hover::before {
			opacity: 1;
			bottom:35px;					
		}
	`,0);
	
	
	// snap flex directions
	hover_styles.sheet.insertRule(`
		#cPanel_checker_dialogue.snap-top, #cPanel_checker_dialogue.snap-bottom {
			flex-direction:column;					
		}
	`,0);
	hover_styles.sheet.insertRule(`
		#cPanel_checker_dialogue.snap-left, #cPanel_checker_dialogue.snap-right {
			flex-direction:row;					
		}
	`,0);
	hover_styles.sheet.insertRule(`
		#cPanel_checker_dialogue.snap-top #ch_resize, #cPanel_checker_dialogue.snap-bottom #ch_resize {
			flex-direction:row;					
		}
	`,0);
	hover_styles.sheet.insertRule(`
		#cPanel_checker_dialogue.snap-left #ch_resize, #cPanel_checker_dialogue.snap-right #ch_resize {
			flex-direction:column;					
		}
	`,0);
	
	var dialog = create_element("div",
		{
			id:"cPanel_checker_dialogue",
			className:"snap-right auto-minimize"
		},
		{
				position:"fixed",
				//right:"0px",
				top:"25%",
				width:"420px",
				transition:"width 0.3s, max-height 0.3s",
				transitionTimingFunction:"linear",
				overflow:"hidden",
				background:"#1599ca",
				display:"flex",
				//flexDirection:"row",
				zIndex:"1000001"
		}
	)
		
	// main content
	var items_container = create_element("div", 
		{
			id: "ch_items_cont"
		},
		{
			width:"400px",
			background:"#1599ca",
			
			display:"flex",
			flexDirection:"column"
		}
	);
	dialog.appendChild(items_container);
	
	
	//task bar (for dragging/hiding)
	var task_bar = create_element("div", 
		{
			id: "ch_resize"

		},
		{
			width:task_bar_narrow,
			background:"#1599ca",
			
			display:"flex",
			//flexDirection:"column",
			justifyContent:"space-around"
		}
	)
	dialog.appendChild(task_bar);
	
	var remove_dialog_btn = create_element("div", 
		{
			id: "rem_dialog_btn"

		},
		{
			height:"100%",	
			width:"100%",	
			background:"red"
		}
	)
	
	remove_dialog_btn.addEventListener("click", removeMainPanel);
	
	task_bar.appendChild(remove_dialog_btn);
	
	var min_dialog_btn  = create_element("div", 
		{
			id: "min_dialog_btn"

		},
		{
			height:"100%",	
			width:"100%",
			background:"aqua"
		}
	)
	min_dialog_btn.addEventListener("click", toggleMinimize);

	task_bar.appendChild(min_dialog_btn);
	
	var drag_dialog_btn = create_element("div", 
		{
			id: "drag_dialog_btn"

		},
		{
			height:"100%",	
			width:"100%",	
			cursor:"move",
			zIndex:"1000001",
			background:"lavender"
		}
	)

	dragMainPanel(drag_dialog_btn);
	
	task_bar.appendChild(drag_dialog_btn);

	document.documentElement.appendChild(dialog);
		
	// positioning task bar and dialog window based on last drag
	loadStyleFromLocal(dialog, "NH_main_pos", ["top", "left", "bottom","right"], true);
	var local_snap_to = window.localStorage.getItem("NH_main_pos_snapTo");
		
	if (local_snap_to != null && local_snap_to!= "") {
		dialog.className = dialog.className.replace(/(left|top|right|bottom)/g, local_snap_to);
		shiftTaskBar(local_snap_to);
	}
	
	// auto minimise the dialog box depending on aut mimisnse settings qand possibly per domain settings
	chrome.storage.sync.get(["minimise-tracking","helper-minimised"], function(stored_options) {
		switch(stored_options["minimise-tracking"]) {
			case "globally":
				toggleMinimize(stored_options["helper-minimised"]);
				break;
			case "per-site":
				toggleMinimize(window.localStorage.getItem("helper-minimised")=="true");
				break;
			case "none":
				toggleMinimize(false);
				break;
		} 
	});
}

//purge cache buttons
function create_purge_panel() {
	var purge_panel = create_element("div", 
		{
			id: "ch_purge_panel"
		},
		{
			width:"100%",
			background:"#1599ca"
		}
	);

	var heavy_cont = create_element("div", 
		{
			innerText: "Heavily: "
		},
		{
			width:"50%",
			float:"left",
			textAlign:"center"
		}
	);
	
	purge_panel.appendChild(heavy_cont);
	
	var heavy_chk = create_element("input", 
		{
			id: "heavy_purge",
			type: "checkbox"
		}
	);
	
	get_check_box_checked("heavy_purge");
	heavy_chk.addEventListener("click", store_check_box_checked);
	
	heavy_cont.appendChild(heavy_chk);
	
	var refresh_cont = create_element("div", 
		{
			innerText:"Refresh:"
		},
		{
			width:"50%",
			float:"left",
			textAlign:"center"
		}
	);

	purge_panel.appendChild(refresh_cont);
	
	var refresh_chk = create_element("input", 
		{
			id:"refresh_purge",
			type: "checkbox"
		}
	);
	
	get_check_box_checked("refresh_purge");
	refresh_chk.addEventListener("click", store_check_box_checked);
	
	refresh_cont.appendChild(refresh_chk);
	
	var purge_btn = create_element("button", 
		{
			id:"purge_btn",
			innerText: "Purge"
		},
		{
			width:"100%",
			textAlign:"center"
		}
	);

	purge_btn.addEventListener("click", start_server_purge);
	
	purge_panel.appendChild(purge_btn);

	
	document.querySelector("#ch_items_cont").appendChild(purge_panel);
}

function create_context_panel() {
	
	var context_cont = create_element("div", 
		{
			id:"context_panel"
		},
		{
			width:"100%"
		}
	);
	
	var context_heading = create_element("div", 
		{
			id:"context_heading",
			innerText:"Page Specific Functions"
		},
		{
			width:"100%",
			textAlign:"center"
			
		}
	);
	
	context_cont.appendChild(context_heading);
	
	if (window.location.pathname == "/_cpanel/products/view" && document.querySelector("span[title='Parent Product']") != null) {
		context_cont.appendChild(create_context_buttons("display_parent_fields", "This is a parent product. Click the below button to display fields normally hidden from parent products",display_parent_fields,"Display Hidden Fields"));
	} else if (window.location.pathname == "/_cpanel/shippingcostmgr/view") {
		context_cont.appendChild(create_context_buttons("add_zone_links", "See those zones down the bottom of the page. If want to open them the quick way click the button below first",generate_zone_links,"Add Links To Zones In Rates"));
	} else if (window.location.pathname == "/_cpanel/shippinggroup/view") {
		context_cont.appendChild(create_context_buttons("add_ship_cat", "Tired of adding shipping categories to methods one at a time? Click the button below to add them all",add_sh_cat_to_methods,"Add Shipping Categories To Method"));
	} else if (document.querySelector("[href='javascript:freeorder();']")!=null && document.querySelector("[id^='line-_rshq0']")!=null) {
		context_cont.appendChild(create_context_buttons("ship_orderlines", "Marking already dispatched orders for shipping can be a pain. Button below should speed it up a little",mark_orderlines_for_shipping,"Mark Orderlines For Shipping"));
	} else if (document.querySelector('[href^="javascript:proExport(\'Filter\')"]')!=null) {
		context_cont.appendChild(create_context_buttons("add_all_export", "Did a customer ask for all the export fields? This button will add almost all of them (The ones it doesn't you don't need). Caution your computer might freeze up a little doing this. If you have somthing going on in another tab maybe finish that first",add_all_export_fields,"Add (Almost) All Export Fields"));
	} else if ((window.location.pathname=="/_cpanel/dsimport/view" || window.location.pathname=="/_cpanel/dsexport/view" || /item=dsexport/.test(window.location.search) || /item=dsimport/.test(window.location.search)) && /id=\d+/.test(window.location.search)) {
		//TODO this check need to be fixed for when export/imports are saved
		context_cont.appendChild(create_context_buttons("export_find_replace", "Using the button below you can grab all find and replace entries used in the template in csv format",get_import_find_replace,"Get Import/Export Find And Replace"));
	}
	
	document.querySelector("#ch_items_cont").appendChild(context_cont);
}

function create_context_buttons(context_id, description, btn_function, btn_title) {
	var cont_el = create_element("div", {
		id:context_id
	});
	
	var desc_el = create_element("div", {
		className:"description",
		innerText:description
	});
	
	var btn_el = create_element("button", {
		className:"context_btn",
		innerText:btn_title
	});

	btn_el.addEventListener("click", btn_function);
	
	cont_el.appendChild(desc_el);
	cont_el.appendChild(btn_el);
	
	return cont_el;
}

function create_stuck_ebay_popup(){
	var existing_popups = document.querySelectorAll("[id='stuck_ebay_proc_notify']");
	for (var pop_i = 0; pop_i < existing_popups.length; pop_i++) {
		var pop_elem = e_pop = existing_popups[pop_i];
		e_pop.parentElement.removeChild(e_pop);
	}
	var new_popup = document.createElement("div");
	new_popup.id = "stuck_ebay_proc_notify";
	new_popup.style.width="100%";
	
	
	var message_text = document.createElement("span");
	message_text.id = "stuck_ebay_message";
	message_text.innerHTML = "It looks like this site has a stuck eBay process. You should take a look at <a href='https://www.neto.com.au/docs/ebay/troubleshooting-ebay/troubleshooting-orders-and-revisions/'>here</a>. Or just click the button below.";
	message_text.style.width="100%";
	message_text.style.float="left";
	message_text.style.marginBottom="10px";
	
	var reset_button = document.createElement("button");
	reset_button.id = "reset_ebay_batch_btn";
	reset_button.innerText = "Reset eBay Batch Process";
	reset_button.style.width="100%";
	reset_button.style.float="left";
	reset_button.style.marginBottom="10px";
	reset_button.style.padding="6px";
	
	reset_button.addEventListener("click", function() {
			make_ajax_request("/_cpanel/ebprocmgr?_ftr_status=Running","", function(ajax_response) {check_eBay_process(ajax_response, true)},null,true);
	})
	
	var output_text = document.createElement("span");
	output_text.id = "stuck_ebay_output";
	output_text.innerText = "Ready";
	output_text.style.width="100%";
	output_text.style.float="left";
	output_text.style.align="center";
	
	new_popup.appendChild(message_text);
	new_popup.appendChild(reset_button);
	new_popup.appendChild(output_text);
	document.querySelector("#ch_items_cont").appendChild(new_popup);
	
}

function create_info_panel() {
	var info_panel = create_element("div", 
		{
			id:"page-info-cont"
		}
	);
	
	var info_header = create_element("div", 
		{
			id:"page-info-header",
			innerText: "Page Information"
		}
	);
	
	info_panel.appendChild(info_header);
	
	var info_header_text = create_element("span", 
		{
			id:"page-info-load-text",
			innerText: "Analysing Current Page"
		},
		{
			width:"100%",
			textAlign:"center"
		}
	);
	info_panel.appendChild(info_header_text);
		
	var info_main = create_element("div", 
		{
			id:"page-info",
		}
	);
	info_panel.appendChild(info_main);
	
	
	var page_info_sections = [
		{
			id:"page-url",
			labelText:"Page URL"
		},{
			id:"logged-in",
			labelText:"Logged In (cPanel)"
		},{
			id:"page-type",
			labelText:"Page Type"
		},{
			id:"page-subtype",
			labelText:"Page SubType"
		},{
			id:"default-theme",
			labelText:"Default Theme"
		},{
			id:"active-theme",
			labelText:"nView Theme"
		},{
			id:"cpanel-link",
			labelText:"Link To cPanel"
		}
	]
	
	for (pi = 0; pi < page_info_sections.length; pi++) {
		var pelinfo = page_info_sections[pi];
		var pi_label = create_element("div", 
			{
				id:pelinfo.id+"-label",
				innerText:pelinfo.labelText
			},
			{
				width:"25%",
				float:"left",
				height:"32px",
				whiteSpace:"nowrap",
				overflowX:"hidden"
			}
		);
		info_main.appendChild(pi_label);
		
		var pi_elem = create_element("div", 
			{
				id:pelinfo.id
			},
			{
				width:"75%",
				float:"left",
				height:"32px"
			}
		);
		info_main.appendChild(pi_elem);
		
		var pi_input = create_element("input",
			{
				id:pelinfo.id+"-value",
				value:"...",
				type:"text",
				disabled:true
			},
			{
				width:"95%"
			}
		);
		pi_elem.appendChild(pi_input);
		
	}
	document.querySelector("#ch_items_cont").appendChild(info_panel);
}

function shiftTaskBar(direction) {
	var task_bar_elem = document.querySelector("#ch_resize");
	var parent_elem = task_bar_elem.parentElement;
	if (direction == "top" || direction == "bottom") {
		task_bar_elem.style.height=task_bar_narrow;
		task_bar_elem.style.width="initial";
		//task_bar_elem.style.flexDirection = "row";
		//parent_elem.style.flexDirection = "column";
	}
	if (direction == "left" || direction == "right") {
		task_bar_elem.style.height="initial";
		task_bar_elem.style.width="task_bar_narrow";
		//task_bar_elem.style.flexDirection = "column";
		//parent_elem.style.flexDirection = "row";
	}
	//parent_elem.removeChild(task_bar_elem);
	if (direction == "top" || direction == "left") {
		parent_elem.insertBefore(task_bar_elem, parent_elem.firstChild)
	}
	if (direction == "right" || direction == "bottom") {
		parent_elem.insertBefore(task_bar_elem, null)
	}
}

//making the drag bar work
function dragMainPanel(start_elem) {
	var index_to_side = ["left", "top", "right", "bottom"]
	var main_panel;
	
	var mouse_corner_diff_x = 0;
	var mouse_corner_diff_y = 0;
	
	start_elem.onmousedown = dragMouseDown;

	function dragMouseDown(e) {
		main_panel = document.querySelector("#cPanel_checker_dialogue");
		mouse_corner_diff_x = main_panel.getBoundingClientRect().left - e.clientX;
		mouse_corner_diff_y = main_panel.getBoundingClientRect().top - e.clientY;
		panel_width = main_panel.getBoundingClientRect().width;
		panel_height = main_panel.getBoundingClientRect().height;
		
		document.onmouseup = closeDragElement;
		// call a function whenever the cursor moves:
		document.onmousemove = elementDrag;
	}

	function elementDrag(e) {
		e = e || window.event;
		e.preventDefault();
		var mouseX = e.clientX;
		var mouseY = e.clientY;
		var winWidth = window.innerWidth;
		var winHeight = window.innerHeight;
		
		var x_fraction = e.clientX/window.innerWidth;
		var y_fraction = e.clientY/window.innerHeight;
		
		// fraction distance to each edge
		var relative_distances = [x_fraction, y_fraction, 1-x_fraction, 1-y_fraction];
		
		// select the closest edge
		var snap_to = index_to_side[relative_distances.indexOf(Math.min.apply(Math, relative_distances))];
		
		shiftTaskBar(snap_to);
		
		var snap_styles = {
			left:"initial",
			top:"initial",
			right:"initial",
			bottom:"initial"
		}
				
		if (snap_to == "top" || snap_to == "bottom") {
			var left_pos = e.clientX+mouse_corner_diff_x;
			if (left_pos < 0) {
				left_pos = 0;
			}
			if (left_pos+panel_width > window.innerWidth) {
				left_pos = window.innerWidth-panel_width;
			}
			
			snap_styles.left = left_pos+"px";
		}
		if (snap_to == "left" || snap_to == "right") {
			var top_pos = e.clientY+mouse_corner_diff_y;
			if (top_pos < 0) {
				top_pos = 0;
			}
			if (top_pos+panel_height > window.innerHeight) {
				top_pos = window.innerHeight-panel_height;
			}
			snap_styles.top = top_pos+"px";
		}
		
		//snap_styles[snap_to] = "0px";
		
		main_panel.className = main_panel.className.replace(/(left|top|right|bottom)/g, snap_to);
		
		window.localStorage.setItem("NH_main_pos_snapTo", snap_to);
		
		apply_styles(main_panel, snap_styles, "NH_main_pos");
	}

	function closeDragElement() {
		/* stop moving when mouse button is released:*/
		document.onmouseup = null;
		document.onmousemove = null;
	}
}

function toggleMinimize(set_minimised) {
	var minimised=true;
	var main_panel = document.querySelector("#cPanel_checker_dialogue");
	if (main_panel.className.includes("auto-minimize") && set_minimised!=true || set_minimised==false) {
		main_panel.className = main_panel.className.replace(/ *auto-minimize/g, "");
		minimised = false;
	} else {
		main_panel.className+=" auto-minimize";
		minimised = true;
	}
	
		
	// track global minimise
	chrome.storage.sync.set({"helper-minimised":minimised}, function() {});
	// track per site minimise
	window.localStorage.setItem("helper-minimised", minimised);
}

function removeMainPanel() {
	var main_panel = document.querySelector("#cPanel_checker_dialogue");
	main_panel.parentElement.removeChild(main_panel);
	
	// track global closed
	chrome.storage.sync.set({"helper-closed":true}, function() {});
	// track per site closed
	window.localStorage.setItem("helper-closed", true);
}

//takes id of a checkbox and stores whether it is checked or not for remembering in the future
function get_check_box_checked(id) {
	var option_key = id+"_check_store";
	
	chrome.storage.sync.get(option_key, function(stored_options) {
		document.querySelector("#"+id).checked = stored_options[option_key];
	});
}

function store_check_box_checked(event) {
	var  store_opt = {};
	store_opt[this.id+"_check_store"] = this.checked
	chrome.storage.sync.set(store_opt, function() {
	});
}