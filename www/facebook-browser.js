var FB = window.require('fb');
var logoutUrl;

exports.getLoginStatus = function getLoginStatus(s, f) {

}

exports.showDialog = function showDialog(options, s, f) {

}

// Attach this to a UI element, this requires user interaction.
exports.login = function login(permissions, s, f) {
    var scope = permissions.join(',');
    var fbUrl = 'https://www.facebook.com/v2.8/dialog/oauth?client_id=APP_ID&redirect_uri=https://www.facebook.com/connect/login_success.html&response_type=token&display=popup&scope=' + scope;
    var webview = document.createElement('webview');
    webview.setAttribute('id', 'facebook-login');
    webview.setAttribute('partition', 'persist:facebookconnect.tuto.com');
    webview.setAttribute('style', 'opacity:0;');
    webview.src = fbUrl;
    var el = document.getElementById('background-loading-facebook');
    el.appendChild(webview);
    webview.addEventListener('loadcommit', _loadcommit);

    function _loadcommit(event) {
        var currUrl = document.createElement('a');
        currUrl.href = event.url;
        if (currUrl.hostname === 'www.facebook.com' && currUrl.pathname === '/login.php') {
            if(!el.hasAttribute('login-loaded')) {
                webview.setAttribute('style', 'opacity:1;');
                el.setAttribute('login-loaded', '');
            }
        } else {
            _parseAndProcess(event);
        }
    }

    //Parse event and process if needed
    function _parseAndProcess(event) {
        var splitUrl = event.url.split('?');
        var params = (splitUrl[1]) ? splitUrl[1] : event.url.split('#')[1];
        var paramsSplited = params.split('&');
        var paramsArr = [];

        paramsSplited.forEach(function (param) {
            var splited = param.split('=');
            paramsArr[splited[0]] = splited[1];
        });

        if (typeof paramsArr['access_token'] !== 'undefined') {
            FB.options({version: 'v2.7', app_id: APP_ID});
            FB.setAccessToken(paramsArr['access_token']);
            s({authResponse: paramsArr['access_token'], status: "connected"});
        } else {
            f(paramsArr);
        }

        webview.removeEventListener('loadcommit', _loadcommit);
    }
}

exports.getAccessToken = function getAccessToken(s, f) {
    s(FB.getAccessToken());
}

exports.logEvent = function logEvent(eventName, params, valueToSum, s, f) {
    f('not supported by NW browser');
}

exports.logPurchase = function logPurchase(value, currency, s, f) {
    f('not supported by NW browser');
}

exports.appInvite = function appInvite(options, s, f) {
    f('not supported by NW browser');
}

exports.logout = function logout(s, f) {
    if (logoutUrl) {
        logoutUrl = logoutUrl.replace('%7BURL_NEXT%7D', 'http://tuto.com');
        console.log(logoutUrl);
        var webview = document.createElement('webview');
        webview.setAttribute('partition', 'persist:facebookconnect.tuto.com');
        webview.src = logoutUrl;
        document.body.appendChild(webview);
        var loadredirect = function () {
            webview.removeEventListener('loadredirect', loadredirect);
            // document.body.removeChild(webview);
            s('disconnected from facebook');
        };
        webview.addEventListener('loadredirect', loadredirect);
    } else {
        f('logout url not set');
    }
}

exports.api = function api(graphPath, permissions, s, f) {
    FB.api(graphPath, {fields: permissions}, function (res) {
        if (!res || res.error) {
            f(!res ? 'error occurred' : res.error);
        } else if (res.email !== undefined) {
            s(res);
        } else {
            f('ApiRequestFailed');
        }
    });
}

exports.storeLogoutUrl = function (url) {
    logoutUrl = url;
}

exports.browserInit = function browserInit(appId, version, s) {
    console.warn("browserInit is deprecated and may be removed in the future");
    console.trace();
}
