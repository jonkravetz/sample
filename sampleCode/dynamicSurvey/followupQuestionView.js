/**
 * This is the controller for the activity displayed for activityAnswer.
 * @class Controllers.dynamicSurvey.activityView
 */
var args = arguments[0] || {};

const LOG_TAG = '\x1b[78m\x1b[100m[dynamicSurvey/activityView]\x1b[39;49m ';
var doLog = Alloy.Globals.doLog;

/**
 * @property {object} followupQuestion;
 */
var questionData = args.followupQuestion;

/**
 * @property {Ti.UI.View} answerSelected 
 */
var answerSelected = null;

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
	if (!questionData) {
		throw 'Controller requires valid question/answer params';
	}

	var followupAnswerRow;
	//Assumes the first item will be on the left
	var isLeftItem = true;

	$.questionTextLabel.text = questionData.text;

	$.clarificationTextLabel.text = questionData.description;

	_.each(questionData.responses, function (_answer, _index) {

		if (isLeftItem) {
			followupAnswerRow = $.UI.create('View', {
				id: 'followupAnswerRow'
			});
		}

		var followupAnswerItemContainer = $.UI.create('View', {
			id: 'followupAnswerItemContainer'
		});

		var followupAnswerItem = $.UI.create('Button', {
			id: 'followupAnswerItem'
		});

		if (isLeftItem) {
			followupAnswerItem.left = 19;
		} else {
			followupAnswerItem.right = 19;
		}

		followupAnswerItem.applyProperties({
			answer: _answer,
			value: _answer.value,
			title: _answer.value
		});

		followupAnswerItemContainer.add(followupAnswerItem);
		followupAnswerRow.add(followupAnswerItemContainer);

		if (isReadOnly) {
			if (questionResponses[0] && questionResponses[0].responseId && (_answer.id === questionResponses[0].responseId)) {
				followupAnswerItem.applyProperties({
					backgroundColor: answerSelected.backgroundColorSelected,
					color: answerSelected.colorSelected
				});
			}
		}

		if (!isLeftItem || _index === questionData.responses.length - 1) {
			$.followupAnswerView.add(followupAnswerRow);
			isLeftItem = true;
		} else {
			isLeftItem = false;
		}

	});

	if (isReadOnly) {
		$.followupAnswerView.touchEnabled = false;

	}

};

/**
 * Handles the UI of the answers
 * @method handleFollowupAnswerClick
 * @private
 * @params {object} _evt
 * @return {void}
 */
function handleFollowupAnswerClick(_evt) {
	if (!_evt.source.value) {
		return;
	}
	doLog && console.log(LOG_TAG, 'handleAnswerClick = ', _evt.source.value);
	// Unselects the last answer
	if (answerSelected && answerSelected != _evt.source) {
		answerSelected.applyProperties({
			backgroundColor: answerSelected.backgroundColorUnselected,
			color: answerSelected.colorUnselected
		});
	}
	// Selects the new answer
	answerSelected = _evt.source;

	answerSelected.applyProperties({
		backgroundColor: answerSelected.backgroundColorSelected,
		color: answerSelected.colorSelected
	});

	//This callback updates the next button in the itemView controller
	args.answerCallback && args.answerCallback(questionData.id, answerSelected.answer);
};

$.followupAnswerView.addEventListener('click', handleFollowupAnswerClick);

init();
