	document.querySelectorAll("[name*='sev_s']").forEach(function(service, index){
		if (/sev_s[0-9]*_m[0-9]/.test(service.name)) {
			serviceLabel = document.querySelector("label[for='"+service.name+"']");
			serviceLabel.innerText = service.value+" - "+serviceLabel.innerText;
		}
	});