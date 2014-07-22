

function addPort(taskname,content){
	var taskdata = document.getElementById(taskname+"Data");
	
	taskdata.appendChild(document.createTextNode(JSON.stringify(content)));
}

function insertPorts(taskname,content) {
	//console.log( "insertPorts" );
	//console.log(content);
	content.ports.forEach(function(elem){
		//console.log(elem);
		addPort(taskname,elem);
	});
	//re-load the accordion UI Template
	//$( "#accordion" ).accordion();
	$( "#accordion" ).accordion( "refresh" );
};



function loadPorts(taskname){
	var url = "http://localhost:9292/tasks/"+taskname+"/ports";
	console.log( url );
	var jsonportloader = jQuery.getJSON(url);
	jsonportloader.done(function(data){
		console.log( "json loaded" );
		insertPorts(taskname,data);
	});	
};


