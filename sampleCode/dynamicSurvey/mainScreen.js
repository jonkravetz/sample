/**
 * This is the main controller for the dynamic survey
 * @class Controllers.dynamicSurvey.mainScreen
 * @uses Core
 * @uses Modules.analytics
 * @uses Helpers.alertDialogHelper
 */
var args = arguments[0] || {};
var App = require('Core');
var analytics = require('modules/analytics');
var alertDialogHelper = require('helpers/alertDialogHelper');

const LOG_TAG = '\x1b[90m\x1b[103m[dynamicSurvey/mainScreen]\x1b[39;49m ';
var doLog = Alloy.Globals.doLog;

$.leftNavButton = $.UI.create('Button', {
	id: 'leftNavCancelButton'
});

/**
 * @property {number} currentQuestionIndex
 */
var currentQuestionIndex = 0;

/**
 * @property {object} surveyData
 */
var surveyData = args.survey;

/**
 * @property {array} surveyCompletionData
 */
var surveyCompletionData = args.surveyCompletionQuestions;

/**
 * @property {object} surveyResultData
 */
var surveyResultData = args.resultData;

/**
 * @property {object} patientData
 */
var patientData = args.patient;

/**
 * @property {string} enrollmentId
 */
var enrollmentId = args.enrollmentId;

/**
 * @property {boolean} isReadOnly
 */
var isReadOnly = args.isReadOnly;

/**
 * @property {array} surveyResponse 
 */
var surveyResponse = [];

/**
 * Initializes the controller
 * @method init
 * @private
 * @return {void}
 */
function init() {
	// We should not display this controller if the right params are not being sent.
	if (!surveyData || !surveyData.questions || !surveyCompletionData || !patientData) {
		console.error(LOG_TAG, 'surveyData is ', typeof surveyData);
		console.error(LOG_TAG, 'surveyData.questions is ', typeof surveyData.questions);
		console.error(LOG_TAG, 'surveyCompletionData is ', typeof surveyCompletionData);
		console.error(LOG_TAG, 'patientData is ', typeof patientData);
		throw 'Controller requires surveyData Parameter';
		return;
	}

	// Populate the survey title and the patient
	$.titleLabel.text = surveyData.name;
	$.patientNameLabel.text = patientData.firstName + ' ' + patientData.lastName;

	// Show the first question
	addSurveyQuestion();

	analytics.capture({
		name: 'navigation.dynamicSurvey.mainScreen'
	});
}

/**
 * Add a question to the survey. This holds the logic of which question is next
 * @method addSurveyQuestion
 * @param {String} _nextQuestionId An id to identify the next question, required if is not the first question
 * @private
 * @return {void}
 */
function addSurveyQuestion(_nextQuestionId) {
	var nextQuestion;
	var nextQuestionResult;

	//Static navigation for read only
	if (isReadOnly) {
		if (currentQuestionIndex == 0) {
			nextQuestion = surveyData.questions[currentQuestionIndex];
			nextQuestion.showBackButton = false;
			nextQuestion.showNextButton = true;
		} else {
			nextQuestion = _.find(surveyData.questions, function (_question) {
				return _question.id == _nextQuestionId;
			});

			nextQuestion.showBackButton = true;
			nextQuestion.showNextButton = true;
		}

		nextQuestionResult = _.find(surveyResultData.responses, function (_questionResultData) {
			return _questionResultData.questionId == nextQuestion.id;
		});
	} else {

		if (_nextQuestionId === 'C1' || _nextQuestionId === 'C2' || _nextQuestionId === 'C3' || _nextQuestionId === 'C4') {
			//Display the completion questions
			nextQuestion = _.find(surveyCompletionData, function (_completionQuestion) {
				return _completionQuestion.id == _nextQuestionId;
			});
			nextQuestion.showBackButton = true;
		} else if (currentQuestionIndex == 0) {
			//Don't show back button for first question
			nextQuestion = surveyData.questions[currentQuestionIndex];
			nextQuestion.showBackButton = false;
		} else if (_nextQuestionId === '') {
			nextQuestion = _.find(surveyCompletionData, function (_completionQuestion) {
				return _completionQuestion.id == 'C1';
			});
			nextQuestion.showBackButton = true;
		} else {
			//Display the next question
			nextQuestion = _.find(surveyData.questions, function (_question) {
				return _question.id == _nextQuestionId;
			});

			if (nextQuestion && nextQuestion.type === 'Action: Display C1') {
				//Display the C1 question
				nextQuestion = _.find(surveyCompletionData, function (_completionQuestion) {
					return _completionQuestion.id == 'C1';
				});

			} else if (nextQuestion && nextQuestion.type === 'Action: Display C3') {
				//Display the C3 question
				nextQuestion = _.find(surveyCompletionData, function (_completionQuestion) {
					return _completionQuestion.id == 'C3';
				});
			} else if (nextQuestion && nextQuestion.type === 'Action: End Survey') {
				//End The Survey
				args.saveCallback && args.saveCallback(surveyResponse);
				App.closeModalDialog();
			}

			nextQuestion.showBackButton = true;
		}
	}

	//Unless the next question is the Action: End Survey type, add to scroll view
	if (nextQuestion && nextQuestion.type != 'Action: End Survey') {
		// Add the question to the scrollview
		var questionView = Alloy.createController('dynamicSurvey/itemView', {
			patientData: patientData,
			enrollmentId: enrollmentId,
			question: nextQuestion,
			questionResponses: nextQuestionResult ? nextQuestionResult.responses : null,
			surveyQuestions: surveyData.questions,
			isReadOnly: isReadOnly
		});
		$.surveyContentView.addView(questionView.getView());
		// Scroll to the question (giving a small delay to render the UI)
		setTimeout(function () {
			$.surveyContentView.scrollToView(currentQuestionIndex);
		}, 5);
	}
}

