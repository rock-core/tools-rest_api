
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


