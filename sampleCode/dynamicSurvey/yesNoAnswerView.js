/**
 * This is the answer controller for the questions that represent a yes/no type
 * @class Controllers.dynamicSurvey.yesNoAnswerView
 */
var args = arguments[0] || {};

const LOG_TAG = '\x1b[78m\x1b[100m[dynamicSurvey/yesNoAnswerView]\x1b[39;49m ';
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
 * @property {array} questionResponses
 */
var questionResponses = args.questionResponses;

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

	// We should not display this controller if the right params are not being sent.
	if (!answerData) {
		throw 'Controller requires a valid answer params';
		return;
	}

	var yesAnswer = _.find(answerData, function (_answer) {
		return _answer.value == 'Yes';
	});

	$.yesView.questionId = questionId;
	$.yesView.value = 'yes';
	$.yesView.answer = yesAnswer;

	var noAnswer = _.find(answerData, function (_answer) {
		return _answer.value == 'No';
	});

	$.noView.questionId = questionId;
	$.noView.value = 'no';
	$.noView.answer = noAnswer;

	if (isReadOnly) {
		$.answerView.touchEnabled = false;
		if (questionResponses[0] && questionResponses[0].responseId) {
			if (yesAnswer.id === questionResponses[0].responseId) {
				$.yesView.backgroundColor = $.yesView.backgroundColorSelected;
				$.yesLabel.color = $.yesLabel.colorSelected;
			} else if (noAnswer.id === questionResponses[0].responseId) {
				$.noView.backgroundColor = $.noView.backgroundColorSelected;
				$.noLabel.color = $.noLabel.colorSelected;
			}
		}
	}
};

/**
 * Handles both the yes and no possible answers in this controller
 * and updates the UI with the selected buttons
 * @method handleAnswerClick
 * @private
 * @params {object} _evt
 * @return {void}
 */
function handleAnswerClick(_evt) {
	doLog && console.log(LOG_TAG, 'handleAnswerClick = ', _evt.source.value);
	if (_evt.source.value == 'yes') {
		$.yesView.backgroundColor = $.yesView.backgroundColorSelected;
		$.yesLabel.color = $.yesLabel.colorSelected;
		$.noView.backgroundColor = $.yesView.backgroundColorUnselected;
		$.noLabel.color = $.noLabel.colorUnselected;
	} else if (_evt.source.value == 'no') {
		$.noView.backgroundColor = $.noView.backgroundColorSelected;
		$.noLabel.color = $.noLabel.colorSelected;
		$.yesView.backgroundColor = $.yesView.backgroundColorUnselected;
		$.yesLabel.color = $.yesLabel.colorUnselected;
	} else {
		console.warn(LOG_TAG, 'Invalid answer selected', _evt.source.id);
	}
};

$.answerView.addEventListener('click', handleAnswerClick);

init();
