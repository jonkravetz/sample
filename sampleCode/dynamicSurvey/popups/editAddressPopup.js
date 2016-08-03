/**
 * This is the controller for the edit Address popup
 * @class Controllers.dynamicSurvey.popups.editAddressPopup
 * @uses Core
 * @uses Helpers.appHelper
 * @uses Helpers.alertDialogHelper
 */
var args = arguments[0] || {};
var App = require('Core');
var appHelper = require('helpers/appHelper');
var alertDialogHelper = require('helpers/alertDialogHelper');

$.rightNavButton = $.UI.create('Button', {
	id: 'saveButton'
});

/**
 * @property {object} address
 */
var address = args.address;

/**
 * @property {object} secondaryAddress
 */
var secondaryAddress = args.secondaryAddress;

/**
 * Initializes the controller
 * @method init
 * @private
 * @return {void}
 */
function init() {
	//prepopulate if address exists
	if (address && !_.isEmpty(address)) {
		$.address1Label.value = address.street1;
		$.address2Label.value = address.street2;
		$.cityLabel.value = address.city;
		$.stateText.text = address.state;
		if (address.state != '') {
			$.stateLabel.text = '';
		}
		$.zipcodeLabel.value = address.postalCode;
	}
	//prepopulate if secondaryAddress exists
	if (secondaryAddress && !_.isEmpty(secondaryAddress)) {
		$.secondaryAddress1Label.value = secondaryAddress.street1;
		$.secondaryAddress2Label.value = secondaryAddress.street2;
		$.secondaryAddressCityLabel.value = secondaryAddress.city;
		$.secondaryAddressStateText.text = secondaryAddress.state;
		if (secondaryAddress.state != '') {
			$.secondaryAddressStateLabel.text = '';
		}
		$.secondaryAddressZipcodeLabel.value = secondaryAddress.postalCode;
	}
}

/**
 * Handles the state row click event
 * @method handleStateClickEvent
 * @private
 * @params {object} _evt
 * @return {void}
 */
function handleStateClickEvent(_evt) {
	var states = appHelper.getStates();

	_.each(states, function (_state) {
		if ($.stateText.text === _state.abbreviation) {
			_state.isSelected = true;
		}
	});

	App.openSidePopupDialog('common/singleSelectPopup', {
		title: L('popup_state_title'),
		data: states,
		backButtonTitle: ' ',
		selectCallback: function (_selectedData) {
			$.stateLabel.text = '';
			$.stateText.text = _selectedData.Abbreviation;
		},
		cancelCallback: function () {
			$.stateLabel.text = L('common_enter');
			$.stateText.text = '';
		}
	});
}

/**
 * Handles the state row click event
 * @method handleStateClickEvent
 * @private
 * @params {object} _evt
 * @return {void}
 */
function handleSecondaryAddressStateClickEvent(_evt) {
	var states = appHelper.getStates();

	_.each(states, function (_state) {
		if ($.secondaryAddressState.text === _state.abbreviation) {
			_state.isSelected = true;
		}
	});

	App.openSidePopupDialog('common/singleSelectPopup', {
		title: L('popup_state_title'),
		data: states,
		backButtonTitle: ' ',
		selectCallback: function (_selectedData) {
			$.secondaryAddressStateLabel.text = '';
			$.secondaryAddressStateText.text = _selectedData.Abbreviation;
		},
		cancelCallback: function () {
			$.secondaryAddressStateLabel.text = L('common_enter');
			$.secondaryAddressStateText.text = '';
		}
	});
}

/**
 * Callback for click save on the navigation bar
 * @method handleRightNavButtonClick
 * @private
 * @params {object} _evt
 * @return {void}
 */
