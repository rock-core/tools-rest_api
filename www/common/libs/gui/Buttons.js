
function createButton(text, onclick){
	var btn = document.createElement("input");
	btn.setAttribute("type","button");
	btn.setAttribute("value",text);
	
	//if (!onclick==='undefined'){
		btn.setAttribute("onclick",onclick);
	//} 
	
	return btn;
}

