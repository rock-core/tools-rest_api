var command;
var m2durl;
function motion2d(url,id){
	
	m2durl = url;
	
	getType(m2durl,function(data){
		command=data;
		console.log(data);
		command.translation = 0;
		command.rotation = 0;
		addMotion2DControl(id);
		//TODO make ui visible
	});
}
function addMotion2DControl(id){
	var target = document.getElementById(id);
	//target.innerHTML = document.getElementById('Motion2DControl').innerHTML;
	target.innerHTML = getMotion2DHTML();
};
function updateDisplay(id){
	document.getElementById(id+"translation").innerHTML=command.translation;
	document.getElementById(id+"rotation").innerHTML=command.rotation;
}
function stop(id){
	command.translation = 0;
	command.rotation = 0;
	console.log(command);
	postObjectAsJSON(m2durl+"/write",command);
	updateDisplay(id);
};
function translation(value,id){
	command.translation += value;
	console.log(command);
	postObjectAsJSON(m2durl+"/write",command);
	updateDisplay(id);
};
function rotation(value,id){
	command.rotation += value;
	console.log(command);
	postObjectAsJSON(m2durl+"/write",command);
	updateDisplay(id);
};

function getMotion2DHTML(id){
	var html = '\
<div id=\"m2d\"> \
    <table border=0> \
	<tr> \
	<td></td> \
	<td class="clickable"><img src="images/120px-Gnome-go-up.svg.png" alt="forward" onclick="translation(0.1,'+id+');" style="height: 50px; width: 50px;" ></td> \
	<td><table> \
			<tr><td style="float:right;">speed: </td><td><span id="'+id+'translation"></span></td></tr> \
			<tr><td style="float:right;">rot: </td><td><span id="'+id+'rotation"></span></td></tr> \
		</table></td>\
	</tr> \
	<tr> \
	<td class="clickable"><img src="images/120px-Gnome-go-jump-left.svg.png" alt="left" onclick="rotation(0.1,'+id+');" style="height: 50px; width: 50px;" ></td> \
	<td class="clickable"><img src="images/120px-Stop_hand.svg.png" alt="stop" onclick="stop('+id+');" style="height: 50px; width: 50px; "></td> \
	<td class="clickable"><img src="images/120px-Gnome-go-jump-right2.svg.png" alt="right" onclick="rotation(-0.1,'+id+');" style="height: 50px; width: 50px;" ></td> \
	</tr> \
	<tr> \
	<td></td> \
	<td class="clickable"><img src="images/120px-Gnome-go-down.svg.png" alt="backward" onclick="translation(-0.1,'+id+');" style="height: 50px; width: 50px;" ></td> \
	<td></td> \
	</tr> \
	</table> \
</div> ';
	return html;
};

