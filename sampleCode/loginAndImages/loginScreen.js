/**
 * This is the controller for the login modal screen
 * @class Controllers.login.loginScreen
 * @uses Core
 * @uses DataManager
 * @uses Modules.analytics
 */
var args = arguments[0] || {};
var App = require('Core');
var DataManager = require('DataManager');
var analytics = require('modules/analytics');

// Note: For modal screen we'll rely on this widget instead of App.loadingIndicatorStart
$.loadingIndicator = Alloy.createWidget('com.sample.loadingIndicator');

// Note: To close this window App.closeModalDialog(_optionalCallback); must be called

/**
 * Initializes the controller
 * @method init
 * @private
 * @return {void}
 */
function init() {
	analytics.capture({
		name: 'navigation.login.loginScreen'
	});
};

/**
 * @method showLoadingIndicator
 * Shows the loading indicator, in iOS this can be accesed from any of the child windows
 * @param {String} _message
 * @return {void}
 */
$.showLoadingIndicator = function (_message) {
	$.dialog.add($.loadingIndicator.getView());
	$.loadingIndicator.show(_message);
};

/**
 * @method hideLoadingIndicator
 * Shows the loading indicator, in iOS this can be accesed from any of the child windows
 * @return {void}
 */
$.hideLoadingIndicator = function () {
	$.loadingIndicator.hide();
	$.dialog.remove($.loadingIndicator.getView());
};

/**
 * Handles the loginButton click event
 * @method init
 * @private
 * @params {object} _evt
 * @return {void}
 */
function handleLoginButtonClickEvent(_evt) {

	if (Ti.Network.online) {

		var loginWebView = Ti.UI.createWebView({
			top: 20,
			left: 0,
			width: Ti.UI.FILL,
			height: Ti.UI.FILL,
			url: Alloy.Globals.apiServices.login,
			opacity: 0
		});

		var loadFirstTime = false;

		loginWebView.addEventListener('beforeload', function (_evt) {
			// We look for the callback URL and once we get it, we start animating the webview to disappear.
			if (_evt.url && _evt.url.indexOf(Alloy.Globals.apiServices.loginHostnameCallback) != -1 && _evt.url.indexOf(Alloy.Globals
					.apiServices.loginEndpointCallback) != -1) {
				loginWebView.animate({
					opacity: 0,
					duration: 500
				}, function () {
					$.showLoadingIndicator();
				});

			}
		});

		loginWebView.addEventListener('load', function (_evt) {
			loadFirstTime = true;
			// Once is loaded, we will extract the access token and token type from the body of the HTML
			if (_evt.url && _evt.url.indexOf(Alloy.Globals.apiServices.loginHostnameCallback) != -1 && _evt.url.indexOf(Alloy.Globals
					.apiServices.loginEndpointCallback) != -1) {

				// Remove all HTML tags
				var pageContent = loginWebView.html.replace(/<(?:.|\n)*?>/gm, '');
				try {
					// Parse the response of the page content into a JSON and validate the values
					var pemsTokenResponse = JSON.parse(pageContent);
					if (pemsTokenResponse.pemsToken != '' && pemsTokenResponse.tokenType != '') {

						$.window.remove(loginWebView);
						loginWebView = null;

						// Init the DataManager with the callback to close this screen
						DataManager.initWithToken(pemsTokenResponse.tokenType, pemsTokenResponse.pemsToken, function (_response) {
							if (_response == true) {
								// Sync data
								App.syncData();
								// Hide loading indicator
								$.hideLoadingIndicator();
								// Close modal dialog
								App.closeModalDialog();
							} else {
								// Hide loading indicator
								$.hideLoadingIndicator();
								alert('There was an error getting the user profile. Please try login again.');
							}
						});
					} else {
						// Hide loading indicator
						$.hideLoadingIndicator();
						alert('There was an error getting the access token. Please try again later.');
					}
				} catch (e) {
					// Hide loading indicator
					$.hideLoadingIndicator();
					alert('There was an error getting the access token. Please try again later.');
					console.log(e);
				}
			}
		});

		$.window.add(loginWebView);

		loginWebView.animate({
			opacity: 1,
			duration: 500
		});

		// This is a timeout in case the webview won't load.
		setTimeout(function () {
			if (loadFirstTime == false) {
				$.window.remove(loginWebView);
				loginWebView = null;
				alert('There was an error while trying to connect to the server. Please try again later.');
			}
		}, 10000);

	} else {

		alert('Please connect to internet to login.');

	}
};

$.loginButton.addEventListener('click', handleLoginButtonClickEvent);

init();
