
var InputElements = {};
var OutputElements = {};

function createInputElement(typename, url, width, height, parent){
	//console.log("createUIElement");
	var div = document.createElement("div");
	div.setAttribute("id",url);
	parent.appendChild(div);
	var fktn = InputElements[typename];
	//console.log(fktn);
	if (typeof fktn === 'undefined'){
		//console.log("no ui element registered");
	}else{
		fktn(url,url, width, height);
	};
	return div;
};

function registerInputElement(typename, callback){
	InputElements[typename] = callback;
};


function createOutputElement(typename, url, width, height, parent){
	//console.log("createUIElement");
	var div = document.createElement("div");
	div.setAttribute("id",url);
	parent.appendChild(div);
	var fktn = OutputElements[typename];
	//console.log(fktn);
	if (typeof fktn === 'undefined'){
		//console.log("no ui element registered");
	}else{
		fktn(url,url, width, height);
	};
	return div;
};

function registerOutputElement(typename, callback){
	OutputElements[typename] = callback;
};