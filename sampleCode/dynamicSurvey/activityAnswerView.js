/**
 * This is the answer controller for the questions that add an activity
 * @class Controllers.dynamicSurvey.activityAnswerView
 */
var args = arguments[0] || {};

const LOG_TAG = '\x1b[78m\x1b[100m[dynamicSurvey/activityAnswerView]\x1b[39;49m ';
var doLog = Alloy.Globals.doLog;

/**
 * @property {string} questionId
 */
var questionId = args.questionId;

/**
 * @property {object} answerData
 */
var answerData = args.answerData;

/**
 * @property {string} isReadOnly
 */
var isReadOnly = args.isReadOnly;

/**
 * Initializes the controller
 * @method init
 * @private
 * @return {void}
 */
function init() {

	$.activityButton.applyProperties({
		questionId: questionId,
		answer: answerData[0],
		value: 'Add Activity',
		title: L('inservice_detail_button_add')
	});

	$.taskButton.applyProperties({
		value: 'Add Task',
		title: L('add_task_header')
	});

	if (isReadOnly) {
		$.answerView.touchEnabled = false;

		$.activityButton.visible = false;
		$.taskButton.enabled = false;
	}

	if (args.addedActivity && args.addedActivity.id) {

		$.activityButton.applyProperties({
			action: 'editInservice',
			value: 'Edit Activity',
			title: L('inservice_detail_button_edit')
		});

		$.taskButton.applyProperties({
			visible: true,
			enabled: true
		});
	}
}

init();
