
function loadTasks(){
	//console.log( "loadTasks" );
	var jsonloader = loadJSON("http://localhost:9292/tasks");
	jsonloader.done(function(data){
		insertTasks(data);
	});	
};

function insertTasks(content) {
	content.task_names.forEach(function(elem){
		//console.log(elem);
		addTask(elem);
		//loadPorts(elem);
	});
	//(re-)load the accordion UI Template
	$( "#accordion" ).accordion( "refresh" );
};

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








