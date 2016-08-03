/**
 * This is the item controller for the questions in the dynamic survey
 * @class Controllers.dynamicSurvey.itemView
 * @uses Core
 * @uses DataManager
 * @uses Helpers.alertDialogHelper
 * @uses appHelper
 */
var args = arguments[0] || {};
var App = require('Core');
var DataManager = require('DataManager');
var appHelper = require('helpers/appHelper');
var alertDialogHelper = require('helpers/alertDialogHelper');

const LOG_TAG = '\x1b[90m\x1b[105m[dynamicSurvey/itemView]\x1b[39;49m ';
var doLog = Alloy.Globals.doLog;

/**
 * @property {object} questionData
 */
var questionData = args.question;

/**
 * @property {array} questionResponses
 */
var questionResponses = args.questionResponses;

/**
 * @property {string} isReadOnly
 */
var isReadOnly = args.isReadOnly;

/**
 * @property {array} surveyQuestions
 */
var surveyQuestions = args.surveyQuestions;

/**
 * @property {object} addedActivity
 */
var addedActivity;

/**
 * @property {object} addedTask
 */
var addedTask;

/**
 * @property {object} questionTypes
 */
var questionTypes = {
	YES_NO: 'Yes/No',
	VERTICAL_SINGLE_SELECTION: 'Vertical Single Selection',
	VERTICAL_MULTIPLE_SELECTION: 'Vertical Multiple Selection',
	RANK_5: 'Rank 5',
	YES_NO_TWO_PART: 'Yes/No Two Part',
	ACTION_ADD_ACTIVITY: 'Action: Add Activity',
	ACTION_ADD_TASK: 'Action: Add Task',
	MAIL_OR_EMAIL_SELECT: 'Mail or Email',
	DISPLAY_TEXT: 'Display Text'
};

/**
 * Initializes the controller
 * @method init
 * @private
 * @return {void}
 */
function init() {

	// We should not display this controller if the right params are not being sent.
	if (!questionData) {
		throw 'Controller requires a valid question params';
		return;
	}

	$.questionLabel.text = questionData.text;

	doLog && console.log(LOG_TAG, 'init = ', questionData.type);

	var answerController;

	switch (questionData.type) {
	case questionTypes.YES_NO:
	case questionTypes.YES_NO_TWO_PART:
		answerController = Alloy.createController('dynamicSurvey/yesNoAnswerView', {
			questionId: questionData.id,
			answerData: questionData.responses,
			questionResponses: questionResponses,
			isReadOnly: isReadOnly
		});
		$.answerView.add(answerController.getView());
		break;
	case questionTypes.VERTICAL_SINGLE_SELECTION:
	case questionTypes.MAIL_OR_EMAIL_SELECT:
		answerController = Alloy.createController('dynamicSurvey/singleSelectAnswerView', {
			questionId: questionData.id,
			answerData: questionData.responses,
			questionResponses: questionResponses,
			isReadOnly: isReadOnly
		});
		$.answerView.add(answerController.getView());
		break;
	case questionTypes.VERTICAL_MULTIPLE_SELECTION:
		answerController = Alloy.createController('dynamicSurvey/multiSelectAnswerView', {
			questionId: questionData.id,
			answerData: questionData.responses,
			questionResponses: questionResponses,
			isReadOnly: isReadOnly
		});

		questionData.next = questionData.responses[0].next;
		$.answerView.add(answerController.getView());
		break;
	case questionTypes.RANK_5:
		answerController = Alloy.createController('dynamicSurvey/rankAnswerView', {
			questionId: questionData.id,
			answerData: questionData.responses,
			questionResponses: questionResponses,
			isReadOnly: isReadOnly
		});
		$.answerView.add(answerController.getView());
		break;
	case questionTypes.ACTION_ADD_ACTIVITY:
		//Remove description text. No design around description and add activity display .
		questionData.description = '';

		answerController = Alloy.createController('dynamicSurvey/activityAnswerView', {
			questionId: questionData.id,
			answerData: questionData.responses,
			questionResponses: questionResponses,
			addedActivity: questionData.addedActivity,
			isReadOnly: isReadOnly
		});
		$.answerView.add(answerController.getView());

		//This is so when user clicks on back button, the state of the screen will be recreated
		if (questionData.addedActivity && questionData.addedActivity.id) {
			addedActivity = questionData.addedActivity;

			var nextButton = $.UI.create('Button', {
				id: 'nextButton',
				enabled: true
			});

			$.footerView.add(nextButton);

			//add the activity data to the bottom of the screen
			var activityController = Alloy.createController('dynamicSurvey/activityView', questionData.addedActivity);
			$.answerDetailView.add(activityController.getView());

			// Swap the question data with the task question data
			var addTaskQuestionData = _.find(surveyQuestions, function (_question) {
				return _question.id == questionData.responses[0].next;
			});

			nextButton.applyProperties({
				questions: [questionData.id, addTaskQuestionData.id],
				answers: [questionData.responses[0], addTaskQuestionData.responses[0]]
			});

			$.questionLabel.text = addTaskQuestionData.text;

		}
		break;
	case 'Text':
	case questionTypes.DISPLAY_TEXT:
		answerController = Alloy.createController('dynamicSurvey/textAnswerView', {
			questionId: questionData.id,
			answerData: questionData.responses,
			questionResponses: questionResponses,
			isReadOnly: isReadOnly
		});
		//If this isn't a local text question, this grabs the next value from the default response.
		if (!questionData.next && questionData.responses.length > 0) {
			questionData.next = questionData.responses[0].next;
		}

		$.answerView.add(answerController.getView());
		break;
	}

	if (questionData.showBackButton) {
		var backButton = $.UI.create('Button', {
			id: 'backButton'
		});
		$.footerView.add(backButton);
	}

	if (questionData.showNextButton) {
		var nextButton = $.UI.create('Button', {
			id: 'nextButton',
		});
		$.footerView.add(nextButton);
	} else if (questionData.next) {
		var nextButton = $.UI.create('Button', {
			id: 'nextButton',
			answer: {
				id: 'nextButton',
				value: 'Next',
				next: questionData.next
			}
		});
		$.footerView.add(nextButton);
	}

	if (questionData.finish) {
		var finishButton = $.UI.create('Button', {
			id: 'finishButton',
			answer: {
				id: 'finishButton',
				value: 'finish',
				next: questionData.finish
			}
		});
		$.footerView.add(finishButton);
	}

	if (questionData.description && questionData.description != '') {
		//add the description text controller to the bottom of the screen
		var descriptionController = Alloy.createController('dynamicSurvey/descriptionView', questionData.description);
		$.answerDetailView.add(descriptionController.getView());
	}

};

