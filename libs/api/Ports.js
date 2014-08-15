
//port info cache
var portinfo = {};

/**
 * Load port information of a specific task (use cache if ports information exists)
 * @param url base url (e.g. http://localhost:9292)
 * @param taskname
 * @param callback 
 */
function getPorts(url, taskname, callback){
	var murl = url+"/tasks/"+taskname+"/ports";
	
	var port = portinfo[murl];
	if (typeof port == 'undefined'){
		
		console.log("requesting ports of  "+ taskname);
		loadPorts(url, taskname, callback)

	}else{
		//console.log("loaded ports of  "+ taskname);
		callback(url, taskname, port);
	}
};

/**
 * load port information from API
 * @param url base url (e.g. http://localhost:9292)
 * @param taskname
 * @param callback
 * @returns
 */
function loadPorts(url, taskname, callback){
	var murl = url+"/tasks/"+taskname+"/ports";
	var jsonportloader = loadJSON( murl );
	
	jsonportloader.done(function(data){
		//console.log( taskname );
		portinfo[murl] = data;
		callback(url, taskname, data);
	});
	return jsonportloader;
};

/**
 * read the data on the port
 * @param url base url (e.g. http://localhost:9292)
 * @param taskname
 * @param portname
 * @param command
 */
function readPort(url,taskname,portname,command){
	var jsonportreader = loadJSON( url+"/tasks/"+taskname+"/ports/"+portname+"/read" );
	
	jsonportreader.done(function(data){
		command(data[0]);
	});
	return jsonportreader;
}


