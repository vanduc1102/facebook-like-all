var DEBUG = false;
var CLICK_BUTTON = true;
function LOGGER(p){
	if(DEBUG){
		console.log(p);
	}
}
function clickOnButton(button, time, number){
	var d = $.Deferred();
	var rand = getRandom(1,1000) ;
	setTimeout(function() {
		// The root of everything
		number ++;
		LOGGER("button clicked");		
		if(!DEBUG && CLICK_BUTTON){
			button.click();
		}		
		sendNumberToActionButton(number);
	    d.resolve(number);
	}, time + rand);
	return d.promise();
}

function clickButtonListOneByOne(buttons, time, number) {
  var d = $.Deferred();
  var promise = d.promise();
  $.each(buttons, function(index, button) {
    promise = promise.then(function(response) {
    	number ++;
    	return clickOnButton(button, time, number);
    });
  });
  d.resolve();
  return promise;
}

function loadMoreByElement(cssSelector, expected){
	var d = $.Deferred();
	return clickOnElementTill(cssSelector,d, 1, expected);
}

function loadMoreByScroll(cssSelector,expected){
	var d = $.Deferred();
	return scrollWrapper(cssSelector,d,1,expected);
}

function clickOnXpathButtonTill(buttonXpath,time,expected){
	var d = $.Deferred();
	return clickOnXpathButtonRecursive(buttonXpath,d,time, 1,expected);
}

function clickOnElementTill(cssSelector,d, times, expected){
	if(expected != 0 && times == expected){
		d.resolve();
		return d.promise();
	}
	LOGGER("Load more by element  "+ times);
	clickOnElementAndWait(cssSelector).then(function(resolve){
		times ++;
		clickOnElementTill(cssSelector,d, times , expected);
	},function(reason){
		d.resolve();
	});
	return d.promise();
}

function clickOnElementAndWait(cssSelector){
	var d = $.Deferred();
	var nextPageElement = $(cssSelector).get(0);
	var rand = getRandom(1,1000) ;
	if(nextPageElement){
		setTimeout(function() {
			nextPageElement.click();
		}, 1000 + rand);
		
		setTimeout(function() {
			LOGGER("loaded next page ");
		    d.resolve();
		}, 5000 + rand);
	}else{
		d.reject();
	}
	return d.promise();
}

function scrollWrapper(cssSelector,d,times,expected){
	if(!times){
		if(expected == 5){
			d.resolve();
			return d.promise();
		}
	}else if(times == expected){
		d.resolve();
		return d.promise();
	}
	LOGGER("Load more by scroll  "+ times);
	times ++;
	scrollToBottom(cssSelector).then(function(resolve){
		scrollWrapper(cssSelector,d,times,expected);
	});
	return d.promise();
}
function clickOnXpathButtonRecursive(cssSelector, d, time, counter, expected){	
	if(counter == expected){
		d.resolve();
		return d.promise();
	}
	var button = $(cssSelector)[0];
	if(button){
		clickOnButton(button, time, counter).then(function(counter){
			clickOnXpathButtonRecursive(cssSelector, d, time, counter, expected);
		});
	}else{
		d.resolve();
	}
	return d.promise();
}

function scrollToBottom(cssSelector){
	var d = $.Deferred();
	if(cssSelector){
		 var element = $(cssSelector).get(0);
	     element.scrollTop = element.scrollHeight - element.clientHeight;
	}else{
		window.scrollTo(0,document.body.scrollHeight);
	}
	window.setTimeout(function(){
		d.resolve();		
	}, 4000 +  getRandom(1,1000));
	return d.promise();
}
function loadMoreByScrollWithSelectorCondition(scrollSelector,selectorCondition){
	var d = $.Deferred();
	return scrollToBottomConditionWrapper(scrollSelector,d,1,selectorCondition);
}

function scrollToBottomConditionWrapper(scrollbarSelector,d,times,conditionSelector){
	if(times == 50){
		LOGGER("Stop scrollToBottomConditionWrapper, cause it reach the maximum.");
		d.resolve();
		return d.promise();
	}
	LOGGER("Load more by scroll  "+ times);
	times ++;
	scrollToBottomCondition(scrollbarSelector , conditionSelector).then(function(resolve){
		scrollToBottomConditionWrapper(scrollbarSelector,d,times,conditionSelector);
	},function(reject){
		d.resolve();
	});
	return d.promise();
}

/*
* This medthod for scrolling util find nothing more of conditionSelector
* Example:
* scrollbarSelector = button container
* conditionSelector = button
* The method will stop if it find no more button after scroll.
*/
function scrollToBottomCondition(scrollbarSelector, conditionSelector){
	var d = $.Deferred();
	var currentElements = $(conditionSelector);
	if(scrollbarSelector){
		var element = getFirstElement(scrollbarSelector);
		if(!element){
			d.reject();
		}
	    element.scrollTop = element.scrollHeight - element.clientHeight;
	}else{
		window.scrollTo(0,document.body.scrollHeight);
	}
	window.setTimeout(function(){
		var elementsAfterScroll  = $(conditionSelector);
		if(elementsAfterScroll.length > currentElements.length){
			LOGGER("Number of element increase from "+currentElements.length + " to " + elementsAfterScroll.length);
			d.resolve();		
		}else{
			LOGGER("Number of element not change, Stop scroll");
			d.reject();
		}
	}, 4000 +  getRandom(1,1000));
	return d.promise();
}

function getRandom(min,max){
	return Math.floor(Math.random() * max) + min ;
}

function openPage(url){
	var d = $.Deferred();
	window.location.href = url;
	window.setTimeout(function(){
		d.resolve();		
	}, 4000 +  getRandom(1,1000));
	return d.promise();
}
function getFullUrl(){
	return window.location.href;
}

function sendNumberToActionButton(number){
	if(!chrome.runtime){
		return;
	}
	chrome.runtime.sendMessage({count: number}, function(response) {
		//console.log(response);
	});  
}

function checkLinkInLinks(link, links) {
    var len = links.length;
    for(var i = 0 ; i < len;i++)
    {
        if(link.indexOf(links[i]) > -1){
        	return true;
        }
    }
    return false;
}
function xPath(xpth){
	var jpgLinks    = document.evaluate (
	    xpth,
	    document,
	    null,
	    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
	    null
	);
	var numLinks    = jpgLinks.snapshotLength;
	var result = [];
	for (var J = 0;  J < numLinks;  ++J) {
	    var thisLink = jpgLinks.snapshotItem (J);
	    result.push(thisLink);
	}
	return result;
}

function getFirstElement(cssSelector){
	var elements = $(cssSelector).filter(function(index){
		return $(this).is(":visible");
	});
	return elements.get(0);
}

function getAllVisible(elements){
	var visibleElements = elements.filter(function(index){
		return $(this).is(":visible");
	});
	return visibleElements;
}
function isVisbile(element){
	return element.is(":visible");
}