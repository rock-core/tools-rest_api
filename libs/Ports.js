

var portinfo = {};

function loadPorts(taskname){
	var url = "http://localhost:9292/tasks/"+taskname+"/ports";
	var taskdata = document.getElementById(taskname+"Data");
	taskdata.innerHTML = "";
	//console.log( url );
	
	var port = portinfo[url];
	if (typeof port == 'undefined'){
		
		console.log("requesting ports of  "+ taskname);
		
		var jsonportloader = loadJSON( url );
		
		jsonportloader.done(function(data){
			//console.log( taskname );
			portinfo[url] = data;
			insertPorts(taskname,data);
		});
	}else{
		console.log("loaded ports of  "+ taskname);
		insertPorts(taskname,port);
	}
	
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
		var dataid = taskname.replace("/","") + portinfo.name + "data" ;
		
		if (portinfo.direction=="input"){
			value = document.createElement("div");
			value.setAttribute("id", dataid);
		}else{
			var pre = document.createElement("pre");
			pre.setAttribute("id", dataid);
			value = createCollapsable(pre,"View","Close");
			
		}
		
		
		
		
		
		
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
		
		var text = getPortContentAsText(portinfo,data," ");
		
		if (text[0] == '{'){
			//assume JSON text format
			$('#'+id).JSONView(getPortContentAsText(portinfo,data,""), {collapsed: false});			
		}else{
			portentry.setAttribute("style","color:blue");
			portentry.innerHTML = text;	
		}

		
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


