
function getTypeText(portinfo,type, seperator){
	
	if (portinfo.type.class == "Typelib::NumericType"){
		return type.sample
	}else if (portinfo.type.class == "Typelib::CompoundType"){
		return JSON.stringify(type,null,seperator);
		console.log(text);
	}else if (portinfo.type.class == "Typelib::opaque"){
		return JSON.stringify(type,null,seperator);
	}
	
	return "";
};

function getFormElement(fieldObject, name){
	var input = document.createElement("input");
	input.setAttribute("name",name);
	input.setAttribute("type","number");
	if (fieldObject.type.name == "/float"){
		input.setAttribute("step","0.1");
	}
	else if (fieldObject.type.name == "/int32_t"){ 
		input.setAttribute("type","number");
		input.setAttribute("step","1");
	}
	else{
		//return "type" + fieldObject.type.name + "not supported";
	}
	return input;
	
}
