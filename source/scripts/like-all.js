LOGGER_CATEGORY = "Like all";
var MAX_LOAD_MORE_COMMENT = 50;
chrome.storage.sync.get({
	"google": "post",
	"google_time":"1.0",
	"facebook": "post",
	"facebook_time":"1.0",
	"twitter_time":"0.8",
	"numberOfScroll":0
  }, function(cfgData) {
  	LOGGER(cfgData);
  	addRunningBackgroundColor();
  	var scrollTimes = Number(cfgData["numberOfScroll"]) + 1; 
  	var timerPerClick = Number(cfgData["facebook_time"]) * 1000 * 2;
  	main(scrollTimes, timerPerClick);	
});

function main(scrollTimes, timerPerClick){
	LOGGER('scrollTimes '+ scrollTimes + " ; timerPerClick : "+ timerPerClick);
	loadMoreByScroll(null,scrollTimes).then(function(response){
		LOGGER('Done load more by scroll');
		var moreCommentSelecor = "a[role='button'][class='UFIPagerLink']";
		loadMoreByElement(moreCommentSelecor, MAX_LOAD_MORE_COMMENT).then(function(){
			LOGGER('Done load more by click on button');
			var buttons = $("a[role='button'][aria-pressed='false'],a[role='button'][data-ft='{\"tn\":\">\"}']");
			LOGGER('Number of buttons '+ buttons.length);	
			clickButtonListOneByOne(buttons,timerPerClick,0).then(function(done){
				sendNumberToActionButton(0);
				removeRunningBackgroundColor();
			});	
		});		
	});	
}