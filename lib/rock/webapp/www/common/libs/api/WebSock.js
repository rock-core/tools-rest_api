

function WebSock(url, callback){

	var ws = new WebSocket(url);
	ws.onmessage = function(evt) { 
		//console.log(evt.data);
		callback(JSON.parse(evt.data));
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

	this.close = function(){
		ws.close();
	}
	
};


var websockets = {};


function deleteWebSocket(readurl){
	var websock = websockets[readurl];
	if (!(typeof websock === 'undefined')){
		websock.close();
		delete websockets[readurl];
	}else{
		console.log ("didn't find websock" + readurl);
	}
}


function createWebSocket(url, callback){
	var websocket = websockets[url];
	if (!(typeof websocket == 'undefined')){
		websocket.close();
		delete websockets[url];
	}
	websockets[url] = new WebSock(url,callback);
};

