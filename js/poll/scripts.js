window.onload = function() {
    window.fbName = '';
    window.fbEmail = '';
    window.fbId = '';
    window.fbLogin = false;
}

// This is called with the results from from FB.getLoginStatus().
function statusChangeCallback(response) {
    if (response.status === 'connected') {
        // Logged into your app and Facebook.
        getFbData();
    }
}

// This function is called when someone finishes with the Login
// Button.  See the onlogin handler attached to it in the sample
// code below.
function checkLoginState(story = '', target) {
	var toCheck = function () {
		if ('' != story && true === window.fbLogin) {
			_voteEnd(target);
			toSave(story, target);
		} else {
			toFbLogin();
		}
	}
	getFbData(toCheck);
}

window.fbAsyncInit = function() {
    FB.init({
        appId      : '565828741363851',
        cookie     : true,  // enable cookies to allow the server to access the session
        xfbml      : true,  // parse social plugins on this page
        version    : 'v13.0' // Specify the Graph API version to use
    });

    FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
    });
};

// Load the SDK asynchronously
(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

function toFbLogin() {
	FB.login(function(response) {
		FB.getLoginStatus(function(response) {
			statusChangeCallback(response);
		});
	}, {
		scope: 'email',
		auth_type: 'rerequest'
	});
}
// Here we run a very simple test of the Graph API after login is
// successful.  See statusChangeCallback() for when this call is made.
function getFbData(successFn = function(){}) {
    FB.api('/me/permissions', function(response) {
    });

    FB.api('/me?fields=id,name,email', function(response) {
        if (undefined != response.name && undefined != response.email && undefined != response.id) {
            window.fbName = response.name;
            window.fbEmail = response.email;
            window.fbId = response.id;
            window.fbLogin = true;
			
			successFn();
        } else {
			toFbLogin();
		}
    });
}

function toSave(story, target) {
    if ('' === window.fbId || '' === window.fbName || '' === window.fbEmail) return;

    let url = 'https://script.google.com/macros/s/AKfycbx9xCwh1w3MgvTIzbFzWnM7rzrp7vSOytyBga34W--zVVMGdWclXC_CivdlKbiJ9j3f_Q/exec';

    var data = {
        type: 'save' ,
        mail: window.fbEmail,
        name: window.fbName,
        id: window.fbId,
        story: story
    };

    var SHARE_LINK_URL = window.location.href;
    var SHARE_LINK_TEXT = '大地女力';

    $.ajax({
        type: "POST",
        dataType: "JSON",
        url: url,
        data: JSON.stringify(data),
        beforeSend: function () {
        },
        success: function (res) {
            if (true == res.isSuccess && '' != res.no) {
                if (confirm('恭喜您投票成功，今日投票序號為 ' + res.no + '\n要分享至FB嗎?')) {
                    window.open('https://www.facebook.com/sharer.php?u=' + SHARE_LINK_URL + '&quote=' + SHARE_LINK_TEXT);
                }
            } else {
                alert('今天已參加過投票，請隔日再蒞臨參加。');
            }
        },
        complete: function () {
			target.html('今日已投票')
        },
        error: function (res) {
        }
    });
}

$('[data-js="toVote"]').on('click', function () {
	let target = $(this);
    let story = $(this).data('id');
    let type = $(this).attr('data-type');

    if ('end' == type) {
        alert('今天已參加過投票，請隔日再蒞臨參加。');
        _voteEnd(target);
    } else if ((undefined !== story && '' != story)) {
        checkLoginState(story, target);
    }
});

function _voteEnd(target) {
    target.attr('data-type', 'end');
}