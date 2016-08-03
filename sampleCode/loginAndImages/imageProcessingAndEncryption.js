/**
 * Helper functions for creating, transforming, and storing an image from a blob\base64 string
 * @version 1.1.0
 * @class Helpers.imageHelpers
 */

const LOG_TAG = '\x1b[90m\x1b[103m' + '[helpers/imageHelpers]' + '\x1b[39;49m ';

var doLog = false;
var imageFactory = require('ti.imagefactory');

var imageHelpers = (function() {
	
	/**
	 * @method
	 * @public
	 * Resizes an image blob with the given options
	 * @param _params {Object}  Dictionary with options
	 * @param _params.blob {Ti.Blob} Image blob to reize
	 * @param [_params.width = 400] {Number}  Width to resize the image
	 * @param [_params.height = 400] {Number}  Height to resize the image
	 * @param [_params.quality = 1.0] {Number}  Quality to compress the image, from 0 (least quality) to 1.0 (highest quality)
	 * @return {Ti.Blob} Resized image blob (will be JPEG format if the quality is minor than 1.0)
	 */
	var resizeImage = function (_params) {
		_params = _params || {};
		var blob = _params.blob;
		var width = _params.width || 400;
		var height = _params.height || 400;
		var quality = _params.quality || 1.0;


	 	var _newImage = imageFactory.imageAsResized(blob, {
	 		width : width,
	 		height : height,
	 		quality : OS_IOS ? imageFactory.QUALITY_HIGH : 1.0
 		});

 		if (quality < 1.0) {
	 		return imageFactory.compress(_newImage, quality);
 		} else {
 			return _newImage;
 		}
	 	
	 };

	 /**
	  * @method
	  * @Public
	  * Returns some useful data for an image blob, including its thumbnail, a resized image and its base64 String
	  * @param _blob {Ti.Blob} Image Blob
	  * 
	  * @return {Object} Dictionary with the image's data
	  * @example
	  	{
			image : resized image,
			thumbnail : image as thumbnail,
			base64String : String with resized image's data as base64
	  	}
	  */
	var obtainImageData = function (_blob) {
		var resizedImage = resizeImage({
			blob : _blob
		});
		
		return {
			image : resizedImage,
			thumbnail : _blob.imageAsThumbnail(80),
			base64String : Ti.Utils.base64encode(resizedImage).toString().replace(/\r\n/g, '')
		};
	};

	/**
	 * @method createImageFromBase64String
	 * Creates an image file with encrypted name from base64 String
	 * @params {string} _imageName
	 * @params {string} _base64String
	 * @return {string} 
	 */
	var createImageFromBase64String = function (_imageName, _base64String) {
		var imageName = Ti.Utils.md5HexDigest(_imageName);
		var parentDirectory = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'images');

		if (!parentDirectory.exists()) {
			parentDirectory.createDirectory();
		}

		if (_base64String && _base64String != '') {
			var imageFile = Ti.Filesystem.getFile(parentDirectory.resolve(), imageName + '.jpg');

			imageFile.write(Ti.Utils.base64decode(_base64String));
			doLog && console.log(LOG_TAG, 'Created Image - ', imageFile.nativePath);

			return imageFile.nativePath;
		} else {
			doLog && console.error(LOG_TAG, 'Could NOT create image');
			return null;
		}
	};

	/**
	 * @method getLocalImagePathById
	 * Checks whether an image file exists for an encrypted image name, and if so returns the file path
	 * @params {string} _id A unique ID that the helper will use to generate a file name by using MD5
	 * @return {string} 
	 */
	var getLocalImagePathById = function (_id) {
		var imageName = Ti.Utils.md5HexDigest(_id);

		var parentDirectory = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'images');

		if (!parentDirectory.exists()) {
			parentDirectory.createDirectory();
		}

		if (Ti.Filesystem.getFile(parentDirectory.resolve(), imageName + '.jpg').exists()) {

			var imageFile = Ti.Filesystem.getFile(parentDirectory.resolve(), imageName + '.jpg');
			doLog && console.log(LOG_TAG, 'Image Exists - ', imageFile.nativePath);

			return imageFile.nativePath;
		} else {
			doLog && console.log(LOG_TAG, 'Image Does NOT Exist');
			return false;
		}
	};

	return {
		resizeImage: resizeImage,
		obtainImageData: obtainImageData,
		createImageFromBase64String: createImageFromBase64String,
		getLocalImagePathById: getLocalImagePathById
	};
})();

module.exports = imageHelpers;
