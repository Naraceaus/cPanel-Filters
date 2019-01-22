	var itemForms = document.getElementsByName("itemForm");
	if (itemForms.length == 1) {
		if (itemForms[0].item != null && itemForms[0].page!=null) {
			if (itemForms[0].item.value=="order" && itemForms[0].page.value=="vieworder") {
				// prepend select values
				var meth_options = document.querySelectorAll("[name='_odr_sh_gp'] option");

				for (var opt_i = 0; opt_i < meth_options.length; opt_i++) {
					var opt = meth_options[opt_i];
					
					opt.textContent = opt.value + " - " + opt.textContent;
				}
				
				//create go to method button
				var btn_icon = document.createElement("i");
				btn_icon.className = "icon-large icon-edit";
				var goto_link = document.createElement("a");
				goto_link.appendChild(btn_icon);
				goto_link.href = "javascript:void(0);";
				goto_link.title = "Open current method";
				goto_link.addEventListener('click', function() {
					window.open('https://'+window.location.hostname+'/_cpanel/shippinggroup/view?id='+document.querySelector("[name='_odr_sh_gp']").value,'_blank');
				});
				document.querySelector("[name='_odr_sh_gp']").parentElement.appendChild(goto_link);
			}
		}
	}