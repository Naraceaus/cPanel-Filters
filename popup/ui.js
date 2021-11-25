
var helper_ui = new Vue({
	el: '#extension-wrapper',
	data: {
		sitedata: {
			domain:'',
			status:'AWAITING',
			loggedin: false,
			themes:['LOADING'],
			livetheme:'LOADING'
		},
		localpage: 'LOADING',
		taburl: '',
		purgingcache: false,
		preview: '',
		orderpage: false,
		matrixpage: false,
		parentpage: false
	},
	methods: {
		openLink: function(url) {
			if (typeof(browser) == 'undefined') {
				chrome.tabs.create({url:url});
			} else {
				browser.tabs.create({url:url});
			}
		},
		forceRefresh: function() {
			getTabLocation(function(loc) {
				sendMessage({
					type:'analyse',
					force_refresh: true,
					loc:loc
				});
			})			
		},
		purgeCache: function(heavy) {
			this.purgingcache = true;
			getTabLocation(function(loc) {
				sendMessage({
					type: 'purge_cache',
					heavy: heavy,
					loc:loc
				}, function(response) {
					this.purgingcache = false;
					console.log(response)
				});
			})	
		},
		changeTheme: function() {
			var new_theme = this.preview;
			getTabLocation(function(loc) {
				let new_query = loc.query;
				new_query.set('nview',new_theme);
				changeLocation(loc.id, "https://"+loc.domain+"/"+loc.path+"?"+new_query);
			});
		},
		checkNView: function() {
			var self = this;
			queryTabs({active: true, currentWindow: true}, function(tabs) {
				sendMessageToID(tabs[0].id, {type: "check_nview"}, function(response) {
					if (typeof(response) != "undefined") {
						self.preview = response.preview;
					}
				});
			})
		},
		checkOrderPage: function() {
			var self = this;
			queryTabs({active: true, currentWindow: true}, function(tabs) {
				sendMessageToID(tabs[0].id, {type: "check_order_page"}, function(response) {
					if (typeof(response) != "undefined") {
						self.orderpage = response.orderpage;
					}
				});
			})			
		},
		checkMatrixPage: function() {
			var self = this;
			queryTabs({active: true, currentWindow: true, url:"*://*/_cpanel/ship"}, function(tabs) {
				self.matrixpage = tabs.length > 0;
			})			
		},
		markOrderlinesForShipping: function() {
			queryTabs({active: true, currentWindow: true}, function(tabs) {
				sendMessageToID(tabs[0].id, {type: "mark_orderlines_for_shipping"});
			});			
		},
		toggleShippingMethods: function(state) {
			queryTabs({active: true, currentWindow: true}, function(tabs) {
				sendMessageToID(tabs[0].id, {type: "toggle_shipping_methods", state: state});
			});			
		},
		checkParentPage: function() {
			var self = this;
			
			queryTabs({active: true, currentWindow: true}, function(tabs) {
				sendMessageToID(tabs[0].id, {type: "check_parent_page"}, function(response) {
					if (typeof(response) != "undefined") {
						self.parentpage = response.parentpage;
					}
				});
			})			
		},
		displayHiddenParentFields: function() {
			queryTabs({active: true, currentWindow: true}, function(tabs) {
				sendMessageToID(tabs[0].id, {type: "display_hidden_parent_fields"});
			});	
		}
	},
	computed: {
		pageDirections: function () {

			// the order MATTERS
			var potential_directions = [
				[/_cpanel\/home/,url=>`Dashboard`], //Dashboard home
				
				//orders
				[/_cpanel\/order\?.*limitstatus=100(?=&|$)/,url=>`Sales Orders->Quote`], //Sales Orders->View Orders In Status
				[/_cpanel\/order\?.*limitstatus=110(?=&|$)/,url=>`Sales Orders->New`], //Sales Orders->View Orders In Status
				[/_cpanel\/order\?.*limitstatus=120(?=&|$)/,url=>`Sales Orders->On Hold`], //Sales Orders->View Orders In Status
				[/_cpanel\/order\?.*limitstatus=130(?=&|$)/,url=>`Sales Orders->New Backorder`], //Sales Orders->View Orders In Status
				[/_cpanel\/order\?.*limitstatus=140(?=&|$)/,url=>`Sales Orders->Pick`], //Sales Orders->View Orders In Status
				[/_cpanel\/order\?.*limitstatus=150(?=&|$)/,url=>`Sales Orders->Pack`], //Sales Orders->View Orders In Status
				[/_cpanel\/order\?.*limitstatus=160(?=&|$)/,url=>`Sales Orders->Pending Dispatch`], //Sales Orders->View Orders In Status
				[/_cpanel\/order\?.*limitstatus=170(?=&|$)/,url=>`Sales Orders->Dispatched`], //Sales Orders->View Orders In Status
				[/_cpanel\/order\?.*limitstatus=200(?=&|$)/,url=>`Sales Orders->Cancelled`], //Sales Orders->View Orders In Status	
				
				
				[/_cpanel\/order\/vieworder\?.*id=New.*?(?=&|$)/,url=>`Sales Orders->Add Order`], //Create New Order
				[/_cpanel\/order\/vieworder\?.*id=.*?(?=&|$)/,url=>`Sales Orders->View Orders->Set the Order ID filter to ${extractID(url)}->Hit Apply`], //View Specific Order
				[/_cpanel\/order/,url=>`Sales Orders->View Orders`], // Fallback View Orders
				
				//customers
				[/_cpanel\/customer\?.*limitprospect=n.*?(?=&|$)/,url=>`Customers->Customers`],
				[/_cpanel\/customer\?.*limitprospect=y.*?(?=&|$)/,url=>`Customers->Prospects`],
				[/_cpanel\/customer\/view\?.*id=New.*?(?=&|$)/,url=>`Customers->Add Customer`], //Create New Order
				[/_cpanel\/customer\/view\?.*id=.*?(?=&|$)/,url=>`Customers->View Customers & Prospects->Set the Username filter to ^${extractID(url)}->Hit Apply`], //View Specific Customer
				[/_cpanel\/customer/,url=>`Customers->View Customers & Prospects`], // Fallback Customers
		
				[/_cpanel\/wishlists/,url=>`Customers->Wish Lists`],
				[/_cpanel\/customer_contactlog/,url=>`Customers->Contact Log`],
				[/_cpanel\/miscfield_pricegroup\/view\?.*id=.*?(?=&|$)/,url=>`Customers->Customer Groups->Click the blue ${extractID(url)}`], //View Specific Customer Group
				[/_cpanel\/miscfield_pricegroup/,url=>`Customers->Customer Groups`],
		
		
				//products
				[/_cpanel\/products\?.*_ftr_ispar=y.*?(?=&|$)/,url=>`Products->Parent`],		
				[/_cpanel\/products\?.*_ftr_status=y.*?(?=&|$)/,url=>`Products->Active`],
				[/_cpanel\/products\?.*_ftr_status=n.*?(?=&|$)/,url=>`Products->Inactive`],
				[/_cpanel\/products\/add\?.*id=New.*?(?=&|$)/,url=>`Products->Add Product`], //Create New Product
				[/_cpanel\/products\/view\?.*id=.*?(?=&|$)/,url=>`Customers->View Products & Prospects->Set the SKU filter to INSERTSKU->Hit Apply`], //View Specific Product TODO find the sku to search for
				[/_cpanel\/products/,url=>`Products->View Products`], // Fallback Products
				//TODO product via sku
				
				//inventory
				[/_cpanel\/purchase-order\/create/,url=>`Stock Control->Add Purchase Order`],
				[/_cpanel\/stock-adjustment\/create/,url=>`Stock Control->Add Stock Adjustment`],
				[/_cpanel\/purchase-order\?.*type%5D=DRAFT.*?(?=&|$)/,url=>`Stock Control->Draft`],
				[/_cpanel\/purchase-order\?.*type%5D=PENDING.*?(?=&|$)/,url=>`Stock Control->Pending`],
				[/_cpanel\/purchase-order\?.*type%5D=SENT.*?(?=&|$)/,url=>`Stock Control->Sent`],
				[/_cpanel\/purchase-order/,url=>`Stock Control->Purchase Orders`], //Fallback purchase orders
				[/_cpanel\/stock-adjustment/,url=>`Stock Control->Stock Adjustments`],
				[/_cpanel\/stock-take\/create/,url=>`Stock Control->Stocktakes->Add stock take`],
				[/_cpanel\/stock-take/,url=>`Stock Control->Stocktakes`],
				
				[/_cpanel\/supplier\/edit\/.*/,url=>`Stock Control->Suppliers->Click the blue ${extractID(url,/(?<=_cpanel\/supplier\/edit\/).*/)}`],
				[/_cpanel\/supplier/,url=>`Stock Control->Suppliers`],
				[/_cpanel\/warehouses\/view\?.*id=.*?(?=&|$)/,url=>`Stock Control->Locations / Warehouses->Click the blue ${extractID(url)}`],
				[/_cpanel\/warehouses/,url=>`Stock Control->Locations / Warehouses`],
				
				//shipping
				[/_cpanel\/manifest\/view\?.*id=.*?(?=&|$)/,url=>`Shipping->Manifests And Consignments->Set the Manifest # filter to ^${extractID(url)}->Hit Apply`], //TODO replace with correct manifest variable
				[/_cpanel\/manifest/,url=>`Shipping->Manifests And Consignments`],
				
				[/_cpanel\/shippinggroup\/view\?.*id=.*?(?=&|$)/,url=>`Shipping->Shipping Options->Click on the method in the right column named INSERTMETHODNAME`], //TODO replace with correct method variable
				[/_cpanel\/shippingcostmgr\/view\?.*id=.*?(?=&|$)/,url=>`Shipping->Shipping Options->Click on any Service / Rates in the middle column named INSERTMETHODNAME`], //TODO replace with correct method variable
		
				
				[/_cpanel\/ship$/,url=>`Shipping->Shipping Options`],
				[/_cpanel\/shipping-options\/select/,url=>`Shipping->Shipping Options->Add New Shipping Option`],
				[/_cpanel\/shipping-options\/setup\/carrier-account-rate/,url=>`Shipping->Shipping Options->Add New Shipping Option->Set up shipping carrier based pricing`],
				[/_cpanel\/shipping-options\/create/,url=>`Shipping->Shipping Options->Add New Shipping Option->Set my own pricing`],
				[/_cpanel\/shipping-options\/setup\/free-domestic/,url=>`Shipping->Shipping Options->Add New Shipping Option->Set my own pricing->Free domestic`],
				[/_cpanel\/shipping-options\/setup\/flat-rate/,url=>`Shipping->Shipping Options->Add New Shipping Option->Set my own pricing->Flat rate`],
				[/_cpanel\/shipping-options\/setup\/fixed-per-kg/,url=>`Shipping->Shipping Options->Add New Shipping Option->Set my own pricing->Fixed per KG`],
				[/_cpanel\/shipping-options\/setup\/weight-based-price/,url=>`Shipping->Shipping Options->Add New Shipping Option->Set my own pricing->Weight or size`],
				[/_cpanel\/shipping-options\/setup\/charge-type-based-price/,url=>`Shipping->Shipping Options->Add New Shipping Option->Set my own pricing->Flat-rate per order`],
				[/_cpanel\/shipping-options\/setup\/product-based-price/,url=>`Shipping->Shipping Options->Add New Shipping Option->Set my own pricing->Flat-rate per product`],
				[/_cpanel\/shipping-options\/setup\/free-pickup/,url=>`Shipping->Shipping Options->Add New Shipping Option->Set my own pricing->Free pick-up`],
				[/_cpanel\/shipping_addons/,url=>`Shipping->Carrier Accounts`],
				[/_cpanel\/shipping\/setup/,url=>`Shipping->Sendle`],
				
				
				//marketing
				[/_cpanel\/discounts-and-coupons$/,url=>`Marketing->Discounts/Coupons`],
				[/_cpanel\/discounts-and-coupons\/edit\/.*/,url=>`Marketing->Discounts/Coupons->Click on the blue ID ${extractID(url,/(?<=_cpanel\/discounts-and-coupons\/edit\/).*/)}`],
				
				[/_cpanel\/discount-groups$/,url=>`Marketing->Discounts Groups`],
				[/_cpanel\/discount-groups\/list$/,url=>`Marketing->Discounts Groups`],
				[/_cpanel\/discount-groups\/.*\/edit/,url=>`Marketing->Discounts Groups->Click on the blue ID ${extractID(url,/(?<=_cpanel\/discount-groups\/).*(?=\/edit)/)}`],
				
				[/_cpanel\/promotion\/view\?.*id=.*?(?=&|$)/,url=>`Marketing->Pricing Promotions->Click on the blue code INSERTPROMOCODE`],
				[/_cpanel\/promotion$/,url=>`Marketing->Pricing Promotions`],	
				
				[/_cpanel\/voucherprograms\/view\?.*id=.*?(?=&|$)/,url=>`Marketing->Voucher/Reward Program->Click on the blue ID ${extractID(url)}`],
				[/_cpanel\/voucherprograms$/,url=>`Marketing->Voucher/Reward Program`],	
		
				[/_cpanel\/setup_wizard\?id=emailmarketingconfig/, url=>`Marketing->Email Marketing Setup`],
				[/_cpanel\/contact_lists$/, url=>`Marketing->Contact Lists`],
				[/_cpanel\/contact_lists\/view\?.*id=.*?(?=&|$)/,url=>`Marketing->Contact Lists->Click on the blue code ${extractID(url)}`],
				[/_cpanel\/subscribers/,url=>`Marketing->Subscribers`],
		
				//custom links
				[/_cpanel\/menus\/view\?id=100/,url=>`Custom Links->Edit Custom Links`],
				
				
				//reports
				[/_cpanel\/report_sales\?shtype=/,url=>`Reports->Sales By Order`],
				[/_cpanel\/report_sales\?shtype=cost/,url=>`Reports->Profit By Order`],
				[/_cpanel\/report_sales/,url=>`Reports->Profit By Order`],
				[/_cpanel\/report_inv_analysis/,url=>`Reports->Sales By SKU`],
				[/_cpanel\/report_monthly_sales/,url=>`Reports->Monthly Totals`],
				[/_cpanel\/report_inv_monthly/,url=>`Reports->Monthly Totals By SKU`],
				[/_cpanel\/report_sales_warehouse/,url=>`Reports->Sales by Warehouse`],
				[/_cpanel\/report_warehouse_sales_by\?salesby=sh_group/,url=>`Reports->Sales By Shipping Method`],
				[/_cpanel\/report_warehouse_sales_by\?salesby=content/,url=>`Reports->Sales By Category`],
				[/_cpanel\/report_warehouse_sales_by\?salesby=sh_serv/,url=>`Reports->Sales By Shipping Service`],
				[/_cpanel\/report_warehouse_sales_by/,url=>`Reports->Sales By Warehouse By SKU`],
				[/_cpanel\/report_sales_geo/,url=>`Reports->Sales by Suburb/Postcode/State`],
				[/_cpanel\/report_state_customer/,url=>`Reports->Customer State Sales`],
				[/_cpanel\/report_voucher_sales/,url=>`Reports->Item sales by voucher report`],
				[/_cpanel\/dispatched_orders_report/,url=>`Reports->Dispatched Orders Report`],
				[/_cpanel\/register_shifts/,url=>`Reports->Register Shifts`],
				[/_cpanel\/report_trackingexport/,url=>`Reports->Shipments Report`],
				[/_cpanel\/report_coupon_usage/,url=>`Reports->Coupon Usage`],
				[/_cpanel\/report_salescommission/,url=>`Reports->Sales Commission Report`],
				[/_cpanel\/report_review_fields/,url=>`Reports->Custom Review Fields Report`],
				[/_cpanel\/report_picker_performance/,url=>`Reports->Picker Performance Report`],
				[/_cpanel\/report_bko_history/,url=>`Reports->Backorder History`],
				[/_cpanel\/report_summary_sales/,url=>`Reports->Sales Summary`],
				[/_cpanel\/report_summary_credit/,url=>`Reports->Returns, Refunds & Credit Summary`],
				[/_cpanel\/report_account_receivable/,url=>`Reports->Aged Receivables`],
				[/_cpanel\/report_summary_tax/,url=>`Reports->Sales Summary By Tax Code`],
				[/_cpanel\/report_jitsms/,url=>`Reports->Forecast Demand`],
				[/_cpanel\/report_inv/,url=>`Reports->Stock Allocation Report`],
				[/_cpanel\/report_productnotify/,url=>`Reports->Out Of Stock Notifications`],
				[/_cpanel\/report_purchase_orders/,url=>`Reports->Restock Alerts`],
				[/_cpanel\/report-stock-valuation/,url=>`Reports->Stock Valuation Report`],
				[/_cpanel\/report-cost-analysis/,url=>`Reports->Cost Analysis Report`],
				[/_cpanel\/report_customer_orders/,url=>`Reports->Sales By Customer`],
				[/_cpanel\/report_customer_sales/,url=>`Reports->Sales By Order`],
				[/_cpanel\/report_customer_fields/,url=>`Reports->User Custom Fields`],
				[/_cpanel\/report_trans/,url=>`Reports->Transaction Log`],
				[/_cpanel\/report_warehouselogs/,url=>`Reports->Order Change Log`],
				[/_cpanel\/report_inventory_qty/,url=>`Reports->Inventory Change Log`],
				[/_cpanel\/proclog/,url=>`Reports->Batch Process Log`],
				[/_cpanel\/ebproclog/,url=>`Reports->eBay Process Log`],
				[/_cpanel\/shipping_api_logs/,url=>`Reports->Shipping API Error Log`],
				[/_cpanel\/order_failed/,url=>`Reports->Abandoned Checkout Log`],
				[/_cpanel\/report_ref_commission_log/,url=>`Reports->Referral Commission Log`],
				[/_cpanel\/staff_user_log/,url=>`Reports->Staff User Log`],
				[/_cpanel\/report_dashboard/,url=>`Reports`],
		
				//Settings & Tools
				
				
				
				
				
				[/_cpanel\/index_settings$/,url=>`Settings & Tools->All Settings & Tools`],
				[/_cpanel\/system_setup\/businessdetails$/,url=>`Settings & Tools->All Settings & Tools->Business Details`],
				[/_cpanel\/setup_wizard\?id=logosandbranding$/,url=>`Settings & Tools->All Settings & Tools->Logos & Branding`],
				[/_cpanel\/user$/,url=>`Settings & Tools->All Settings & Tools->Staff Users`],		
				[/_cpanel\/user\/view\?.*id=.*?(?=&|$)/,url=>`Settings & Tools->All Settings & Tools->Staff Users->Click on the blue username ${extractID(url)}`],
				[/_cpanel\/permission_groups$/,url=>`Settings & Tools->All Settings & Tools->Staff Permission Groups`],
				[/_cpanel\/profile$/,url=>`Settings & Tools->All Settings & Tools->Manage Account and Password`],
				[/_cpanel\/subscriptions\/payment$/,url=>`Settings & Tools->All Settings & Tools->Pay Outstanding Invoices`],
				[/_cpanel\/subscriptions$/,url=>`Settings & Tools->All Settings & Tools->Change Neto Plan`],
				[/_cpanel\/licence_info$/,url=>`Settings & Tools->All Settings & Tools->Licence Information`],
				[/_cpanel\/paymentoptions$/,url=>`Settings & Tools->All Settings & Tools->Payment Methods`],
				[/_cpanel\/setup_wizard\?id=currencytaxsettings$/,url=>`Settings & Tools->All Settings & Tools->Currency & Tax Settings`],
				[/_cpanel\/custerms$/,url=>`Settings & Tools->All Settings & Tools->Payment Terms`],
				[/_cpanel\/orderplan$/,url=>`Settings & Tools->All Settings & Tools->Payment & Order Plans`],
				[/_cpanel\/paymentoptions\/paymentreminder$/,url=>`Settings & Tools->All Settings & Tools->Payment Reminders`],
				[/_cpanel\/usercc$/,url=>`Settings & Tools->All Settings & Tools->Stored Credit Cards`],
				[/_cpanel\/country$/,url=>`Settings & Tools->All Settings & Tools->Available Countries`],
				[/_cpanel\/ship_carrier$/,url=>`Settings & Tools->All Settings & Tools->Carriers & Labels`],
				[/_cpanel\/ship_carrier\/view\?.*id=.*?(?=&|$)/,url=>`Settings & Tools->All Settings & Tools->Carriers & Labels->Click on the blue ID ${extractID(url)}`],
				[/_cpanel\/packagetype$/,url=>`Settings & Tools->All Settings & Tools->Pre-defined Package Types`],
				[/_cpanel\/package$/,url=>`Settings & Tools->All Settings & Tools->Pre-defined Packages`],
				[/_cpanel\/shippingid$/,url=>`Settings & Tools->All Settings & Tools->Shipping Categories`],
				[/_cpanel\/vacations$/,url=>`Settings & Tools->All Settings & Tools->Shipping Date Groups`],
				[/_cpanel\/ship$/,url=>`Settings & Tools->All Settings & Tools->Shipping Matrix Overview`],
				[/_cpanel\/shippinggroup/,url=>`Settings & Tools->All Settings & Tools->Shipping Options`],
				[/_cpanel\/shippingcostmgr/,url=>`Settings & Tools->All Settings & Tools->Shipping Services & Rates`],
				[/_cpanel\/zone$/,url=>`Settings & Tools->All Settings & Tools->Shipping Zones`],
				[/_cpanel\/zone\/import$/,url=>`Settings & Tools->All Settings & Tools->Shipping Zones->Import Shipping Zones`],
				[/_cpanel\/zone\/view\?.*id=.*?(?=&|$)/,url=>`Settings & Tools->All Settings & Tools->Shipping Zones->Click on the blue zone code named INSERTCODE`],
				[/_cpanel\/setup_wizard\?id=customersettings$/,url=>`Settings & Tools->All Settings & Tools->Customer Settings`],
				[/_cpanel\/miscfield_pricegroup$/,url=>`Settings & Tools->All Settings & Tools->Customer Groups`],
				[/_cpanel\/miscfield_customer$/,url=>`Settings & Tools->All Settings & Tools->Custom Customer Fields`],
				[/_cpanel\/miscfield_customer\/view\?.*id=.*?(?=&|$)/,url=>`Settings & Tools->All Settings & Tools->Custom Customer Fields->Click the blue Field ID labelled misc${extractID(url)}`],
				[/_cpanel\/cusclass\?id=1$/,url=>`Settings & Tools->All Settings & Tools->Customer Classification One`],
				[/_cpanel\/cusclass\?id=2$/,url=>`Settings & Tools->All Settings & Tools->Customer Classification Two`],
				[/_cpanel\/msgcenter$/,url=>`Settings & Tools->All Settings & Tools->Customer Messages`],
				[/_cpanel\/followuptypes$/,url=>`Settings & Tools->All Settings & Tools->Customer Follow Up Types`],
				[/_cpanel\/bulk_email$/,url=>`Settings & Tools->All Settings & Tools->Customer Bulk Email`],
				[/_cpanel\/miscfield_inventory$/,url=>`Settings & Tools->All Settings & Tools->Custom Product Fields`],
				[/_cpanel\/miscfield_inventory\/view\?.*id=.*?(?=&|$)/,url=>`Settings & Tools->All Settings & Tools->Custom Product Fields->Click the blue Field ID labelled misc${extractID(url)}`],
				[/_cpanel\/itemgroups$/,url=>`Settings & Tools->All Settings & Tools->Product Groups`],
				[/_cpanel\/setting\/review$/,url=>`Settings & Tools->All Settings & Tools->Product Review Fields`],
				[/_cpanel\/units$/,url=>`Settings & Tools->All Settings & Tools->Units of Measure`],
				[/_cpanel\/setup_wizard\?id=cpanelsettings$/,url=>`Settings & Tools->All Settings & Tools->Control Panel Settings`],
				[/_cpanel\/content_types$/,url=>`Settings & Tools->All Settings & Tools->Content Types Manager`],
				[/_cpanel\/content_types\/view\?.*id=.*?(?=&|$)/,url=>`Settings & Tools->All Settings & Tools->Content Types Manager->Click the blue ID labelled ${extractID(url)}`],
				[/_cpanel\/menus\/view\?id=100$/,url=>`Settings & Tools->All Settings & Tools->Custom Control Panel Links`],
				[/_cpanel\/setup_wizard\?id=orderprocessingrules$/,url=>`Settings & Tools->All Settings & Tools->Order Processing Rules`],
				[/_cpanel\/setup_wizard\?id=invoicesettings$/,url=>`Settings & Tools->All Settings & Tools->Invoice & Statement Settings`],
				[/_cpanel\/miscfield_order$/,url=>`Settings & Tools->All Settings & Tools->Custom Sales Order Fields`],
				[/_cpanel\/miscfield_order\/view\?.*id=.*?(?=&|$)/,url=>`Settings & Tools->All Settings & Tools->Custom Sales Order Fields->Click the blue Field ID labelled misc${extractID(url)}`],
				[/_cpanel\/sales_channels$/,url=>`Settings & Tools->All Settings & Tools->Sales Channels`],
				[/_cpanel\/itemjobs$/,url=>`Settings & Tools->All Settings & Tools->Jobs`],
				[/_cpanel\/dispute_reasons$/,url=>`Settings & Tools->All Settings & Tools->Dispute Reasons`],
				[/_cpanel\/rmareason$/,url=>`Settings & Tools->All Settings & Tools->RMA Reasons`],
				[/_cpanel\/rmalnstatus$/,url=>`Settings & Tools->All Settings & Tools->RMA Status Options`],
				[/_cpanel\/rmasupclaims$/,url=>`Settings & Tools->All Settings & Tools->RMA Manufacturer Claims`],
				[/_cpanel\/rmaoutcomes$/,url=>`Settings & Tools->All Settings & Tools->RMA Outcomes`],
				[/_cpanel\/rmalnstatustypes$/,url=>`Settings & Tools->All Settings & Tools->RMA Item Status Types`],
				[/_cpanel\/rmaitemstatus$/,url=>`Settings & Tools->All Settings & Tools->RMA Item Status`],
				[/_cpanel\/setup_wizard\?id=webshopconfig$/,url=>`Settings & Tools->All Settings & Tools->Webstore Settings`],
				[/_cpanel\/checkout-settings$/,url=>`Settings & Tools->All Settings & Tools->Checkout Settings`],
				[/_cpanel\/themes$/,url=>`Settings & Tools->All Settings & Tools->Themes`],
				[/_cpanel\/setup_wizard\?id=imagesettings$/,url=>`Settings & Tools->All Settings & Tools->Image Settings`],
				[/_cpanel\/infomsgs$/,url=>`Settings & Tools->All Settings & Tools->Webstore Error Messages`],
				[/_cpanel\/ckfinder$/,url=>`Settings & Tools->All Settings & Tools->Image & File Manager`],
				[/_cpanel\/url$/,url=>`Settings & Tools->All Settings & Tools->Webstore URLs`],
				[/_cpanel\/seo$/,url=>`Settings & Tools->All Settings & Tools->Webstore Meta Data`],
				[/_cpanel\/redirect$/,url=>`Settings & Tools->All Settings & Tools->301 Redirects`],
				[/_cpanel\/adwgroups$/,url=>`Settings & Tools->All Settings & Tools->Webstore Advertising Groups`],
				[/_cpanel\/miscfield_storeloc$/,url=>`Settings & Tools->All Settings & Tools->Custom Store Finder Fields`],
				[/_cpanel\/emailtmpl$/,url=>`Settings & Tools->All Settings & Tools->Email Templates`],
				[/_cpanel\/filemgr\/view\?id=SysDoc%2Fprintdocs$/,url=>`Settings & Tools->All Settings & Tools->Document Templates`],
				[/_cpanel\/cannedresponses$/,url=>`Settings & Tools->All Settings & Tools->Canned Email Responses`],
				[/_cpanel\/cannedresponsetyps$/,url=>`Settings & Tools->All Settings & Tools->Canned Email Response Types`],
				[/_cpanel\/custom_docs$/,url=>`Settings & Tools->All Settings & Tools->Custom Order Templates`],
				[/_cpanel\/doctmpl$/,url=>`Settings & Tools->All Settings & Tools->Custom Invoice Templates`],
				[/_cpanel\/setup_wizard\?id=api$/,url=>`Settings & Tools->All Settings & Tools->API Settings`],
				[/_cpanel\/setup_wizard\?id=optimise$/,url=>`Settings & Tools->All Settings & Tools->Optimisation & Caching`],
				[/_cpanel\/thirdparty_scripts\/view\?id=101$/,url=>`Settings & Tools->All Settings & Tools->Google Analytics`],
				[/_cpanel\/system_setup\/googlexml$/,url=>`Settings & Tools->All Settings & Tools->Google XML Sitemap`],
				[/_cpanel\/thirdparty_scripts$/,url=>`Settings & Tools->All Settings & Tools->Custom Scripts`],
				[/_cpanel\/thirdparty_scripts\/view\?.*id=.*?(?=&|$)/,url=>`Settings & Tools->All Settings & Tools->Custom Scripts->Click the blue ID labelled ${extractID(url)}`],
				[/_cpanel\/dsimport\/simple$/,url=>`Settings & Tools->All Settings & Tools->Import Data`],
				[/_cpanel\/dsexport\/simple$/,url=>`Settings & Tools->All Settings & Tools->Export Data`],
				[/_cpanel\/imagemgr$/,url=>`Settings & Tools->All Settings & Tools->Import Images`],
				[/_cpanel\/dsimport\?limittmp=n$/,url=>`Settings & Tools->All Settings & Tools->Data Import Templates`],
				[/_cpanel\/dsimport\/view\?.*id=.*?(?=&|$)/,url=>`Settings & Tools->All Settings & Tools->Data Import Templates->Click the blue ID labelled ${extractID(url)}`],
				[/_cpanel\/dsimport/,url=>`Settings & Tools->All Settings & Tools->Data Import Templates`],
				[/_cpanel\/dsexport\?limittmp=n$/,url=>`Settings & Tools->All Settings & Tools->Data Export Templates`],
				[/_cpanel\/dsexport\/view\?.*id=.*?(?=&|$)/,url=>`Settings & Tools->All Settings & Tools->Data Export Templates->Click the blue ID labelled ${extractID(url)}`],
				[/_cpanel\/dsexport/,url=>`Settings & Tools->All Settings & Tools->Data Export Templates`],
				[/_cpanel\/procmgr\?limitmodule=data_import&limitmodule=data_export$/,url=>`Settings & Tools->All Settings & Tools->Import\/Export Processes`],
				[/_cpanel\/proclog\?limitmodule=data_import&limitmodule=data_export$/,url=>`Settings & Tools->All Settings & Tools->Import\/Export History`],
				[/_cpanel\/exbatch\?limitmod=DS_order$/,url=>`Settings & Tools->All Settings & Tools->Order Export Batches`],
				[/_cpanel\/recpaymentlog$/,url=>`Settings & Tools->All Settings & Tools->Recurring Payment Log`],
				[/_cpanel\/batchproc$/,url=>`Settings & Tools->All Settings & Tools->System Scheduled Tasks`],
				[/_cpanel\/procmgr\?limitstatus=Pending$/,url=>`Settings & Tools->All Settings & Tools->Pending Processes`],
				[/_cpanel\/procmgr\?limitstatus=Queued$/,url=>`Settings & Tools->All Settings & Tools->Queued Processes`],
				[/_cpanel\/procmgr\?limitstatus=Running$/,url=>`Settings & Tools->All Settings & Tools->Running Processes`],
				[/_cpanel\/procmgr\?limitstatus=Finished$/,url=>`Settings & Tools->All Settings & Tools->Finished Processes`],
				[/_cpanel\/proclog$/,url=>`Settings & Tools->All Settings & Tools->Process Logs`],
				[/_cpanel\/taskschedules$/,url=>`Settings & Tools->All Settings & Tools->Task \/ Feed Schedules`],
				[/_cpanel\/setup_wizard\?id=mpanelsettings$/,url=>`Settings & Tools->All Settings & Tools->Pick'n Pack Settings`],
				[/_cpanel\/miscfield_pickbinsizes$/,url=>`Settings & Tools->All Settings & Tools->Pick Bin Sizes`],
				[/_cpanel\/register$/,url=>`Settings & Tools->All Settings & Tools->Registers`],
				[/_cpanel\/register\/view\?.*id=.*?(?=&|$)/,url=>`Settings & Tools->All Settings & Tools->Registers->Click the blue ID labelled ${extractID(url)}`],
				[/_cpanel\/setup_wizard\?id=receiptcustomisation$/,url=>`Settings & Tools->All Settings & Tools->Receipt Customisation`],
				[/_cpanel\/setup_wizard\?id=possettings$/,url=>`Settings & Tools->All Settings & Tools->POS Settings`],
				[/_cpanel\/custom_configs$/,url=>`Settings & Tools->All Settings & Tools->Custom Configs`],
				[/_cpanel\/setup_wizard\?id=zendesk$/,url=>`Settings & Tools->All Settings & Tools->Zendesk App Settings`],
				[/_cpanel\/miscfield_warehouse$/,url=>`Settings & Tools->All Settings & Tools->Warehouse Custom Fields`],
				[/_cpanel\/dropshipper$/,url=>`Settings & Tools->All Settings & Tools->Dropship Suppliers`],
				[/_cpanel\/config$/,url=>`Settings & Tools->All Settings & Tools->Advanced Configuration`],
				[/_cpanel\/automationsys$/,url=>`Settings & Tools->All Settings & Tools->Automation Rules`],
				
				[/_cpanel\/filemgr\/view\?.*id=.*?(?=&|$)/,url=>`Settings & Tools->All Settings & Tools->Webstore Templates->${("Webshop"+extractID(url)).replace("WebshopSysDoc%2Femails","Email Templates").replace("WebshopSysDoc%2Fprintdocs","Print Templates").replaceAll("%2F","->")}`],		
				[/_cpanel\/filemgr/,url=>`Settings & Tools->All Settings & Tools->Webstore Templates`],
		
			]
		
			direction = potential_directions.find(dir=>dir[0].test(this.taburl))
		
			if (direction != undefined) {
				return direction[1](this.taburl);
			}
			return this.taburl;
		
			function extractID(url, expression) {
				if (expression == undefined) {
					expression = /(?<=id\=).*?(?=&|$)/;
				}
				return url.match(expression)[0];
			}
		
		}
	},
	created: function() {
		this.checkNView();
		this.checkOrderPage();
		this.checkMatrixPage();
		this.checkParentPage();
	}
})
/*
retrieveData('popupstes',getWorked,getFailed);

function setWorked() {
	console.log('set worked');
	retrieveData('popupstes',getWorked,getFailed);
}

function setFailed(error) {
	console.log('set failed')
	console.log(error)
}

function getWorked(item) {
	console.log(item);
	document.querySelector("#test").innerText = item['popupstes'];
}

function getFailed(error) {
	console.log('get failed')
	console.log(error)
}
*/