/**
 * Removes the current question and the last answer of this questionare
 * @method removeSurveyQuestion
 * @private
 * @return {void}
 */
function removeSurveyQuestion() {
	// Scroll to the previousquestion
	$.surveyContentView.scrollToView(currentQuestionIndex - 1);
	// Remove the answer from the array
	surveyResponse.pop();
	// Destroy the view of the scrollable view (giving a delay to allow the scrollToView to complete)
	setTimeout(function () {
		$.surveyContentView.removeView(currentQuestionIndex);
		currentQuestionIndex--;
	}, 300);
}

/**
 * Updates the response array when interacting with survey
 * @method updateResponseData
 * @private
 * @params {string} _questionId
 * @params {object} _questionResponse
 * @params {Boolean} _cancelAdd
 * @return {void}
 */
function updateResponseData(_questionId, _questionResponse, _cancelAdd) {
	doLog && console.log(LOG_TAG, 'updateResponseData = ', JSON.stringify(_questionResponse));
	//store the question id with the response for submission
	_questionResponse.questionId = _questionId;

	// Add the response
	surveyResponse.push(_questionResponse);
	// Show the next question unless we cancel it
	if (!_cancelAdd) {
		// Increment the question index
		currentQuestionIndex++;
		addSurveyQuestion(_questionResponse.next);
	}
}

/**
 * Handles any kind of answer reported
 * @method handleScrollableClick
 * @private
 * @params {object} _evt
 * @return {void}
 */
function handleScrollableClick(_evt) {
	if (!_evt.source.action) {
		return;
	}

	doLog && console.log(LOG_TAG, 'handleScrollableClick = ' + _evt.source.action);

	switch (_evt.source.action) {
	case 'answerView':
		//Don't update the response if it's a locally stored question
		if (_evt.source.questionId != 'C1') {
			updateResponseData(_evt.source.questionId, _evt.source.answer);
		} else {
			//Don't update response for locally stored survey questions
			currentQuestionIndex++;
			addSurveyQuestion(_evt.source.answer.next);
		}
		break;
	case 'navBack':
		removeSurveyQuestion();
		break;
	case 'navForward':
		if (!isReadOnly) {
			//For next buttons that need to update the response with two answers
			if (_evt.source.questions && _evt.source.answers) {
				updateResponseData(_evt.source.questions[0], _evt.source.answers[0], true);
				updateResponseData(_evt.source.questions[1], _evt.source.answers[1]);
				return;
			}
			//For next buttons with one question and multiple responses
			if (_evt.source.questionId && _evt.source.answers) {
				updateResponseData(_evt.source.questionId, _evt.source.answers);
				return;
			}

			//Don't update the response if it's a locally stored question
			if (!_evt.source.answer.value === 'Next') {
				updateResponseData(_evt.source.questionId, _evt.source.answer);
			} else {
				//Dont update response for locally stored survey questions
				currentQuestionIndex++;
				addSurveyQuestion(_evt.source.answer.next);
			}
		} else {
			//Dont update response for locally stored survey questions
			currentQuestionIndex++;

			if (currentQuestionIndex < surveyResultData.responses.length) {
				addSurveyQuestion(surveyResultData.responses[currentQuestionIndex].questionId);
			} else {
				App.closeModalDialog();
			}

		}
		break;
	case 'finishSurvey':
		args.saveCallback && args.saveCallback(surveyResponse);
		App.closeModalDialog();
		break;
	}
}

/**
 * Handles the cancel button to dismiss the modal
 * @method handleLeftNavButtonClick
 * @private
 * @params {object} _evt
 * @return {void}
 */
function handleLeftNavButtonClick(_evt) {
	var dialog = alertDialogHelper.createAlertDialog({
		title: L('common_cancel'),
		message: L('common_sure_cancel'),
		buttonNames: [L('common_cancel'), L('common_no')]
	});

	dialog.addEventListener('click', function (_evt) {
		if (_evt.index == 0) {
			App.closeModalDialog();
		}
	});

	dialog.show();
}

$.leftNavButton.addEventListener('click', handleLeftNavButtonClick);
$.surveyContentView.addEventListener('click', handleScrollableClick);

init();
