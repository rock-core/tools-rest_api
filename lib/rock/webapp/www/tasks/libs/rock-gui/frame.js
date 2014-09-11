
function frame(url,id){
	window[id] = new FrameDisplay(url,id);
	
//	getType(url,function(data){
//		window[id].frame=data;
//		//console.log(data);
////		window[id].frame.translation = 0;
////		window[id].frame.rotation = 0;
		window[id].addFrameDisplay();
//	});
}


function FrameDisplay(url, id){
	this.id = id;
	this.Frame = {};
	this.url = url;
	this.image;
	this.canvas;
	this.ctx;
	
	var frameDisplay = this;
	
	
	this.addFrameDisplay = function (){
		var target = document.getElementById(id);
		//target.innerHTML = document.getElementById('Motion2DControl').innerHTML;
		target.innerHTML = getFrameHTML(this.id);
		this.canvas = document.getElementById(this.id+"Canvas");
	};
	
	this.updateImage = function(frame){
		console.log("updateImage");
		if (typeof this.image === 'undefined'){
			this.ctx = this.canvas.getContext("2d");
			this.image = this.ctx.createImageData(frame.size.width,frame.size.height);
			this.canvas.setAttribute("width",frame.size.width);
			this.canvas.setAttribute("height",frame.size.height);
			
		}
		
		for (var i=0, y=0;i<this.image.data.length;i+=4)
		  {
			this.image.data[i]=frame.image[y++];
			this.image.data[i+1]=frame.image[y++];
			this.image.data[i+2]=frame.image[y++];
			this.image.data[i+3]=255;
		  }
		this.ctx.putImageData(this.image,0,0);
		//todo: update a html canvas
	};
	
	this.play = function (){
		createWebSocket(url.replace(/http:\/\//,"ws://")+"/read",function(frame){
			frameDisplay.updateImage(frame.value);
		});
	}
	
	this.stop = function(){
		deleteWebSocket(url.replace(/http:\/\//,"ws://")+"/read");
	}
	
	return this;
}


function getFrameHTML(id){
	var html = '\
<div> \
	<input type="button" value="play" onclick="window[\''+id+'\'].play()"/> \
	<input type="button" value="stop" onclick="window[\''+id+'\'].stop()"/>\
    <canvas id=\"'+id+'Canvas\" width=\"640\" height=\"480\" style=\"border:1px solid #000000;\"/> \
</div> ';
	return html;
};

