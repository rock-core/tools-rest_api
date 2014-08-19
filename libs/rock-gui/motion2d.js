
function motion2d(url,id){
	
	console.log(id);
	
	window[id] = new Motion2d(url,id);
	
	getType(url,function(data){
		window[id].command=data;
		//console.log(data);
		window[id].command.translation = 0;
		window[id].command.rotation = 0;
		window[id].addMotion2DControl();
	});
	
	console.log(window);
}


function Motion2d(url, id){
	console.log(id);
	
	this.id = id;
	this.command = {};
	this.url = url;
	
	this.addMotion2DControl = function (){
		var target = document.getElementById(this.id);
		//target.innerHTML = document.getElementById('Motion2DControl').innerHTML;
		target.innerHTML = getMotion2DHTML(this.id);
	}
	
	this.updateDisplay = function(){
		console.log(this.id);
		document.getElementById(this.id+"translation").innerHTML=this.command.translation;
		document.getElementById(this.id+"rotation").innerHTML=this.command.rotation;
	}
	this.stop = function(){
		this.command.translation = 0;
		this.command.rotation = 0;
		console.log(this.command);
		postObjectAsJSON(this.url+"/write",this.command);
		this.updateDisplay();
	};
	this.translation = function (value){
		this.command.translation += value;
		console.log(this.command);
		postObjectAsJSON(this.url+"/write",this.command);
		this.updateDisplay();
	};
	this.rotation = function (value){
		this.command.rotation += value;
		console.log(this.command);
		postObjectAsJSON(this.url+"/write",this.command);
		this.updateDisplay();
	};
	return this;
}


function getMotion2DHTML(id){
	var html = '\
<div id=\"m2d\"> \
    <table border=0> \
	<tr> \
	<td></td> \
	<td class="clickable"><img src="images/120px-Gnome-go-up.svg.png" alt="forward" onclick="window[\''+id+'\'].translation(0.1);" style="height: 50px; width: 50px;" ></td> \
	<td><table> \
			<tr><td style="float:right;">speed: </td><td><span id="'+id+'translation">0</span></td></tr> \
			<tr><td style="float:right;">rot: </td><td><span id="'+id+'rotation">0</span></td></tr> \
		</table></td>\
	</tr> \
	<tr> \
	<td class="clickable"><img src="images/120px-Gnome-go-jump-left.svg.png" alt="left" onclick="window[\''+id+'\'].rotation(0.1);" style="height: 50px; width: 50px;" ></td> \
	<td class="clickable"><img src="images/120px-Stop_hand.svg.png" alt="stop" onclick="window[\''+id+'\'].stop();" style="height: 50px; width: 50px; "></td> \
	<td class="clickable"><img src="images/120px-Gnome-go-jump-right2.svg.png" alt="right" onclick="window[\''+id+'\'].rotation(-0.1);" style="height: 50px; width: 50px;" ></td> \
	</tr> \
	<tr> \
	<td></td> \
	<td class="clickable"><img src="images/120px-Gnome-go-down.svg.png" alt="backward" onclick="window[\''+id+'\'].translation(-0.1);" style="height: 50px; width: 50px;" ></td> \
	<td></td> \
	</tr> \
	</table> \
</div> ';
	return html;
};