////////////////////////////////////////////////////////////////


// given an object containing site data, check the URL matches and update the UI to match
function updatePopupWithData() {
	getTabLocation(function(loc) {
		helper_ui.taburl = loc.url;
		retrieveData(loc.domain,function(stored_site_data) {
			console.log('retrieved site date');
			console.log(stored_site_data[loc.domain]);
			if (stored_site_data[loc.domain] != null) {
				helper_ui.sitedata = stored_site_data[loc.domain];
				
				retrieveData(loc.domain+"|"+loc.path,function(local_url) {
					if (local_url != null) {
						console.log('loaded local pagfe for ', loc.domain+"|"+loc.path);
						console.log(local_url[loc.domain+"|"+loc.path]);
						helper_ui.localpage = local_url[loc.domain+"|"+loc.path];
					}
				});
				
			}
		});
	});

}

updatePopupWithData();

// whenever background updates the site data we need to update the UI (assuming the site url updated is the active tab)
monitorStorage(function(changes) {

	getTabLocation(function(loc) {;
		helper_ui.taburl = loc.url;
		if (changes[loc.domain] != null) {
			helper_ui.sitedata = changes[loc.domain].newValue;
		} else if (changes[loc.domain+"|"+loc.path] != null) {
			helper_ui.localpage = changes[loc.domain+"|"+loc.path].newValue;
		}
	})


	
});
