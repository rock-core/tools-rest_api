



function actions(url,id){
	window[id] = new ActionDisplay(url,id);
	
	
	window[id].addActionDisplay();
	
	window[id].loadActions(url);

}




function ActionDisplay(url, id){
	this.id = id;
	this.Frame = {};
	this.url = url;
	this.image;
	this.canvas;
	this.ctx;
	
	var actionDisplay = this;

	
	this.startcallback = function (data){
		console.log(data)
	}
	
	this.startAction = function(actionnname){
		loadJSON(this.url+"/"+actionnname+"!/start",this.startcallback);
	}
	
	this.addActionDisplay = function (){
		var target = document.getElementById(id);
		//target.innerHTML = document.getElementById('Motion2DControl').innerHTML;
		target.innerHTML = getActionDisplayHTML(this.id);		
	};
	
	this.loadActions = function(url){
		var div = document.getElementById(this.id);
		var actions = this;
		loadJSON(this.url,function(data){
			console.log(data);
			for (var key in data){
				if (data.hasOwnProperty(key)){
					console.log(key);		
					var a = document.createElement("a");
					var br = document.createElement("br");
					a.setAttribute("class","clickable");
					a.setAttribute("onclick","window['"+actions.id+"'].startAction('"+key+"')");
					a.innerHTML=key + "!";
					div.appendChild(a);
					div.appendChild(br);
				}
			};
		});
	};

	
	return this;
}



function getActionDisplayHTML(id){
	var html = '\
<div id='+id+'> \
</div> ';
	return html;
};


