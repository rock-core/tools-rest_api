
function loadPorts(taskname){
	var url = "http://localhost:9292/tasks/"+taskname+"/ports";
	//console.log( url );
	var jsonportloader = jQuery.getJSON(url);
	jsonportloader.done(function(data){
		console.log( taskname );
		insertPorts(taskname,data);
	});
};

function insertPorts(taskname,content) {
	//console.log( "insertPorts" );
	console.log(content);
	
	var taskdata = document.getElementById(taskname+"Data");
	taskdata.innerHTML = JSON.stringify(content);
	
	content.ports.forEach(function(elem){
		//console.log(elem);
		addPort(taskname,elem);
	});
};

function addPort(taskname,content){
	var taskdata = document.getElementById(taskname+"Data");
	taskdata.innerHTML +=  "<br><br>" 
		+ content.direction + ": " + content.name + " : " + content.type.name + "<br>doc: <span style=\"font-style:italic;\">" + content.doc + "</span><br>";
	
	if (content.direction == "output"){
		taskdata.innerHTML += "Value:";
		
		readPort(taskname,content.name,function(data){
			taskdata.innerHTML += getTypeText(data);
		});

	}else{
		//TODO: create inputs and POST
	}
	
}

function readPort(taskname,portname,command){
	var url = "http://localhost:9292/tasks/"+taskname+"/ports/"+portname+"/read";
	console.log("readport" + url);
	var jsonportreader = jQuery.getJSON(url);
	jsonportreader.done(function(data){
		console.log("done");
		console.log(data);
		command(data[0]);
	});	
}
