

function addTask(taskname){
	var accordion = document.getElementById("accordion");
	var taskentry = document.createElement("h3");
	var taskdata = document.createElement("div");
	accordion.appendChild(taskentry);
	accordion.appendChild(taskdata);
	taskentry.appendChild(document.createTextNode(taskname));
}

function insertTasks(content) {
    //document.getElementById('output').innerHTML = content;
	//document.getElementById("tasksjson").appendChild(document.createTextNode("callback"));
	console.log(content.task_names[0]);
	content.task_names.forEach(function(elem){
		console.log(elem);
		addTask(elem)
	});
	//load the accordion UI Template
	$( "#accordion" ).accordion();
};



function loadTasks(){
	console.log( "loadTasks" );
//	console.log( tasksResponse() );
	var jsonloader = jQuery.getJSON("http://localhost:9292/tasks");
	jsonloader.done(function(data){
		insertTasks(data);
	});	
};


