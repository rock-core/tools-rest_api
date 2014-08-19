

/**
 * 
 * @param url
 * @param callback the callbacks data parameter contains an array "task_names"
 */

function loadJSON(url,callback){
	//console.log( "loadTasks" );
	var jsonloader = getJSONLoader(url);
	jsonloader.done(function(data){
		callback(data);
	});	
};


/**
 * load JSON formatted data usinf GET
 * @param url
 * @returns Javascript object
 */
function getJSONLoader(url){
	var jsonloader = $.getJSON( url, function() {
		//console.log( "success" );
		})
		.done(function() {
			//console.log( "done" );
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


