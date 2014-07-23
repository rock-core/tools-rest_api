
function loadJSON(url){
	var jsonloader = $.getJSON( url, function() {
		console.log( "success" );
		})
		.done(function() {
		console.log( "second success" );
		})
		.fail(function() {
		console.log( "error" );
		})
		.always(function() {
		console.log( "complete" );
		});
	return jsonloader;
}

//also returns object, not TEXT (mime type from server)
//function loadText(url){
//	var loader = $.get( url, function() {
//		console.log( "success" );
//		})
//		.done(function() {
//		console.log( "second success" );
//		})
//		.fail(function() {
//		console.log( "error" );
//		})
//		.always(function() {
//		console.log( "complete" );
//		});
//	return loader;
//}
