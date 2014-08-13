
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

function sendJSON(url,data){
	
	return $.ajax ({
	    url: url,
	    type: "POST",
	    data: JSON.stringify(data),
	    dataType: "json",
	    success: function(){

	    }
	});
	
//	var jsonloader = $.post( url, data, function() {
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
//	return jsonloader;
}

function sendForm(name){
	console.log(name);
	//var form = document.forms[name];
	var form = document.getElementById(name);
	console.log(form);
	var url = form.action;
	//http://stackoverflow.com/questions/1255948/post-data-in-json-format-with-javascript
	
	var formdata = {};
	for (var index = 0; index < form.length; index++){
		var input = form[index];
	    if (input.name) {
	    	formdata[input.name] = input.value;
	    }
	}
	
	console.log(formdata);
	
	//var dat = JSON.stringify($(form).serializeArray());
	var command = {};
	command["command"] = formdata;
	//var dat = JSON.stringify(command);
	
	//console.log(dat);
	sendJSON(url,command);
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
