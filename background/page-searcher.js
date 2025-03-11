import * as storage from '../storage.js';

storage.listenForMessages(handleMessages);

/**
 * Finds the corresponding page in the control page for this webstore page and stores the result
 */
async function findPageInCPanel(site_data, truncated_path) {
    let url = `${site_data.domain}/_cpanel/url`
    let queries = {
        "_ftr_request_url": `^${truncated_path}`
    }
    let selector = "#ajax-content-pl table tbody tr:first-of-type td:nth-of-type(2) a"
    let results = {
        site_data:site_data,
        truncated_path: truncated_path
    };
    return storage.getPage(url, queries)
        .then(
            text => {
                let parser = new DOMParser()
                let link = parser.parseFromString(text, "text/html").querySelector(selector);
                console.log("parse link");
                console.log(parser.parseFromString(text, "text/html"));
                console.log(link);
                
                link
                    ? results.link = link.getAttribute('href')
                    : results.link = "NO RESULTS";
                

                console.log('about to reutrn getpage results');
                console.log(results)
                return results;

                /*link
                    ? storage.storeData(storedDomain, link.getAttribute('href'))
                    : storage.storeData(storedDomain, "NO RESULTS")
                    */
            }
        )
        .catch(
            result => {
                console.log('Error');
                console.log(result);
                results.link = "NO RESULTS";
                return result;
            }
        )
}

/**
 * Checks the installed themes and finds the active theme and stores both results
 */
async function checkTheme(site_data) {
    let url = `${site_data.domain}/_cpanel/setup_wizard`
    let queries = {
        "id": "webshopconfig"
    }
    return storage.getPage(url, queries)
    .then(
        result => {
            console.log("chjecktheme ajax response");
            console.log(result)
            let parser = new DOMParser()
            let options = [...parser.parseFromString(result, "text/html").querySelector("select[name='cfgval0']").children]
            let themes = []
            let livetheme = ""
            options.forEach(option => {
                themes.push(option.value)
                option.selected
                    ? livetheme = option.value
                    : null
            })
            site_data.livetheme = livetheme
            site_data.themes = themes
            return {site_data:site_data};
            //storage.storeData(domain, siteData)
        }
    )
    .catch(
        result => {
            console.log("ERROR");
            console.log(result);
            site_data.livetheme = "N.A"
            site_data.themes = ["N.A"]
            return {site_data:site_data};
            //storage.storeData(domain, siteData)
        }
    )
}

function handleMessages(message, sender, send_response) {
	//loc specified then a content script hit a site
	
	switch (message.type) {
		case "find_page_in_cpanel":
            findPageInCPanel(message.site_data, message.truncated_path)
            .then(results=>{
                send_response(results)
            })
            break;
        case "check_theme":
            checkTheme(message.site_data)
            .then(results=>{
                send_response(results)
            })
            break;
	}

    return true;

}