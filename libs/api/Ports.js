
//port info cache
var portinfo = {};

/**
 * Load port information of a specific task (use cache if ports information exists)
 * @param url base url (e.g. http://localhost:9292)
 * @param taskname
 * @param callback 
 */
function getPorts(url, callback){
	
	var ports = portinfo[url];
	if (typeof ports == 'undefined'){
		
//		console.log("requesting ports of  "+ taskname);
		loadPorts(url,callback);

	}else{
		//console.log("loaded ports of  "+ taskname);
		callback(ports);
	}
};

/**
 * load port information from API
 * @param url base url (e.g. http://localhost:9292)
 * @param taskname
 * @param callback
 * @returns
 */
function loadPorts(url, callback){
	//cached version of task information, ports may be already loaded by 
	getTaskInfo(url,function(taskdata){
		portinfo[url] = taskdata.model.ports;
		callback(taskdata.model.ports);
	});

};

/**
 * Load port information of a specific task (use cache if ports information exists)
 * @param url base url (e.g. http://localhost:9292)
 * @param taskname
 * @param callback 
 */
function getPort(url, callback){
	
	var port = portinfo[url];
	if (typeof port == 'undefined'){
		
//		console.log("requesting ports of  "+ taskname);
		loadPort(url,callback);

	}else{
		//console.log("loaded ports of  "+ taskname);
		callback(port);
	}
};

/**
 * load port information from API
 * @param url base url (e.g. http://localhost:9292)
 * @param taskname
 * @param callback
 * @returns
 */
function loadPort(url, callback){
		loadJSON(url,function(data){
			portinfo[url] = data.port;
			//console.log(data.task);
			callback(data.port);
		});
};



/**
 * read the data on the port
 * @param url base url (e.g. http://localhost:9292)
 * @param taskname
 * @param portname
 * @param command
 */
function readPort(url,callback){
	var jsonportreader = getJSONLoader( url );
	
	jsonportreader.done(function(data){
		callback(data[0]);
	});
	return jsonportreader;
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
