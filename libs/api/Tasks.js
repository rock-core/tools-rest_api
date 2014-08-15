
/**
 * 
 * @param url
 * @param callback the callbacks data parameter contains an array "task_names"
 */
function loadTasks(url,callback){
	//console.log( "loadTasks" );
	var jsonloader = loadJSON(url+"/tasks");
	jsonloader.done(function(data){
		callback(url,data);
	});	
};

