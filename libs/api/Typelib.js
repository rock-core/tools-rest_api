
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
		console.log("requesting type of port "+ url);
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
	var jsonportreader = loadJSON( url );
	
	jsonportreader.done(function(data){
		types[url] = data.port;
		callback(data.port);
	});	
}


/**
 * converts information read from a port to a string representation
 * @param portinfopreviously read port information (contains data type, e.g int32_t) 
 * @param type the type itseld, parsed from http://../read  
 * @param seperator a seperator passed to JSON.stringify
 * @returns string representing the data
 */
function getPortContentAsText(portinfo, type, seperator){
	
	if (portinfo.type.class == "Typelib::NumericType"){
		return type.sample
	}else if (portinfo.type.class == "Typelib::CompoundType"){
		if (portinfo.type.name == "/base/Time"){
			var date = new Date (type.sample.microseconds/1000);
			var res = date.toLocaleString();
			console.log(res);
			return res;
		} 
		return JSON.stringify(type.sample,null,seperator);
	}else if (portinfo.type.class == "Typelib::opaque"){
		return JSON.stringify(type.sample,null,seperator);
	}
	
	return "";
};

/**
 * return a javascript type that can be written to url
 * @param url
 * @param callback
 */
function getType(url, callback){

	getTypeInfoOf(url, function(data){
		var type = {};
		console.log(data);
		
		if (data.type.class == "Typelib::NumericType"){
			type[data.name] = nil;
		}else if (data.type.class == "Typelib::CompoundType"){
			for (var index = 0;index < data.type.fields.length;index++){
				console.log(data.type.fields[index].name);
				type[data.type.fields[index].name] = null;			
			}
		}
		console.log(type);
		callback(type);
	});
	
}

