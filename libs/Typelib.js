

var types = {};

function getTypeOf(url, callback){
	var type = types[url];
	//console.log(types);
	if (typeof type == 'undefined'){
		//request
		console.log("requesting type of port "+ url);
		readTypeInfo(url, callback);
	}else{
		callback(type);
	}

}


function readTypeInfo(url, callback){

	//console.log("readTypeInfo: " + url);
	
	//var jsonportreader = $.getJSON(url);
	
	var jsonportreader = loadJSON( url );
	
	jsonportreader.done(function(data){
		types[url] = data.port;
		callback(data.port);
	});	
}



function getPortContentAsText(portinfo,type, seperator){
	
	if (portinfo.type.class == "Typelib::NumericType"){
		return type.sample
	}else if (portinfo.type.class == "Typelib::CompoundType"){
		if (portinfo.type.name == "/base/Time"){
			var date = new Date (type.sample.microseconds/1000);
			var res = date.toLocaleString();
			console.log(res);
			return res
			//return JSON.stringify(date,null,seperator);
		} 
		return JSON.stringify(type.sample,null,seperator);
		console.log(text);
	}else if (portinfo.type.class == "Typelib::opaque"){
		return JSON.stringify(type.sample,null,seperator);
	}
	
	return "";
};

function getFormElement(fieldObject, name){
	var returncontainer = document.createElement("div"); 
	if (fieldObject.type.class == "Typelib::NumericType" || fieldObject.type.class == "Typelib::opaque"){
		var input = document.createElement("input");
		input.setAttribute("name",name);
		input.setAttribute("type","number");
		input.setAttribute("value","0.0");
		if (fieldObject.type.name == "/float"
			|| fieldObject.type.name == "/double"
		){
			input.setAttribute("step","0.1");
		}
		else if (fieldObject.type.name == "/int32_t"){ 
			input.setAttribute("type","number");
			input.setAttribute("step","1");
		}
		else{
			//return "type" + fieldObject.type.name + "not supported";
		}
		returncontainer.appendChild(input);
	}else if(fieldObject.type.class == "Typelib::CompoundType"){
		returncontainer.innerHTML= "Typelib::CompoundType cannot be set"
		console.log(fieldObject);
	}else if(fieldObject.type.class == "Typelib::ContainerType"){
		returncontainer.innerHTML= "Typelib::ContainerType cannot be set"
	}
	return returncontainer;
	
}

function generateForm(taskname,portinfo,id){
	
	//http://stackoverflow.com/questions/17460116/expand-and-collapse-a-div-using-javascript
	
	var form = document.createElement("form");
	//console.log(portinfo);
	var action = "http://localhost:9292/tasks/"+taskname+"/ports/"+portinfo.name;
	form.setAttribute("action",action);
	form.setAttribute("method","post");
	form.setAttribute("id","form"+id);
	
	var table = document.createElement("table");
	form.appendChild(table);
	
	var submit = document.createElement("input");
	submit.setAttribute("type","button");
	submit.setAttribute("value","submit");
	submit.setAttribute("onclick","sendForm(\"form"+id+"\")")
	form.appendChild(submit); 
	
	if (portinfo.type.class == "Typelib::NumericType"){
		var tr = document.createElement("tr");
		table.appendChild(tr);
		
		var td = document.createElement("td");
		tr.appendChild(td);
		td.innerHTML = portinfo.name;
		
		td = document.createElement("td");
		tr.appendChild(td);
		td.appendChild(getFormElement(portinfo,portinfo.name));
	}else if (portinfo.type.class == "Typelib::CompoundType"){
		for (var index = 0;index < portinfo.type.fields.length;index++){
			var tr = document.createElement("tr");
			table.appendChild(tr);
			
			var td = document.createElement("td");
			tr.appendChild(td);
			td.innerHTML = portinfo.type.fields[index].name;
			
			td = document.createElement("td");
			tr.appendChild(td);
			td.appendChild(getFormElement(portinfo.type.fields[index],portinfo.type.fields[index].name));
		}
	}
	return form;
}