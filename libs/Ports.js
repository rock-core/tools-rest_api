



function loadPorts(taskname){
	var url = "http://localhost:9292/tasks/"+taskname+"/ports";
	var taskdata = document.getElementById(taskname+"Data");
	taskdata.innerHTML = "";
	//console.log( url );
	
	var jsonportloader = loadJSON( url );
	
	jsonportloader.done(function(data){
		//console.log( taskname );
		insertPorts(taskname,data);
	});
};

function insertPorts(taskname,content) {
	//console.log( "insertPorts" );
	console.log(content);
	
	var taskdata = document.getElementById(taskname+"Data");
	//taskdata.innerHTML = JSON.stringify(content);
	
	content.ports.forEach(function(elem){
		//console.log(elem);
		if (elem.direction=="output"){
			addPort(taskname,elem);
		}
	});
	content.ports.forEach(function(elem){
		//console.log(elem);
		if (elem.direction=="input"){
			addPort(taskname,elem);
		}
	});
};


function addPort(taskname,content){
	
	var taskdata = document.getElementById(taskname+"Data");
	var portentry = document.createElement("div");
	taskdata.appendChild(portentry);
	portentry.setAttribute("class", "port");
	portentry.setAttribute("title", content.doc);
	portentry.setAttribute("id", taskname+"/"+content.name);
	setPortData(taskname,content);
	
	if (content.direction == "output"){
		updatePortValue(taskname,content);
	}else if (content.direction == "input"){
		//TODO: create inputs and POST
		//request typelib info
		
		//async call to the server, get the data type information
		var url = "http://localhost:9292/tasks/"+taskname+"/ports/"+content.name;
		getTypeOf(url,function(portinfo){
			
			//get html element to write to
			var id = taskname.replace("/","") + content.name + "data";
			var portdata = document.getElementById(id);

			//generate a html from from the type information 
			var form = generateForm(taskname, portinfo, id);
			
			var coll = createCollapsable(form,"Edit","Close");	

			portdata.appendChild(coll);
			
		});
		
	}
	
	taskdata.appendChild(document.createElement("br"));
	taskdata.appendChild(document.createElement("br"));
	
	
}

function setPortData(taskname, portinfo){
	var portentry = document.getElementById(taskname+"/"+portinfo.name);
		
		
		var text = "<b>" + portinfo.name + "</b> : "+ portinfo.type.name + "<br>";
		var p = document.createElement("div");
		p.setAttribute("class","portheader");
		p.innerHTML = text;
		
		portentry.appendChild(p);
		
		var value;
		if (portinfo.direction=="input"){
			value = document.createElement("div");	
		}else{
			value = document.createElement("pre");
		}
		
		
		
		
		var dataid = taskname.replace("/","") + portinfo.name + "data" ;
		value.setAttribute("id", dataid);
		portentry.appendChild(value);

}

function updatePortValue(taskname, portinfo){
	//console.log(taskname+"/"+portinfo.name + " updateValue");
	//console.log(portinfo);
	readPort(taskname,portinfo.name,function(data){
		//console.log(taskname+"/"+portinfo.name + " readPort")
		//console.log(data) 
		var id = taskname.replace("/","") + portinfo.name + "data";
		var portentry = document.getElementById(id);
			
		portentry.innerHTML = getTypeText(portinfo,data," ");
		
		//$(function() {
			$('#'+id).JSONView(getTypeText(portinfo,data,""), {collapsed: true});
		//});
	});
}

function readPort(taskname,portname,command){
	var url = "http://localhost:9292/tasks/"+taskname+"/ports/"+portname+"/read";
	//console.log("readport" + url);
	
	//var jsonportreader = $.getJSON(url);
	
	var jsonportreader = loadJSON( url );
	
	jsonportreader.done(function(data){
		command(data[0]);
	});	
}


