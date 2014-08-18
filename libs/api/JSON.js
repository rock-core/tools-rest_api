

/**
 * load JSON formatted data usinf GET
 * @param url
 * @returns Javascript object
 */
function loadJSON(url){
	var jsonloader = $.getJSON( url, function() {
		//console.log( "success" );
		})
		.done(function() {
		//console.log( "second success" );
		})
		.fail(function() {
		console.log( "error reading: " + url);
		})
		.always(function() {
		//console.log( "complete" );
		});
	return jsonloader;
}

/**
 * Sends an JavaScript object as JSON formatted data using POST
 * @param url
 * @param data
 * @returns
 */
function postJSON(url,data){

	var jsonloader = $.post( url, data, function() {
		//console.log( "success" );
		})
		.done(function() {
		//console.log( "second success" );
		})
		.fail(function() {
		console.log( "error writing" + url );
		})
		.always(function() {
		//console.log( "complete" );
		});
	return jsonloader;
}


