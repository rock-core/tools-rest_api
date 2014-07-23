
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

