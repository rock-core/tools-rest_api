



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
	
	var taskdata = document.getElementById(taskname+"Data");
	var portentry = document.createElement("div");
	taskdata.appendChild(portentry);
	portentry.setAttribute("title", content.doc);
	portentry.setAttribute("id", taskname+"/"+content.name);
	setPortData(taskname,content);
	
	if (content.direction == "output"){
		updatePortValue(taskname,content);
	}else if (content.direction == "input"){
		//TODO: create inputs and POST
		//request typelib info
		readTypeInfo(taskname,content.name,function(portinfo){
			
			console.log(portinfo);
			
			var id = taskname.replace("/","") + content.name + "data";
			var portdata = document.getElementById(id);
//			portdata.innerHTML = JSON.stringify(data);
//			$('#'+id).JSONView(getTypeText(content,data,""), {collapsed: false});
			
			var form = document.createElement("form");
			var action = "http://localhost:9292/tasks/"+taskname+"/ports/"+content.name;
			form.setAttribute("action",action);
			form.setAttribute("method","post");
			form.setAttribute("id","form"+id);
			portdata.appendChild(form);
			var table = document.createElement("table");
			form.appendChild(table);
			
			var submit = document.createElement("input");
			submit.setAttribute("type","button");
			submit.setAttribute("value","submit");
			submit.setAttribute("onclick","sendForm(\"form"+id+"\")")
			form.appendChild(submit); 
				//JSON.stringify(data) +
			//TODO for loop over fields, create form 
			
			//if ()
			
			for (var index = 0;index < portinfo.type.fields.length;index++){
				var tr = document.createElement("tr");
				table.appendChild(tr);
				
				var td = document.createElement("td");
				tr.appendChild(td);
				td.innerHTML = portinfo.type.fields[index].name;
				
				td = document.createElement("td");
				tr.appendChild(td);
				td.appendChild(getFormElement(portinfo.type.fields[index],portinfo.type.fields[index].name));
				//form.innerHTML += "</td><br>";
			}
			
			//form.innerHTML +=	"</tr></table>";
			
			
		});
		
	}
	
}

function setPortData(taskname, portinfo){
	var portentry = document.getElementById(taskname+"/"+portinfo.name);
		
		
		var text = portinfo.direction + ": " + portinfo.name + " : " + portinfo.type.name + "<br>";
		//text += "Value:";
		portentry.innerHTML = text;
		
		var value;
		if (portinfo.direction=="input"){
			value = document.createElement("div");	
		}else{
			value = document.createElement("pre");
		}
		
		
		
		
		var dataid = taskname.replace("/","") + portinfo.name + "data" ;
		value.setAttribute("id", dataid);
		portentry.appendChild(value);


		portentry.innerHTML += "<br><br>";

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

function readTypeInfo(taskname,portname,command){
	var url = "http://localhost:9292/tasks/"+taskname+"/ports/"+portname;
	console.log("readTypeInfo: " + url);
	
	//var jsonportreader = $.getJSON(url);
	
	var jsonportreader = loadJSON( url );
	
	jsonportreader.done(function(data){
		command(data.port);
	});	
}
