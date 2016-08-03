/**
 * This is the answer controller for the questions that represent a rank 5 type
 * @class Controllers.dynamicSurvey.rankAnswerView
 */
var args = arguments[0] || {};

const LOG_TAG = '\x1b[78m\x1b[100m[dynamicSurvey/rankAnswerView]\x1b[39;49m ';
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
 * @property {Ti.UI.View} answerSelected 
 */
var answerSelected = null;

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
	}

	_.each(answerData, function (_answer, _index) {
		var optionView = $.UI.create('View', {
			id: 'optionView'
		});
		var optionButton = $.UI.create('Button', {
			id: 'optionButton'
		});
		var optionLabel = $.UI.create('Label', {
			id: 'optionLabel'
		});

		optionButton.questionId = questionId;
		optionButton.answer = _answer;
		optionButton.value = _answer.value;
		optionButton.title = _index + 1;

		optionLabel.text = _answer.value;

		optionView.add(optionButton);
		optionView.add(optionLabel);

		if (isReadOnly) {
			if (questionResponses[0] && questionResponses[0].responseId && (_answer.id === questionResponses[0].responseId)) {
				optionButton.backgroundColor = optionButton.backgroundColorSelected;
			}
		}

		$.answerView.add(optionView);
	});

	if (isReadOnly) {
		$.answerView.touchEnabled = false;
	}
};

/**
 * Handles both the UI of the answers
 * @method handleAnswerClick
 * @private
 * @params {object} _evt
 * @return {void}
 */
function handleAnswerClick(_evt) {
	if (!_evt.source.value) {
		return;
	}
	doLog && console.log(LOG_TAG, 'handleAnswerClick = ', _evt.source.value);
	// Unselect the last answer
	if (answerSelected && answerSelected != _evt.source) {
		answerSelected.backgroundColor = answerSelected.backgroundColorUnselected;
	}
	// Select the new answer
	answerSelected = _evt.source;
	answerSelected.backgroundColor = answerSelected.backgroundColorSelected;
};

$.answerView.addEventListener('click', handleAnswerClick);

init();
