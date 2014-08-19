
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
		getPorts(this.url+"/tasks/"+taskname, function(data){
			console.log(data)
			taskmgr.insertPorts(taskname,data)
		});
	};

	this.insertPorts = function(taskname, ports) {
		//console.log( "insertPorts" );
		//console.log(content);
		var taskmgr = this;
		ports.forEach(function(elem){
			//console.log(elem);
			if (elem.direction=="output"){
				taskmgr.addPort(taskname,elem);
			}
		});
		ports.forEach(function(elem){
			//console.log(elem);
			if (elem.direction=="input"){
				taskmgr.addPort(taskname,elem);
			}
		});
	};

	this.addPort = function(taskname, portinfo){
		
		var url = this.url+"/tasks/"+taskname;
		
		var taskdata = document.getElementById(this.id+taskname+"Data");
		var portentry = document.createElement("div");
		taskdata.appendChild(portentry);
		portentry.setAttribute("class", "port");
		portentry.setAttribute("title", portinfo.doc);
		portentry.setAttribute("id", this.id+taskname+"/"+portinfo.name);
		this.setPortData(taskname,portinfo);
		
		console.log(portinfo);
		
		if (portinfo.direction == "output"){
			this.updatePortValue(taskname,portinfo);
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
				
				var coll = createCollapsable(form,"Edit","Close");	

				portdata.appendChild(coll);
				
			});
			
		}
		
		taskdata.appendChild(document.createElement("br"));
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
			var dataid = this.id+taskname.replace("/","") + portinfo.name + "data" ;
			
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

	};

	this.updatePortValue = function(taskname, portinfo){
		var readurl = this.url+"/tasks/"+taskname+"/ports/"+portinfo.name+"/read;
		var taskmgr = this;
		readPort(readurl, function(data){
			//console.log(taskname+"/"+portinfo.name + " readPort")
			//console.log(data) 
			var id = taskmgr.id+ taskname.replace("/","") + portinfo.name + "data";
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
	};
	
}