/**
 * Checks if the question is a two part question and needs to prevent
 * navigation to the next one
 * @method handleAnswerViewClick
 * @private
 * @params {object} _evt
 * @return {void}
 */
function handleAnswerViewClick(_evt) {

	switch (questionData.type) {
	case questionTypes.YES_NO_TWO_PART:
		doLog && console.log(LOG_TAG, 'handleAnswerViewClick = ', questionData.type);

		// We only display the second part of the question if the answer is yes
		if (_evt.source.answer.value == 'Yes') {
			//Handle UX changes only if second part needs to be added, else navigate.
			_evt.cancelBubble = true;
			//Show the second part of the question
			var followupQuestion = _.find(surveyQuestions, function (_question) {
				return _question.id == _evt.source.answer.next;
			});

			var nextButton = $.UI.create('Button', {
				id: 'nextButton',
				enabled: false
			});

			$.footerView.add(nextButton);

			//add the second part of the question in the answerDetailView
			var followupQuestionController = Alloy.createController('dynamicSurvey/followupQuestionView', {
				followupQuestion: followupQuestion,
				answerCallback: function (_followupQuestionId, _followupAnswer) {
					nextButton.applyProperties({
						questions: [_evt.source.questionId, _followupQuestionId],
						answers: [_evt.source.answer, _followupAnswer],
						enabled: true
					});
				}
			});

			$.answerDetailView.add(followupQuestionController.getView());
		} else {
			//Reset UI to initial state if the answer is no
			$.answerDetailView.removeAllChildren();
			$.footerView.removeAllChildren();

			if (questionData.showBackButton) {
				var backButton = $.UI.create('Button', {
					id: 'backButton'
				});
				$.footerView.add(backButton);
			}
		}

		break;
	case questionTypes.VERTICAL_MULTIPLE_SELECTION:
		_evt.cancelBubble = true;

		if (!nextButton) {
			var nextButton = $.UI.create('Button', {
				id: 'nextButton',

			});

			$.footerView.add(nextButton);
		}
		//Pass Multiple Answers back to main screen upon clicking next
		nextButton.applyProperties({
			questionId: questionData.id,
			answers: {
				answerArray: _evt.source.nextArray,
				next: questionData.responses[0].next
			}
		})

		break;
	case questionTypes.MAIL_OR_EMAIL_SELECT:
		doLog && console.log(LOG_TAG, 'handleAnswerViewClick = ', questionData.type + ', ' + JSON.stringify(_evt.source));

		if (_evt.source.value && _evt.source.value.indexOf(L('common_email_address')) > -1) {

			_evt.source.action = 'inputEmail';

			var patientEmailAddress;

			if (args.patientData && args.patientData.email && args.patientData.email != '') {
				patientEmailAddress = args.patientData.email;
			} else {
				patientEmailAddress = '';
			}

			App.openSidePopupDialog('dynamicSurvey/popups/editEmailPopup', {
				title: L('edit_email_title'),
				email: patientEmailAddress,
				cancelButtonTitle: L('common_cancel'),
				saveCallback: function (_newEmail) {
					doLog && console.log(LOG_TAG, 'saveCallback - ' + _newEmail);

					if (typeof _newEmail == 'string') {
						args.patientData.email = _newEmail;
					}

					// doing omit on _patientData so that payload doesn't contain local objects
					var patientPayload = _.omit(args.patientData, 'enrollments');
					patientPayload = _.omit(patientPayload, 'conditions');

					DataManager.updatePatient(patientPayload, function (_response) {
						if (_response && _response.success) {
							doLog && console.log(LOG_TAG, 'updatePatientEmail callback success: ' + JSON.stringify(_response.data.email));
						} else {
							var dialog = alertDialogHelper.createAlertDialog({
								title: L('common_alert'),
								message: _response.error,
								buttonNames: [L('common_ok')]
							});

							dialog.show();
						}
					});

					$.answerView.removeAllChildren();
					$.footerView.removeAllChildren();

					//Ensure email address is appended to response value upon repaint
					questionData.responses[1].value = L('common_email_address') + ': ' + _newEmail;
					//Ensure email box is deselected upon repaint
					questionData.responses[1].isSelected = true;
					//Ensure address box is deselected upon repaint
					questionData.responses[0].isSelected = false;
					//Assign the next button to appropriate response
					questionData.next = questionData.responses[0].next;
					//Reloads the control with the email address
					init();
				}
			});
			return;
		}

		if (_evt.source.value && _evt.source.value.indexOf(L('common_mailing_address')) > -1) {

			_evt.source.action = 'inputAddress';

			var patientAddressObject;
			var patientSecondaryAddressObject;

			if (args.patientData && args.patientData.address && !_.isEmpty(args.patientData.address)) {
				patientAddressObject = args.patientData.address;
				if (typeof patientAddressObject === 'string') {
					patientAddressObject = JSON.parse(patientAddressObject);
				}
			} else {
				patientAddressObject = {};
			}

			if (args.patientData && args.patientData.secondaryAddress && !_.isEmpty(args.patientData.secondaryAddress)) {
				patientSecondaryAddressObject = args.patientData.secondaryAddress;
			} else {
				patientSecondaryAddressObject = {};
			}

			App.openSidePopupDialog('dynamicSurvey/popups/editAddressPopup', {
				title: L('edit_address_title'),
				address: patientAddressObject,
				secondaryAddress: patientSecondaryAddressObject,
				cancelButtonTitle: L('common_cancel'),
				saveCallback: function (_newAddress, _newSecondaryAddress) {
					doLog && console.log(LOG_TAG, 'saveCallback - Address' + JSON.stringify(_newAddress));
					doLog && console.log(LOG_TAG, 'saveCallback - Secondary Address' + JSON.stringify(_newSecondaryAddress));

					args.patientData.address = _newAddress;

					var updatePayload = {
						id: args.patientData.id,
						address: args.patientData.address
					};

					if (args.patientData.secondaryAddress && !_.isEmpty(args.patientData.secondaryAddress)) {
						//ensure the correct address is being updated
						_newSecondaryAddress.id = args.patientData.secondaryAddress.id;

						DataManager.updatePatientAddress(args.patientData.id, _newSecondaryAddress, function (_addressResponse) {
							if (_addressResponse && _addressResponse.success) {
								args.patientData.secondaryAddress = _addressResponse.data;
								doLog && console.log(LOG_TAG, 'updatePatientAddress callback success: ' + JSON.stringify(_addressResponse.data));
							} else {
								doLog && console.error(LOG_TAG, 'updatePatientAddress callback failure: ' + JSON.stringify(
									_addressResponse.error.message));
							}
						});

					} else {

						DataManager.createPatientAddress(args.patientData.id, _newSecondaryAddress, function (_addressResponse) {
							if (_addressResponse && _addressResponse.success) {
								args.patientData.secondaryAddress = _addressResponse.data;
								doLog && console.log(LOG_TAG, 'createPatientAddress callback success: ' + JSON.stringify(_addressResponse.data));
							} else {
								doLog && console.error(LOG_TAG, 'createPatientAddress callback failure: ' + JSON.stringify(
									_addressResponse.error.message));
							}
						});
					}

					// doing omit on _patientData so that payload doesn't contain local objects
					var patientPayload = _.omit(args.patientData, 'enrollments');
					patientPayload = _.omit(patientPayload, 'conditions');

					DataManager.updatePatient(_.omit(args.patientData, 'enrollments'), function (_response) {
						if (_response && _response.success) {
							doLog && console.log(LOG_TAG, 'updatePatientAddress callback success: ' + JSON.stringify(_response.data.address));
						} else {
							var dialog = alertDialogHelper.createAlertDialog({
								title: L('common_alert'),
								message: _response.error,
								buttonNames: [L('common_ok')]
							});

							dialog.show();
						}
					});

					$.answerView.removeAllChildren();
					$.footerView.removeAllChildren();

					//Ensure address is appended to response value upon repaint
					questionData.responses[0].value = L('common_mailing_address') + ': ' +
						appHelper.addressFormatter(_newAddress);
					//Ensure email box is deselected upon repaint
					questionData.responses[0].isSelected = true;
					//Ensure address box is selected upon repaint
					questionData.responses[1].isSelected = false;
					//Assign the next button to appropriate response
					questionData.next = questionData.responses[1].next;
					//Reloads the control with the address
					init();
				}
			});
		}
		break;
	case questionTypes.ACTION_ADD_ACTIVITY:
	case questionTypes.ACTION_ADD_TASK:
		doLog && console.log(LOG_TAG, 'handleAnswerViewClick = ', questionData.type + ', ' + _evt.source.action);

		switch (_evt.source.action) {
		case 'addInservice':

			App.openSidePopupDialog('activity/addNewPopup', {
				title: L('add_activity_header'),
				canChangeTitle: true,
				inserviceType: 'Patient Inservice',
				patientPhone: args.patientData.phone1,
				enrollmentData: {
					enrollmentId: args.enrollmentId,
					patientId: args.patientData.id
				},
				cancelButtonTitle: L('common_cancel'),
				saveCallback: function (_newActivity) {
					doLog && console.log(LOG_TAG, 'addInservice - saveCallback');

					addedActivity = _newActivity;
					questionData.addedActivity = addedActivity;

					//reset ui
					$.answerView.removeAllChildren();
					$.footerView.removeAllChildren();
					$.answerDetailView.removeAllChildren();

					init();
				}
			});
			break;
		case 'editInservice':
			if (addedActivity && addedActivity.id) {

				App.openSidePopupDialog('activity/editPopup', {
					title: L('edit_activity_title'),
					cancelButtonTitle: L('common_cancel'),
					patientPhone: args.patientData.phone1,
					data: addedActivity,
					saveCallback: function (_updatedActivity) {
						doLog && console.log(LOG_TAG, 'editInservice - saveCallback');
						//Update the inservice data in the question and answerdetailview.
						addedActivity = _updatedActivity;

						questionData.addedActivity = addedActivity;
						$.answerDetailView.removeAllChildren();

						//add the activity data to the bottom of the screen
						var activityController = Alloy.createController('dynamicSurvey/activityView', addedActivity);
						$.answerDetailView.add(activityController.getView());
					}
				});
			}
			break;
		case 'addTask':
			App.openSidePopupDialog('tasks/addNewPopup', {
				title: L('add_task_header'),
				cancelButtonTitle: L('common_cancel'),
				saveCallback: function (_saveData) {
					doLog && console.log(LOG_TAG, 'addTask - saveCallback');

					addedTask = _saveData;

					_evt.source.applyProperties({
						action: 'editTask',
						value: 'Edit Task',
						title: L('task_detail_edit')
					});
				}
			});
			break;
		case 'editTask':
			if (addedTask && addedTask.id) {
				App.openSidePopupDialog('tasks/editPopup', {
					title: L('task_detail_edit'),
					data: {
						taskDetail: addedTask
					},
					cancelButtonTitle: L('common_cancel'),
					saveCallback: function (_saveData) {
						doLog && console.log(LOG_TAG, 'editTask - saveCallback');
						addedTask = _saveData;
					}
				});
				break;
			}
		}
		break;
	}
}

$.answerView.addEventListener('click', handleAnswerViewClick);

init();
