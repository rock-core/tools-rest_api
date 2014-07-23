



function loadPorts(taskname){
	var url = "http://localhost:9292/tasks/"+taskname+"/ports";
	var taskdata = document.getElementById(taskname+"Data");
	taskdata.innerHTML = "";
	//console.log( url );
	
	var jsonportloader = loadJSON( url );
	
	jsonportloader.done(function(data){
		console.log( taskname );
		insertPorts(taskname,data);
	});
};

function insertPorts(taskname,content) {
	//console.log( "insertPorts" );
	console.log(content);
	
	var taskdata = document.getElementById(taskname+"Data");
	//taskdata.innerHTML = JSON.stringify(content);
	
	content.ports.forEach(function(elem){
		addPort(taskname,elem);
	});
};

function addPort(taskname,content){
	
	if (content.direction == "output"){
		
		var taskdata = document.getElementById(taskname+"Data");
		var portentry = document.createElement("div");
		taskdata.appendChild(portentry);
		portentry.setAttribute("title", content.doc);
		portentry.setAttribute("id", taskname+"/"+content.name);
		setPortData(taskname,content);
		updatePortValue(taskname,content);
	}else{
		//TODO: create inputs and POST
	}
	
}

function setPortData(taskname, portinfo){
	var portentry = document.getElementById(taskname+"/"+portinfo.name);
		
		
		var text = portinfo.direction + ": " + portinfo.name + " : " + portinfo.type.name + "<br>";
		text += "Value:";
		portentry.innerHTML = text;
		
		var value = document.createElement("div");
		var dataid = taskname.replace("/","") + portinfo.name + "data" ;
		value.setAttribute("id", dataid);
		portentry.appendChild(value);

				//value.innerHTML = getTypeText(portinfo,data);

//		var button = document.createElement("INPUT");
//		button.setAttribute("type", "button");
//		button.setAttribute("onclick", "updatePortValue("+taskname+","+JSON.stringify(portinfo)+");");
//		portentry.appendChild(button);

		portentry.innerHTML += "<br><br>";

}

function updatePortValue(taskname, portinfo){
	console.log(taskname+"/"+portinfo.name + " updateValue");
	console.log(portinfo);
	readPort(taskname,portinfo.name,function(data){
		console.log(taskname+"/"+portinfo.name + " readPort")
		console.log(data) 
		var id = taskname.replace("/","") + portinfo.name + "data";
		var portentry = document.getElementById(id);
			
		//portentry.innerHTML = getTypeText(portinfo,data);
		//portentry.innerHTML = data;
		$(function() {
			$('#'+id).JSONView(getTypeText(portinfo,data), {collapsed: true});
		});
	});
}

function readPort(taskname,portname,command){
	var url = "http://localhost:9292/tasks/"+taskname+"/ports/"+portname+"/read";
	console.log("readport" + url);
	
	//var jsonportreader = $.getJSON(url);
	
	var jsonportreader = loadJSON( url );
	
	jsonportreader.done(function(data){
		command(data[0]);
	});	
}
