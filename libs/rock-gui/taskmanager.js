
function taskmanager(url,id, width, height){

	if (typeof width === 'undefined'){
		width=640;
	}
	if (typeof height === 'undefined'){
		height=900;
	}
	
	var manager = new TaskManager(url,id);
	window[id] = manager
	
	loadJSON(url+"/tasks",function(data){
		manager.insertTasks(data)
	});
	
	manager.addTaskManager();
	
	 $(function() {
		 $( "#"+id+"accordion" ).accordion({
			 collapsible: true,
			 //heightStyle: "content"
			 heightStyle: "fill"
		 });
		 });
	 $(function() {
		 $( "#"+id+"accordion-resizer" ).resizable({
		 minHeight: 140,
		 minWidth: 200,
		 resize: function() {
		 $( "#"+id+"accordion" ).accordion( "refresh" );
		 }
		 });
		 });
	 
	 $('head').append(
		 "<style> \
			 #"+id+"accordion-resizer { \
		 		padding: 10px; \
			 	width: "+width+"px; \
			 	height: "+height+"px; \
			 } \
		 </style>"
	 );
	 
}

function TaskManager(url,id){
	this.url = url;
	this.id = id;
	
	this.addTaskManager = function(){
		var target = document.getElementById(this.id);
		//target.innerHTML = document.getElementById('Motion2DControl').innerHTML;
		target.innerHTML = this.getTaskManagerHTML();
	};
	
	this.getTaskManagerHTML = function(){
		var html =' \
		<div id="'+this.id+'accordion-resizer" class="ui-widget-content"> \
			<div id="'+this.id+'accordion"> \
			</div> \
		</div>'
		return html;
	};
	
	this.addTask = function(taskname){
		var accordion = document.getElementById(this.id+"accordion");
		var taskentry = document.createElement("h3");
		taskentry.setAttribute("onclick", "window['"+this.id+"'].addPorts(\""+taskname+"\" )");
		
		var taskentryname = document.createElement("div");
		var taskentrystate = document.createElement("div");
		taskentrystate.setAttribute("id", this.id+taskname+"State");
		taskentrystate.setAttribute("style", "float: right;")
		
		taskentry.appendChild(taskentryname);
		taskentryname.appendChild(document.createTextNode(taskname));
		taskentryname.appendChild(taskentrystate);
		
		var taskdata = document.createElement("div");
		taskdata.setAttribute("id", this.id+taskname+"Data");
		accordion.appendChild(taskentry);
		accordion.appendChild(taskdata);

		
		this.updateTaskState(taskname);
	};
	
	this.insertTasks = function(taskinfo) {
		var taskmgr = this;
		taskinfo.task_names.forEach(function(elem){
			//console.log(elem);
			taskmgr.addTask(elem);
			//loadPorts(elem);
		});
		//(re-)load the accordion UI Template
		$( "#"+this.id+"accordion" ).accordion( "refresh" );
	};

	this.updateTaskState = function(taskname){
		//console.log("gettingstate" +url);
		//intentionnally using non-cached version
		var tskmgr = this;
		loadTaskInfo(this.url+"/tasks/"+taskname,function(taskinfo){
			var state = document.getElementById(tskmgr.id+taskname+"State");
			state.innerHTML=taskinfo.state
			//$( "#accordion" ).accordion( "refresh" );
		});
	};

	this.addPorts = function(taskname){
		
		var taskdata = document.getElementById(this.id+taskname+"Data");
		taskdata.innerHTML = "";
		//console.log( url );
		
		var expandall = document.createElement("div");
		expandall.innerHTML="invert views<br><br>";
		expandall.setAttribute("onclick","invertCollapseState()");
		expandall.setAttribute("class","clickable");
		taskdata.appendChild(expandall);
		
		var taskmgr = this;
		
		getTaskInfo(this.url+"/tasks/"+taskname, function(data){
			taskmgr.insertPorts(taskname,data)
		});
//		getPorts(this.url+"/tasks/"+taskname, function(data){
//			taskmgr.insertPorts(taskname,data)
//		});
	};

	this.insertPorts = function(taskname, taskinfo) {
		
		var ports = taskinfo.model.ports;
		
		//console.log( "insertPorts" );
		console.log(taskinfo);
		var taskdata = document.getElementById(this.id+taskname+"Data");
		
		var taskmgr = this;
		
		//input ports
		var head = document.createElement("h3");
		head.innerHTML="OutputPorts";
		var out =  document.createElement("h3");
		out.setAttribute("id",this.id+taskname+"Data"+"Out");
		var outcoll =  createCollapsable(head,out,"+ ", "- ");
		taskdata.appendChild(outcoll);
		ports.forEach(function(elem){
			//console.log(elem);
			if (elem.direction=="output"){
				taskmgr.addPort(taskname,elem);
			}
		});
		
		//output ports
		var head2 = document.createElement("h3");
		head2.innerHTML="InputPorts";
		var input =  document.createElement("h3");
		input.setAttribute("id",this.id+taskname+"Data"+"In");
		var incoll =  createCollapsable(head2,input,"+ ", "- ");
		taskdata.appendChild(incoll);
		ports.forEach(function(elem){
			//console.log(elem);
			if (elem.direction=="input"){
				taskmgr.addPort(taskname,elem);
			}
		});
		
		var head3 = document.createElement("h3");
		head3.innerHTML="Properties";
		var params =  document.createElement("h3");
		params.setAttribute("id",this.id+taskname+"Data"+"Properties");
		var paramscoll =  createCollapsable(head3,params,"+ ", "- ");
		taskdata.appendChild(paramscoll);
		
		taskinfo.model.properties.forEach(function(elem){
			console.log(elem);
			taskmgr.addProperty(taskname,elem);
		});
	};

	this.addPort = function(taskname, portinfo){
		
		var url = this.url+"/tasks/"+taskname;
		
		var taskdata = document.getElementById(this.id+taskname+"Data");
		var portentry = document.createElement("div");
		
		portentry.setAttribute("class", "port");
		portentry.setAttribute("title", portinfo.doc);
		portentry.setAttribute("id", this.id+taskname+"/"+portinfo.name);
		
		if (portinfo.direction == "output"){
			var outdata = document.getElementById(this.id+taskname+"Data"+"Out");
			outdata.appendChild(portentry);
		}else if (portinfo.direction == "input"){
			var indata = document.getElementById(this.id+taskname+"Data"+"In");
			indata.appendChild(portentry);
		}
		
		this.setPortData(taskname,portinfo);
		
		//fill the content
		if (portinfo.direction == "output"){
			this.updatePortValue(taskname,portinfo.name);
		}else if (portinfo.direction == "input"){
			var porturl = this.url+"/tasks/"+taskname+"/ports/"+portinfo.name;
			var taskmgr = this;
			//async call to the server, get the data type information
			getTypeInfoOf(porturl,function(portinfo){
				
				//get html element to write to
				var id = taskmgr.id + taskname.replace("/","") + portinfo.name + "data";
				var portdata = document.getElementById(id);

				//generate a html from from the type information 
				var form = generateForm(url+"/ports/"+portinfo.name+"/write", portinfo, id);

				portdata.appendChild(form);
				
			});
			
		}
		
		//taskdata.appendChild(document.createElement("br"));
		//taskdata.appendChild(document.createElement("br"));
		
		
	};

	this.setPortData = function(taskname, portinfo){
		var portentry = document.getElementById(this.id+taskname+"/"+portinfo.name);
			
			
			var text = "<b>" + portinfo.name + "</b> : "+ portinfo.type.name + "<br>";
			var p = document.createElement("div");
			p.setAttribute("class","portheader");
			p.innerHTML = text;
			
			portentry.appendChild(p);
			
			var value;
			var dataid = this.id+taskname.replace("/","") + portinfo.name;
			
			
			var container = document.createElement("div");
			
			if (portinfo.direction=="input"){
				container.setAttribute("id", dataid + "data");

				value = createCollapsable(p, container,"+ ","- ");
			}else{

				//if (portinfo.type.class == "Typelib::CompoundType" && portinfo.type.name != "/base/Time"){
					var pre = document.createElement("pre");
					pre.setAttribute("id", dataid + "data");
					
					var buttons = document.createElement("span");
					buttons.setAttribute("id", dataid + "buttons");
					
					
					var btn = document.createElement("input");
					btn.setAttribute("type","button");
					btn.setAttribute("value","reload");
					btn.setAttribute("onclick","window['"+this.id+"'].updatePortValue('"+taskname+"','"+portinfo.name+"')");
					
					//buttons.appendChild(btn);
					container.appendChild(btn);
					container.appendChild(buttons);
					container.appendChild(pre);
					
					value = createCollapsable(p, container,"+ ","- ");	
				//}else{
				//	value = document.createElement("div");
				//	value.setAttribute("id", dataid); 
				//}
			}
			
			portentry.appendChild(value);

	};

	this.updatePortValue = function(taskname, portname){
		var taskmgr = this;
		getPort( this.url+"/tasks/"+taskname+"/ports/"+portname ,function(portinfo){
		
			var readurl = taskmgr.url+"/tasks/"+taskname+"/ports/"+portinfo.name+"/read";
			

			readPort(readurl, function(data){
				//console.log(taskname+"/"+portinfo.name + " readPort")
				//console.log(data) 
				var id = taskmgr.id+ taskname.replace("/","") + portinfo.name;
				var portentry = document.getElementById(id+ "data");
				var buttons = document.getElementById(id+ "buttons");
				
				//delete existing buttons
				while (buttons.firstChild) {
					buttons.removeChild(buttons.firstChild);
				}
				
				var text = getPortContentAsText(portinfo,data," ");
				
				if (text[0] == '{'){
					//assume JSON text format
						
					//var toggle = createButton("open/close all","$(\"#"+id+"data\").JSONView('toggle');");
					//buttons.appendChild(toggle);
					
					var expand = createButton("expand","$(\"#"+id+"data\").JSONView('expand');");
					buttons.appendChild(expand);
					var collapse = createButton("collapse","$(\"#"+id+"data\").JSONView('collapse');");
					buttons.appendChild(collapse);
					
					$('#'+id+"data").JSONView(getPortContentAsText(portinfo,data,""), {collapsed: false});			
				}else{
					portentry.setAttribute("style","color:blue");
					portentry.innerHTML = text;	
				}
			});
		});
	};
	
	this.addProperty = function(taskname,info){
		console.log("addProp");
		var propentry = document.getElementById(this.id+taskname+"Data"+"Properties");
		
		var head = document.createElement("span");
		
		head.innerHTML=info.name;
		
		var content = document.createTextNode(info.type.class);
		
		var coll = createCollapsable(head,content,"+ ", "- ");
		
		coll.setAttribute("title", info.doc);
		
		propentry.appendChild(coll );
		
	}
	
}











