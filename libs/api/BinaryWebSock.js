

function debug(string) {
	var element = document.getElementById("debug")
	var p = document.createElement("p")
	p.appendChild(document.createTextNode(string))
	element.appendChild(p)
}
function status(string){
	var element = document.getElementById("status")
	element.innerHTML=string
}

function BinaryWebSock(ip,port,buffersize_byte){
	var ws = new WebSocket("ws://"+ip+":"+port)
	var msgbuf = new ArrayBuffer(buffersize_byte); // 256-byte ArrayBuffer
	var messageview = DataView(msgbuf) //DataView

	//for the binary parser
	var recvbuffer = new ArrayBuffer(buffersize_byte);
	var fileReader = new FileReader()
	fileReader.onload = function() {
		recvbuffer = this.result
	}

	ws.onmessage = function(evt) {
		fileReader.readAsArrayBuffer(evt.data)
		view = DataView(recvbuffer)
		parseBinMessage(view)
	}
	ws.onclose = function(event) {
		debug("Closed - code: " + event.code + ", reason: " + event.reason + ", wasClean: " + event.wasClean)
		var obj = document.getElementById("connbtn")
		obj.className="red"
			obj.innerHTML="disconnected"
	}
	ws.onopen = function() {
		//debug("connected...");
		var obj = document.getElementById("connbtn")
		obj.className="green"
			obj.innerHTML="connected"
	}
	
	this.send = function(type, message) {
		//debug("send " + message)
		messageview.setUint16(0,type)
		messageview.setFloat32(2,message)
		ws.send(msgbuf)
	}



	parseBinMessage = function(msgview){
		var type = msgview.getUint16(0)
		var value = msgview.getFloat32(2)
		/* 		debug("message");
			debug(type + ":" + value); */
		if (type==1){
			var slider = document.getElementById("radiusslider")
			slider.value = value
			setInnerHTML('radiusslidervalue',value)
		}
		if (type==2){
			var slider = document.getElementById("angleslider")
			slider.value = value
			setInnerHTML('angleslidervalue',value)
		}
	}

	//var msgcontent;
	//http://updates.html5rocks.com/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
};


