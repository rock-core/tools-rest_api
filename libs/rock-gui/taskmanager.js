
function taskmanager(url,id){

	loadTasks(url,insertTasks);
	
	addTaskManager(id);
	
	 $(function() {
		 $( "#accordion" ).accordion({
			 collapsible: true,
			 //heightStyle: "content"
			 heightStyle: "fill"
		 });
		 });
	 $(function() {
		 $( "#accordion-resizer" ).resizable({
		 minHeight: 140,
		 minWidth: 200,
		 resize: function() {
		 $( "#accordion" ).accordion( "refresh" );
		 }
		 });
		 });
	 
	 
}

function addTaskManager(id){
	var target = document.getElementById(id);
	//target.innerHTML = document.getElementById('Motion2DControl').innerHTML;
	target.innerHTML = getTaskManagerHTML();
};

function getTaskManagerHTML(){
var html =' \
<div id="accordion-resizer" class="ui-widget-content"> \
	<div id="accordion"> \
	</div> \
</div>'
return html;
}


function insertTasks(url,content) {
	content.task_names.forEach(function(elem){
		//console.log(elem);
		addTask(url,elem);
		//loadPorts(elem);
	});
	//(re-)load the accordion UI Template
	$( "#accordion" ).accordion( "refresh" );
};

function addTask(url,taskname){
	var accordion = document.getElementById("accordion");
	var taskentry = document.createElement("h3");
	taskentry.setAttribute("onclick", "addPorts(\""+url+"\", \""+taskname+"\" )");
	var taskdata = document.createElement("div");
	taskdata.setAttribute("id", taskname+"Data");
	accordion.appendChild(taskentry);
	accordion.appendChild(taskdata);
	taskentry.appendChild(document.createTextNode(taskname));
}

function addPorts(url,taskname){
	
	var taskdata = document.getElementById(taskname+"Data");
	taskdata.innerHTML = "";
	//console.log( url );
	
	var expandall = document.createElement("div");
	expandall.innerHTML="invert views<br><br>";
	expandall.setAttribute("onclick","invertCollapseState()");
	expandall.setAttribute("class","clickable");
	taskdata.appendChild(expandall);
	
	getPorts(url, taskname, insertPorts);

}

function insertPorts(url, taskname,content) {
	//console.log( "insertPorts" );
	//console.log(content);
		
	content.ports.forEach(function(elem){
		//console.log(elem);
		if (elem.direction=="output"){
			addPort(url, taskname,elem);
		}
	});
	content.ports.forEach(function(elem){
		//console.log(elem);
		if (elem.direction=="input"){
			addPort(url, taskname,elem);
		}
	});
};

function addPort(url, taskname,content){
	
	var taskdata = document.getElementById(taskname+"Data");
	var portentry = document.createElement("div");
	taskdata.appendChild(portentry);
	portentry.setAttribute("class", "port");
	portentry.setAttribute("title", content.doc);
	portentry.setAttribute("id", taskname+"/"+content.name);
	setPortData(taskname,content);
	
	if (content.direction == "output"){
		updatePortValue(url, taskname,content);
	}else if (content.direction == "input"){
		//TODO: create inputs and POST
		//request typelib info
		
		//async call to the server, get the data type information
		var murl = url+"/tasks/"+taskname+"/ports/"+content.name;
		getTypeInfoOf(murl,function(portinfo){
			
			//get html element to write to
			var id = taskname.replace("/","") + content.name + "data";
			var portdata = document.getElementById(id);

			//generate a html from from the type information 
			var form = generateForm(url, taskname, portinfo, id);
			
			var coll = createCollapsable(form,"Edit","Close");	

			portdata.appendChild(coll);
			
		});
		
	}
	
	taskdata.appendChild(document.createElement("br"));
	//taskdata.appendChild(document.createElement("br"));
	
	
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
			if (portinfo.type.class == "Typelib::CompoundType" && portinfo.type.name != "/base/Time"){
				var pre = document.createElement("pre");
				pre.setAttribute("id", dataid);
				value = createCollapsable(pre,"View","Close");	
			}else{
				value = document.createElement("div");
				value.setAttribute("id", dataid); 
			}
			
			
		}
		
		portentry.appendChild(value);

}

function updatePortValue(url, taskname, portinfo){
	var murl = url+"/tasks/"+taskname+"/ports/"+portinfo.name+"/read";
	readPort(url, taskname,portinfo.name,function(data){
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




