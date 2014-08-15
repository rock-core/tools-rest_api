

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
	var command = {};
	var json = JSON.stringify(data);
	
	command["command"] = json;
	
	var jsonloader = $.post( url, command, function() {
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


