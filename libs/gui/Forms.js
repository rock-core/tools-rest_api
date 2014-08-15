
/**
 * generates a html form from port information ready to be sent by sendForm()
 * @param taskname
 * @param portinfo
 * @param id
 * @returns
 */
function generateForm(url,taskname,portinfo,id){
	
	//http://stackoverflow.com/questions/17460116/expand-and-collapse-a-div-using-javascript
	
	var form = document.createElement("form");
	//console.log(portinfo);
	var action = url+"/tasks/"+taskname+"/ports/"+portinfo.name+"/write";
	form.setAttribute("action",action);
	form.setAttribute("method","post");
	form.setAttribute("id","form"+id);
	
	var table = document.createElement("table");
	form.appendChild(table);
	
	var submit = document.createElement("input");
	submit.setAttribute("type","button");
	submit.setAttribute("value","submit");
	submit.setAttribute("onclick","sendForm(\"form"+id+ "\",postJSON)")
	form.appendChild(submit); 
	
	if (portinfo.type.class == "Typelib::NumericType"){
		var tr = document.createElement("tr");
		table.appendChild(tr);
		
		var td = document.createElement("td");
		tr.appendChild(td);
		td.innerHTML = portinfo.name;
		
		td = document.createElement("td");
		tr.appendChild(td);
		td.appendChild(createFormElement(portinfo));
	}else if (portinfo.type.class == "Typelib::CompoundType"){
		for (var index = 0;index < portinfo.type.fields.length;index++){
			var tr = document.createElement("tr");
			table.appendChild(tr);
			
			var td = document.createElement("td");
			tr.appendChild(td);
			td.innerHTML = portinfo.type.fields[index].name;
			
			td = document.createElement("td");
			tr.appendChild(td);
			td.appendChild(createFormElement(portinfo.type.fields[index]));
		}
	}
	return form;
}


/**
 * send a html form as JSON data
 * numbers and values are normally encoded as strings JSON{"input name":"value"}
 * special data- attributes (html5) can be used to modify that behavior
 * <input name="myname" type="number" value="0">
 * results in JSON{"myname":"0"}
 * <input name="myname" type="number" value="0" data-typelibtypeclass="Typelib::NumericType">
 * results in JSON{"myname":0}
 * without quotes, which is parsed as number and not string on the api
 * 
 * the url is taken from the <form>s action attribute
 * 
 * @param id the html id of the <form> element
 * @param sendCallback callback function with two arguments (url,formdata)
 */
function sendForm(id, sendCallback){
	console.log(id);
	//var form = document.forms[name];
	var form = document.getElementById(id);
	console.log(form);
	var url = form.action;
	//http://stackoverflow.com/questions/1255948/post-data-in-json-format-with-javascript
	
	var formdata = {};
	for (var index = 0; index < form.length; index++){
		var input = form[index];
	    if (input.name) {
	    	if (input.getAttribute("data-typelibtypeclass") == "Typelib::NumericType"){
	    		console.log("Typelib::NumericType");
	    		formdata[input.name] = parseFloat(input.value);
	    	}else{
	    		console.log("Typelib::OtherType");
	    		formdata[input.name] = input.value;
	    	}
	    }
	}

	sendCallback(url,formdata);
}


/**
 * create a html input element ans set attributed for given field desctiption object 
 * @param portinfo field desctiption object 
 * @returns {___returncontainer0}
 */
function createFormElement(portinfo){
	var returncontainer = document.createElement("div"); 
	if (portinfo.type.class == "Typelib::NumericType" || portinfo.type.class == "Typelib::opaque"){
		var input = document.createElement("input");
		input.setAttribute("name",portinfo.name);
		input.setAttribute("type","number");
		input.setAttribute("value","0.0");
		//data- is a html5 prefix, not evaluated by browsers (only for JS evaluation)
		input.setAttribute("data-typelibtypename",portinfo.type.name);
		input.setAttribute("data-typelibtypeclass",portinfo.type.class);
		if (portinfo.type.name == "/float"
			|| portinfo.type.name == "/double"
		){
			input.setAttribute("step","0.1");
		}
		else if (portinfo.type.name == "/int32_t"){ 
			input.setAttribute("type","number");
			input.setAttribute("step","1");
		}
		else{
			//return "type" + fieldObject.type.name + "not supported";
		}
		returncontainer.appendChild(input);
	}else if(portinfo.type.class == "Typelib::CompoundType"){
		returncontainer.innerHTML= "Typelib::CompoundType cannot be set"
		console.log(portinfo);
	}else if(portinfo.type.class == "Typelib::ContainerType"){
		returncontainer.innerHTML= "Typelib::ContainerType cannot be set"
	}
	return returncontainer;
	
}

