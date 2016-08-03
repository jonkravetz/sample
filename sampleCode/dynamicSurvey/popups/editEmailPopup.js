/**
 * This is the controller for the edit Email popup
 * @class Controllers.dynamicSurvey.popups.editEmailPopup
 * @uses Core
 * @uses Helpers.appHelper
 * @uses Helpers.alertDialogHelper
 */
var args = arguments[0] || {};
var App = require('Core');
var appHelper = require('helpers/appHelper');
var alertDialogHelper = require('helpers/alertDialogHelper');

$.rightNavButton = $.UI.create('Button', {
	id: 'saveButton'
});

/**
 * @property {string} email
 */
var email = args.email;

/**
 * Initializes the controller
 * @method init
 * @private
 * @return {void}
 */
function init() {
	if (email && email != '') {
		$.emailLabel.value = email;
	}
}

/**
 * Callback for click save on the navigation bar
 * @method handleRightNavButtonClick
 * @private
 * @params {object} _evt
 * @return {void}
 */
function handleRightNavButtonClick(_evt) {
	var isEmailValid = appHelper.validateEmail($.emailLabel.value);

	if (!isEmailValid || $.emailLabel.value == '') {
		var dialog = alertDialogHelper.createAlertDialog({
			title: L('common_alert'),
			message: L('consent_email_wrong_format'),
			buttonNames: [L('common_ok')]
		});
		dialog.show();
		return;
	}

	email = $.emailLabel.value;

	args.saveCallback && args.saveCallback(email);
	App.closePopupDialog();
}

$.rightNavButton.addEventListener('click', handleRightNavButtonClick);

init();
