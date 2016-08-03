/**
 * This is the answer controller for the questions that represent a text type
 * @class Controllers.dynamicSurvey.textAnswerView
 */
var args = arguments[0] || {};

const LOG_TAG = '\x1b[78m\x1b[100m[dynamicSurvey/textAnswerView]\x1b[39;49m ';
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
		//if this is a dummy answer don't display the text.
		if (_answer.value != 'Default') {
			var textView = $.UI.create('View', {
				id: 'textView'
			});
			var textLabel = $.UI.create('Label', {
				id: 'textLabel'
			});

			textLabel.text = _answer.value;

			textView.add(textLabel);
			// Modify the top property of the first element
			if (_index == 0) {
				textView.top = 27;
			}

			$.answerView.add(textView);

		}
	});
};

init();
