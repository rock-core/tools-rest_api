
//http://stackoverflow.com/questions/17460116/expand-and-collapse-a-div-using-javascript



function createCollapsable(content, openname, closename){
	var outer = document.createElement("div");
	outer.setAttribute("class","collapsablecontainer");
	
	var head = document.createElement("div");
	head.setAttribute("class","collapsableheader");
	head.innerHTML = openname;
	
	
	var coll = document.createElement("div");
	coll.setAttribute("class","collapsablecontent");
	
	outer.appendChild(head);
	startCollapsable(head, openname, closename);
	outer.appendChild(coll);
	coll.appendChild(content);
	
	
	return outer;
}


//to be called after adding to doc, change click behavior
function startCollapsable(element, openname, closename){
	$(element).click(function () {
		$header = $(this);
		//getting the next element
		$content = $header.next();
		//open up the content needed - toggle the slide- if visible, slide up, if not slidedown.
		$content.slideToggle(500, function () {
			//execute this after slideToggle is done
			//change text of header based on visibility of content div
			$header.text(function () {
				//change text based on condition
				return $content.is(":visible") ? closename : openname;
			});
		});
	
	});
}

function invertCollapseState(){
	$('.collapsableheader').click();
}

