var command;
var m2durl;
function motion2dinit(url){
	if (typeof rockUrls === 'undefined' || typeof rockUrls["m2d"] === 'undefined'){
		m2durl = url;
	}else{
		console.log("url override");
		m2durl = rockUrls["m2d"];
	}
	
	getType(m2durl,function(data){
		command=data;
		console.log(data);
		command.translation = 0;
		command.rotation = 0;
		addMotion2DControl();
		//TODO make ui visible
	});
}
function addMotion2DControl(){
	var target = document.getElementById('m2d');
	//target.innerHTML = document.getElementById('Motion2DControl').innerHTML;
	target.innerHTML = getMotion2DHTML();
};
function stop(){
	command.translation = 0;
	command.rotation = 0;
	console.log(command);
	sendJSON(m2durl+"/write",command);
};
function translation(value){
	command.translation += value;
	console.log(command);
	sendJSON(m2durl+"/write",command);
};
function rotation(value){
	command.rotation += value;
	console.log(command);
	sendJSON(m2durl+"/write",command);
};

function getMotion2DHTML(){
	var html = '\
<div id=\"m2d\"> \
    <table border=0> \
	<tr> \
	<td></td> \
	<td class="clickable"><img src="images/120px-Arrow_Blue_Up_001.svg.png" alt="forward" onclick="translation(0.1);" style="height: 50px; width: 50px;" ></td> \
	<td></td> \
	</tr> \
	<tr> \
	<td class="clickable"><img src="images/120px-Arrow_Blue_Left_001.svg.png" alt="left" onclick="rotation(0.1);" style="height: 50px; width: 50px;" ></td> \
	<td class="clickable"><img src="images/120px-Stop_hand.svg.png" alt="stop" onclick="stop();" style="height: 50px; width: 50px; "></td> \
	<td class="clickable"><img src="images/120px-Arrow_Blue_Right_001.svg.png" alt="right" onclick="rotation(0.1);" style="height: 50px; width: 50px;" ></td> \
	</tr> \
	<tr> \
	<td></td> \
	<td class="clickable"><img src="images/120px-Arrow_Blue_Down_001.svg.png" alt="backward" onclick="translation(-0.1);" style="height: 50px; width: 50px;" ></td> \
	<td></td> \
	</tr> \
	</table> \
</div> ';
	return html;
};

