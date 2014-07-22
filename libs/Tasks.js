

function status(string){
	var element = document.getElementById("status");
	element.innerHTML=string;
}

function addTask(taskname){
	var accordion = document.getElementById("accordion");
	var taskentry = document.createElement("h3");
	var taskdata = document.createElement("div");
	accordion.appendChild(taskentry);
	accordion.appendChild(taskdata);
	taskentry.appendChild(document.createTextNode(taskname));
}

function insertTask(content) {
    //document.getElementById('output').innerHTML = content;
	//document.getElementById("tasksjson").appendChild(document.createTextNode("callback"));
	console.log(content);
    json = JSON.parse(content);
    
    document.getElementById("tasksjson").innerHTML="json";
	//document.getElementById("tasksjson").innerHTML=json.toSource();
	//.innerHTML=json.toSource();
};

//http://stackoverflow.com/questions/2499567/how-to-make-a-json-call-to-a-url/2499647#2499647
function getJSONP(url, success) {

    var ud = '_' + +new Date,
        script = document.createElement('script'),
        head = document.getElementsByTagName('head')[0] 
               || document.documentElement;

    window[ud] = function(data) {
        head.removeChild(script);
        success && success(data);
    };

    script.src = url.replace('callback=?', 'callback=' + ud);
    head.appendChild(script);

}
  

function loadTasks(){
	console.log( "loadTasks" );
	var jsonloader = jQuery.getJSON("http://localhost:9292/tasks");
	jsonloader.done(function(data){
		console.log( "complete");
		insertTask(data);
		console.log( "second complete" );
	});
//	getJSONP('http://localhost:9292/tasks', function(data){
//	    console.log(data);
//	});
//	tasks = document.createElement('a');
//	tasks.href = "http://localhost:9292/tasks"
//	taskelem = document.getElementById("tasks_json");
//	taskelem.appendChild(document.createTextNode(JSON.stringify(tasks)));
//	taskelem.appendChild(tasks);
//		
	//loadUrl('http://localhost:9292/tasks')
	
	addTask("test");
	
	addTask("test2");
	
	
};

function loadTasksWs(){
	console.log( "loadTasksWs" );
}

