
//type cache url->type
var types = {};

/**
 * caching wrapper for readTypeInfo(), in case the type was already requested, 
 * @param url
 * @param callback
 */
function getTypeInfoOf(url, callback){
	var type = types[url];
	console.log(types);
	if (typeof type == 'undefined'){
		//request
		//console.log("requesting type of port "+ url);
		loadTypeInfo(url, callback);
	}else{
		console.log(type);
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
		//console.log(data);
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
		console.log(data);
		if (data.type.class == "Typelib::OpaqueType"){
			callback();
		}else if (data.type.class == "Typelib::NumericType"){
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

/**
 * converts information read from a port to a string representation
 * @param portinfopreviously read port information (contains data type, e.g int32_t) 
 * @param type the type itseld, parsed from http://../read  
 * @param seperator a seperator passed to JSON.stringify
 * @returns string representing the data
 */
function getPortContentAsText(portinfo, data, seperator){
	
	//some content we don't want to be displayed
	switch (portinfo.type.name){
	case "/RTT/extras/ReadOnlyPointer</base/samples/frame/Frame>":
		data.value.image = "display deactivated";
		break;
	case "/base/samples/Pointcloud":
		data.value.points = "display deactivated";
		data.value.colors = "display deactivated";
	}
	
	//convert time values
	convertTimeValues(portinfo, data.value);
	
	//console.log(portinfo.type.class);
	switch (portinfo.type.class){
	
		case "Typelib::NumericType": return data.value
		
		case "Typelib::CompoundType": return JSON.stringify(data.value,null,seperator);
			
		default: return JSON.stringify(data,null,seperator);
	}
};

function convertTimeValues(portinfo, data){
	if (portinfo.type.name == "/base/Time"){
		console.log("found time");
		var date = new Date (data.microseconds/1000);
		data['readable'] = date.toLocaleString();
	}else if (portinfo.type.class == "Typelib::CompoundType"){
		portinfo.type.fields.forEach(function(entry){
			convertTimeValues(entry, data[entry.name]);
		});
	}
};


