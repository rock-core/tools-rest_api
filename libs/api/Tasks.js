


var taskinfo = {};

function getTaskInfo(url, callback){

	var task = taskinfo[url];
	if (typeof task === 'undefined'){	
//		console.log("requesting task info of  "+ url);
		loadTaskInfo(url, callback)

	}else{
//		console.log(task);
		callback(task);
	}
};

function loadTaskInfo(url, callback){

	loadJSON(url,function(data){
		taskinfo[url] = data.task;
		//console.log(data.task);
		callback(data.task);
	});
};
