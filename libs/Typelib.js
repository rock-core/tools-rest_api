
function getTypeText(portinfo,type){
	
	if (portinfo.type.class == "Typelib::NumericType"){
		return type.sample
	}else if (portinfo.type.class == "Typelib::CompoundType"){
		return JSON.stringify(type,null," ");
		console.log(text);
	}else if (portinfo.type.class == "Typelib::opaque"){
		return JSON.stringify(type,null," ");
	}
	
	return "";
};