function handleRightNavButtonClick(_evt) {
	if (!$.stateText.text || $.stateText.text == '' ||
		!$.zipcodeLabel.value || $.zipcodeLabel.value == '' ||
		!$.address1Label.value || $.address1Label.value == '' ||
		!$.address2Label.value || $.address2Label.value == '' ||
		!$.cityLabel.value || $.cityLabel.value == ''
	) {
		var missingFields = '';

		if (!$.stateText.text || $.stateText.text == '') {
			if (missingFields == '') {
				missingFields = missingFields + L('add_activity_state_required');
			} else {
				missingFields = missingFields + ', ' + L('add_activity_state_required');
			}
		}

		if (!$.zipcodeLabel.value || $.zipcodeLabel.value == '') {
			if (missingFields == '') {
				missingFields = missingFields + L('add_activity_zipcode_required');
			} else {
				missingFields = missingFields + ', ' + L('add_activity_zipcode_required');
			}
		}

		if (!$.address1Label.value || $.address1Label.value == '') {
			if (missingFields == '') {
				missingFields = missingFields + L('add_activity_address1_required');
			} else {
				missingFields = missingFields + ', ' + L('add_activity_address1_required');
			}
		}

		if (!$.address2Label.value || $.address2Label.value == '') {
			if (missingFields == '') {
				missingFields = missingFields + L('add_activity_address2_required');
			} else {
				missingFields = missingFields + ', ' + L('add_activity_address2_required');
			}
		}

		if (!$.cityLabel.value || $.cityLabel.value == '') {
			if (missingFields == '') {
				missingFields = missingFields + L('add_activity_city_required');
			} else {
				missingFields = missingFields + ', ' + L('add_activity_city_required');
			}
		}

		var dialog = alertDialogHelper.createAlertDialog({
			title: L('common_alert'),
			message: String.format(L('common_empty_required_fields'), missingFields),
			buttonNames: [L('common_ok')]
		});
		dialog.show();
		return;

	}

	if ($.zipcodeLabel.value && !appHelper.validateZipcode($.zipcodeLabel.value)) {
		var dialog = alertDialogHelper.createAlertDialog({
			title: L('common_alert'),
			message: L('common_zipcode_alert'),
			buttonNames: [L('common_ok')]
		});
		dialog.show();
		return;
	}

	if ($.secondaryAddressZipcodeLabel.value && !appHelper.validateZipcode($.secondaryAddressZipcodeLabel.value)) {
		var dialog = alertDialogHelper.createAlertDialog({
			title: L('common_alert'),
			message: L('common_zipcode_alert'),
			buttonNames: [L('common_ok')]
		});
		dialog.show();
		return;
	}

	_.extend(address, {
		street1: $.address1Label.value || '',
		street2: $.address2Label.value || '',
		city: $.cityLabel.value || '',
		state: $.stateText.text || '',
		postalCode: $.zipcodeLabel.value || ''
	});

	_.extend(secondaryAddress, {
		street1: $.secondaryAddress1Label.value || '',
		street2: $.secondaryAddress2Label.value || '',
		city: $.secondaryAddressCityLabel.value || '',
		state: $.secondaryAddressStateText.text || '',
		postalCode: $.secondaryAddressZipcodeLabel.value || '',
		type: 'Secondary',
		primary: false
	});

	args.saveCallback && args.saveCallback(address, secondaryAddress);
	App.closePopupDialog();
}

/**
 * Handles the add secondary address row click event
 * @method handleAddSecondaryAddressClick
 * @private
 * @params {object} _evt
 * @return {void}
 */
function handleAddSecondaryAddressClick(_evt) {
	if ($.secondaryAddressGroup.visible) {
		$.secondaryAddressGroup.height = $.secondaryAddressGroup.heightInactive;
		$.secondaryAddressGroup.visible = !$.secondaryAddressGroup.visible;
	} else {
		$.secondaryAddressGroup.height = $.secondaryAddressGroup.heightActive;
		$.secondaryAddressGroup.visible = !$.secondaryAddressGroup.visible;
	}
};

$.state.addEventListener('click', handleStateClickEvent);
$.secondaryAddressState.addEventListener('click', handleSecondaryAddressStateClickEvent);
$.rightNavButton.addEventListener('click', handleRightNavButtonClick);
$.addSecondaryAddress.addEventListener('click', handleAddSecondaryAddressClick);

init();
