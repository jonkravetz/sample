/**
 * This is the controller for the activity displayed for activityAnswer.
 * @class Controllers.dynamicSurvey.activityView
 * @uses Helpers.appHelper
 */
var args = arguments[0] || {};

const LOG_TAG = '\x1b[78m\x1b[100m[dynamicSurvey/activityView]\x1b[39;49m ';
var doLog = Alloy.Globals.doLog;
var appHelper = require('helpers/appHelper');
var moment = require('alloy/moment');

/**
 * @property {object} activity
 */
var activity = args;

/**
 * Initializes the controller
 * @method init
 * @private
 * @return {void}
 */
function init() {

	if (activity.channel === 'In-Person') {
		$.addressHeaderLabel.text = L('survey_activity_address');
		$.addressTextLabel.text = appHelper.addressFormatter(activity) || '';
		$.locationTextLabel.text = activity.locationName || '';
	} else {
		$.addressHeaderLabel.text = L('survey_activity_telephone');
		$.addressTextLabel.text = activity.telephone || '';
		$.locationTextLabel.text = L('survey_activity_phone');
	}

	$.dateTextLabel.text = activity.beginDate ? moment(activity.beginDate).format('MMM DD, YYYY') : '';
	$.timeTextLabel.text = activity.beginDate ? moment(activity.beginDate).format('h:mm A') : '';
}

init();
