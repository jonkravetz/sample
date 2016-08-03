/**
 * This is the controller for the description to be displayed in answerDetailView.
 * @class Controllers.dynamicSurvey.answerDetailView
 * @uses Helpers.appHelper
 */
var args = arguments[0] || {};

const LOG_TAG = '\x1b[78m\x1b[100m[dynamicSurvey/activityView]\x1b[39;49m ';
var doLog = Alloy.Globals.doLog;
var appHelper = require('helpers/appHelper');
var moment = require('alloy/moment');

/**
 * @property {object} description
 */
var description = args;

/**
 * Initializes the controller
 * @method init
 * @private
 * @return {void}
 */
function init() {
	$.descriptionLabel.text = description;
}

init();
