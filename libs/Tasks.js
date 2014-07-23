

function addTask(taskname){
	var accordion = document.getElementById("accordion");
	var taskentry = document.createElement("h3");
	taskentry.setAttribute("onclick", "loadPorts(\""+taskname+"\")");
	var taskdata = document.createElement("div");
	taskdata.setAttribute("id", taskname+"Data");
	accordion.appendChild(taskentry);
	accordion.appendChild(taskdata);
	taskentry.appendChild(document.createTextNode(taskname));
}

function insertTasks(content) {
    //document.getElementById('output').innerHTML = content;
	//document.getElementById("tasksjson").appendChild(document.createTextNode("callback"));
	content.task_names.forEach(function(elem){
		//console.log(elem);
		addTask(elem);
		//loadPorts(elem);
	});
	//(re-)load the accordion UI Template
	$( "#accordion" ).accordion( "refresh" );
};



function loadTasks(){
	console.log( "loadTasks" );
//	console.log( tasksResponse() );
	var jsonloader = jQuery.getJSON("http://localhost:9292/tasks");
	jsonloader.done(function(data){
		insertTasks(data);
	});	
};


