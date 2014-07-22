

function WebSock(url, callback){

	var ws = new WebSocket(url);
	ws.onmessage = function(evt) { 
		console.log(evt.data);
		callback(evt.data)
	};
	ws.onclose = function(event) {
		console.log("Closed - code: " + event.code + ", reason: " + event.reason + ", wasClean: " + event.wasClean);
		//var obj = document.getElementById("connbtn");
		//obj.className="red";
		//obj.innerHTML="disconnected";
	};
	ws.onopen = function() {
		console.log("connected...");
//		var obj = document.getElementById("connbtn");
//		obj.className="green";
//		obj.innerHTML="connected";
	};

	this.send = function(message) {
		ws.send(message);
	};

};

