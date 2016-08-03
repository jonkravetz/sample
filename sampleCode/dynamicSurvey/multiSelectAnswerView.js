/**
 * This is the answer controller for the questions that represent a multiselect type
 * @class Controllers.dynamicSurvey.multiSelectAnswerView
 */
var args = arguments[0] || {};

const LOG_TAG = '\x1b[78m\x1b[100m[dynamicSurvey/singleSelectAnswerView]\x1b[39;49m ';
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

var nextArray = [];

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
		var optionBox = $.UI.create('View', {
			id: 'optionBox'
		});
		var optionLabel = $.UI.create('Label', {
			id: 'optionLabel'
		});

		optionBox.questionId = questionId;
		optionBox.answer = _answer;
		optionBox.value = _answer.value;
		optionLabel.text = _answer.value;

		if (_answer.isSelected) {
			answerSelected = optionBox;
			optionBox.backgroundColor = optionBox.backgroundColorSelected;
		}

		optionView.add(optionBox);
		optionView.add(optionLabel);
		// Remove the top property of the first element
		if (_index == 0) {
			optionView.top = 0;
		}

		if (isReadOnly) {
			//check to see if response has user result.
			_.each(questionResponses, function (_questionResponse, _index) {
				if (_questionResponse && _questionResponse.responseId) {
					if (_answer.id === questionResponses[0].responseId) {
						optionBox.backgroundColor = optionBox.backgroundColorSelected;
					}
				}
			});
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

	if (_evt.source.backgroundColor === _evt.source.backgroundColorSelected) {
		// Unselect the last answer
		_evt.source.isSelected = false;
		_evt.source.backgroundColor = _evt.source.backgroundColorUnselected;
		nextArray.splice(nextArray.indexOf(_evt.source.answer.id), 1);
	} else {
		//Select the answer
		_evt.source.isSelected = true;
		_evt.source.backgroundColor = _evt.source.backgroundColorSelected;
		nextArray.push(_evt.source.answer.id);
	}

	//Reference the array of answer ids
	_evt.source.nextArray = nextArray;
};

$.answerView.addEventListener('click', handleAnswerClick);

init();
