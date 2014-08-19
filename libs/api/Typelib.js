
//type cache url->type
var types = {};

/**
 * caching wrapper for readTypeInfo(), in case the type was already requested, 
 * @param url
 * @param callback
 */
function getTypeInfoOf(url, callback){
	var type = types[url];
	//console.log(types);
	if (typeof type == 'undefined'){
		//request
		//console.log("requesting type of port "+ url);
		loadTypeInfo(url, callback);
	}else{
		callback(type);
	}
}

/**
 * reads type information from url and returns on receive
 * @param url
 * @param callback callback function to call on receive of the information
 */
function loadTypeInfo(url, callback){
	loadJSON(url,function(data){
		types[url] = data.port;
		callback(data.port);
	});	
}


/**
 * return a javascript type that can be written to url
 * @param url
 * @param callback
 */
function getType(url, callback){
	getTypeInfoOf(url, function(data){
		var type = {};
//		console.log(data);	
		if (data.type.class == "Typelib::NumericType"){
			type[data.name] = nil;
		}else if (data.type.class == "Typelib::CompoundType"){
			for (var index = 0;index < data.type.fields.length;index++){
				//console.log(data.type.fields[index].name);
				type[data.type.fields[index].name] = null;			
			}
		}
//		console.log(type);
		callback(type);
	});
	
}

