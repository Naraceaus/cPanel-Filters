/**
 * Extract the domain from a FQDN
 * @param {string} full_url - The URL to parse
 */
export const extractDomain = full_url => full_url.replace(/http.*\/\//,"").replace(/\/.*/,"").replace(/\?.*/,"")

/**
 * Extract the path from a FQDN
 * @param {*} full_url 
 */
export const extractPath = full_url => full_url.replace(/http.*\/\//,"").replace(/.*?(\/|$)/,"").replace(/\?.*/,"")

/**
 * 
 * @param {*} full_url 
 */
export const extractQueryString = full_url => full_url.replace(/.*?(\?|$)/,"")

/**
 * Returns a Promise with a Document or string from the given URL with query parameters.
 * Promise returns an object with a text and dom attribute if needDom is true.
 * @param {string} url 				- The URL to get the Document from 
 * @param {object} queries 			- An Object of key-value pairs of query parameters. Defaults to an empty object
 */
export const getPage = (url, queries={}) => {
	return new Promise((resolve, reject) => {
		let uri = `https://${url}?`
		Object.entries(queries).forEach(pair => {
			uri = `${uri}${pair[0]}=${pair[1]}&`
		})
		fetch(uri)
			.then(
				response => response.text()
			)
			.then(
				body =>resolve(body)
			)
			.catch(
				err => reject('')
			)
	})
}

/**
 * Returns a Promise with a Document or string from the given URL with query parameters.
 * Promise returns text result
 * @param {string} url 				- The URL to get the Document from 
 * @param {object} parameters 		- An Object of key-value pairs of query parameters. Defaults to an empty object
 */
export const postPage = (url, parameters={}) => {
	return new Promise((resolve, reject) => {
		let uri = `https://${url}`
		let opts = {
			method: "POST",
			body: JSON.stringify(parameters),
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			}
		}
		fetch(uri, opts)
			.then(
				response => response.text()
			)
			.then(
				text => resolve(text)
			)
			.catch(
				text => reject('')
			)
	})
}