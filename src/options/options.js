var userLang = navigator.language || navigator.userLanguage;
userLang = userLang.substring(0, 2);
// userLang = "vi";
if (!messages[userLang]) {
    userLang = 'en';
}
// userLang='fr';
var paypalButtonVal = (messages[userLang]['btnSubmitPayPal']).replace('{}', 2);
$("#paypal-button").val(paypalButtonVal);

$(function() {
    $("[i18n]").each(function() {
        var message = messages[userLang][$(this).attr("i18n")];
        if (message) {
            $(this).html(message);
        }
    });

});

function updateNumber(number) {
    var strCount = messages[userLang]['msgCountNumber'].replace("{0}", "<b style='color:red'>" + number + "</b>");
    $("[i18n='msgCountNumber']").html(strCount);
}

function getMsg(msgId){
    return messages[userLang][msgId];
}

function updateLinkAnchorTag(anchorSelector) {
    var anchor = $(anchorSelector);
    var urlReview = anchor.attr("href");
    urlReview += "?hl=" + userLang;
    anchor.attr("href", urlReview);
}


// Saves options to chrome.storage
(function() {
    $("#options").on("input focusout", function(event) {
        event.preventDefault();
        var google = document.getElementById('google').value;
        var google_time = document.getElementById('google-time').value;
        var facebook = document.getElementById('facebook').value;
        var facebook_time = document.getElementById('facebook-time').value;
        var twitter_time = document.getElementById('twitter-time').value;
        var numberOfScroll = document.getElementById('auto-scroll-times').value;
        var youtubeCheck = getCheckBoxValue('youtube-like');
        var googleAnalytic = getCheckBoxValue('google-analytic');
        var allowAutoLike = getCheckBoxValue('allow-auto-like');
        var autoLikeTime = document.getElementById('auto-like-time').value;
        var facebookReactionType = document.getElementById('facebook-reaction-type').value;

        log.debug(youtubeCheck);
        chrome.storage.sync.set({
            "google": google,
            "google_time": google_time,
            "facebook": facebook,
            "facebook_time": facebook_time,
            "twitter_time": twitter_time,
            "numberOfScroll": numberOfScroll,
            "youtube_like": youtubeCheck,
            'google_analytic': googleAnalytic,
            'allow-auto-like': allowAutoLike,
            'auto-like-time': autoLikeTime,
            'facebook-reaction-type': facebookReactionType
        }, function() {
            // Update status to let user know options were saved.
            var saveStatus = $('#save-success');
            saveStatus.removeClass("alert-dismissable");
            setTimeout(function() {
                saveStatus.addClass("alert-dismissable");
            }, 750);
        });
    });

    // Restores select box and checkbox state using the preferences
    // stored in chrome.storage.
    document.addEventListener('DOMContentLoaded', function restore_options() {
        chrome.storage.sync.get({
            "google": "post",
            "google_time": 1,
            "facebook": "post",
            "facebook_time": 1,
            "twitter_time": 0.8,
            "numberOfScroll": 0,
            "youtube_like": false,
            "count_number": 1,
            'google_analytic': true,
            'allow-auto-like': false,
            'auto-like-time': 5,
            'facebook-reaction-type': 2
        }, function(item) {
            document.getElementById('google').value = item['google'];
            document.getElementById('google-time').value = item['google_time'];
            document.getElementById('facebook').value = item['facebook'];
            document.getElementById('facebook-time').value = item['facebook_time'];
            document.getElementById('twitter-time').value = item['twitter_time'];
            document.getElementById('auto-scroll-times').value = item['numberOfScroll'];
            document.getElementById('auto-like-time').value = item['auto-like-time'];
            document.getElementById('facebook-reaction-type').value = item['facebook-reaction-type'];
            setCheckBoxValue("youtube-like", item['youtube_like']);
            setCheckBoxValue("google-analytic", item['google_analytic']);
            setCheckBoxValue("allow-auto-like", item['allow-auto-like']);
            updateNumber(item["count_number"]);
            // console.log(item);
            updateToolTip('facebook-reaction-type', 'msgFbReactionTypeToolTip');
        });
    });

    function setCheckBoxValue(checkBoxId, value) {
        document.getElementById(checkBoxId).checked = value;
    }

    function updateToolTip(elementId, msgId){
        var msg = getMsg(msgId);
        if( msg ){
            document.getElementById(elementId).title = msg;
        }
    }

    function getCheckBoxValue(checkboxClass) {
        var value = "false";
        var cssSelector = "." + checkboxClass + ':checked';
        if (document.querySelector(cssSelector)) {
            value = document.querySelector(cssSelector).value;
        }
        return value === 'true';
    }
    // Update the slider UI and maybe plead with the user not to pay $0
    function onSliderChange() {
        var zero = ($("#slider").val() == 0);
        $("#not-paying").toggle(zero);
        $("#payment-types").toggle(!zero);
        $("#gift").toggle(!zero);

        updateAmountFromSlider();
    }

    $("#slider").on("input change", function updateAmountFromSlider(event) {
        event.preventDefault();
        var here = $("#right-panel");
        var val = $("#slider").val();
        var offset = (val - 1) / 9 * ($("#slider").width());
        offset = (val == 10) ? (offset - 22) : offset;
        var dollars = val;
        here.find('#amt-text').css({
            "padding-left": offset
        });
        here.find('#amt-text-num').text(dollars);
        var paypalButtonVal = (messages[userLang]['btnSubmitPayPal']).replace('{}', (val * 2));
        // 'Send '+ (val*2) + ' cans with PayPal';
        here.find("#paypal-button").val(paypalButtonVal);
        var priceChoose = String((val * 2) + ' cans');
        here.find("#paypal-choose-price").val(priceChoose);
    });

    updateLinkAnchorTag("a#please-review");
})();