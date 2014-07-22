

function status(string){
	var element = document.getElementById("status");
	element.innerHTML=string;
}

function debug(string) {
	var element = document.getElementById("debug");
	var p = document.createElement("p");
	p.appendChild(document.createTextNode(string));
	element.appendChild(p);
};

function WebSock(ip, port){

	var ws = new WebSocket("ws://"+ip+":"+port);
	ws.onmessage = function(evt) { 
		status(evt.data);	
	};
	ws.onclose = function(event) {
		debug("Closed - code: " + event.code + ", reason: " + event.reason + ", wasClean: " + event.wasClean);
		var obj = document.getElementById("connbtn");
		obj.className="red";
		obj.innerHTML="disconnected";
	};
	ws.onopen = function() {
		//debug("connected...");
		var obj = document.getElementById("connbtn");
		obj.className="green";
		obj.innerHTML="connected";
	};

	this.send = function(message) {
		//debug("send " + message);
		ws.send(message);
	};

};

