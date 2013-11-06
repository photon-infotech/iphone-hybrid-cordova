var pictureSource,   // picture source
	destinationType, // sets the format of returned value
	geoWatchID = null,
	accelWatchID = null,
	compassWatchID = null,
	mediaVar = null,
	mediaPath = null,
	mediaTimer = null,
	mediaTimerDuration = null,
	mediaRec = null,
	recInterval = null;

var app = {
	initialize: function() {
		this.bindEvents();
	},

	bindEvents: function() {
		document.addEventListener('deviceready', this.onDeviceReady, false);
	},

	onDeviceReady: function() {
		navigator.splashscreen.show();
		setTimeout(function() {
			navigator.splashscreen.hide();
		}, 2000);
		pictureSource=navigator.camera.PictureSourceType;
		destinationType=navigator.camera.DestinationType;

		if(device.platform == "Android") {
			mediaPath = "/android_asset/www/res/media/media.mp3";
		} else {
			mediaPath = "res/media/media.mp3";
		}
	}
};

var camera = {
	capturePhoto: function () {
		navigator.camera.getPicture(this.onSuccess, this.onFail, { 
			quality: 50,
			saveToPhotoAlbum: true
		});
	},

	capturePhotoEdit: function () {
		navigator.camera.getPicture(this.onSuccess, this.onFail, { 
			quality: 20, 
			allowEdit: true,
			saveToPhotoAlbum: true 
		});
	},

	getPhoto: function (source) {
		navigator.camera.getPicture(this.onSuccess, this.onFail, { 
			quality: 50,
			sourceType: source
		});
	},

	onSuccess: function (imageData) {
		var cameraImage = $('#cameraImage');
		var cameraResult = $('#cameraResult');
		cameraResult.show();
		cameraImage.attr('src', imageData);
	},

	onFail: function (message) {
		navigator.notification.alert('Failed because: ' + message, null, 'Error', 'Ok');
	}
};

var capture = {
	captureSuccess: function (mediaFiles) {
		var i, len;
		for (i = 0, len = mediaFiles.length; i < len; i += 1) {
			this.uploadFile(mediaFiles[i]);
		}
	},

	captureError: function (error) {
		var msg = 'An error occurred during capture: ' + error.code;
		navigator.notification.alert(msg, null, 'Uh oh!');
	},

	captureAudio: function () {
		navigator.device.capture.captureAudio(this.captureSuccess, this.captureError, {limit: 2});
	},

	uploadFile: function (mediaFile) {
		var ft = new FileTransfer(),
		path = mediaFile.fullPath,
		name = mediaFile.name;

		ft.upload(path,
			"http://my.domain.com/upload.php",
			function(result) {
				navigator.notification.alert('Upload success: ' + result.responseCode, null, 'Success', 'Ok');
				navigator.notification.alert(result.bytesSent + ' bytes sent', null, 'Success', 'Ok');
			},
			function(error) {
				navigator.notification.alert('Error uploading file ' + path + ': ' + error.code, null, 'Success', 'Ok');
			},
			{ fileName: name }
		);
	}
};

var connection = {
	checkConnection: function () {
		var networkState = navigator.connection.type;

		var states = {};
		states[Connection.UNKNOWN]  = 'Unknown connection';
		states[Connection.ETHERNET] = 'Ethernet connection';
		states[Connection.WIFI]     = 'WiFi connection';
		states[Connection.CELL_2G]  = 'Cell 2G connection';
		states[Connection.CELL_3G]  = 'Cell 3G connection';
		states[Connection.CELL_4G]  = 'Cell 4G connection';
		states[Connection.CELL]     = 'Cell generic connection';
		states[Connection.NONE]     = 'No network connection';

		navigator.notification.alert('Connection type: ' + states[networkState], null, 'Connection', 'Ok');
	}
};

var contacts = {
	addContact: function() {
		var firstName = $('#firstName').val(),
		lastName = $('#lastName').val(),
		mobileNo = $('#mobileNo').val(),
		contact = navigator.contacts.create();

		contact.displayName = firstName;
		contact.nickname = firstName;                 // specify both to support all devices

		var name = new ContactName();
		name.givenName = firstName;
		name.familyName = lastName;
		contact.name = name;

		var phoneNumbers = [];
		phoneNumbers[0] = new ContactField('work', mobileNo, false);
		contact.phoneNumbers = phoneNumbers;

		contact.save(this.onSaveSuccess,this.onSaveError);
	},

	onSaveSuccess: function (contact) {
		navigator.notification.alert("Save Success", null, 'Contact', 'Ok');
	},

	onSaveError: function (contactError) {
		navigator.notification.alert("Error : " + contactError.code, null, 'Error', 'Ok');
	},

	findContact: function () {
		var options = new ContactFindOptions();
		options.filter = $('#findName').val();
		options.multiple = true;

		var fields = ["displayName", "name", "phoneNumbers"];
		navigator.contacts.find(fields, this.onFindSuccess, this.onFindError, options);
	},

	onFindSuccess: function (contacts) {
		if (contacts.length == 0) {
			navigator.notification.alert('No Contacts Found!', null, 'Error', 'Ok');
		} else {
			var content, nos;

			for (var i = 0; i < contacts.length; i++) {
				for (var j = 0; j < contacts[i].phoneNumbers.length; j++) {
					nos = contacts[i].phoneNumbers[j].value + " ";
				};
				content += "<tr><th>" + contacts[i].name.givenName + " " + contacts[i].name.familyName + "</th><td>" + nos + "</td></tr>";
			}

			$('#contactsTableBody').html(content);
			$('#contactsResult').show();
		}
	},

	onFindError: function (contactError) {
		navigator.notification.alert('Error finding Contacts!', null, 'Error', 'Ok');
	}
};

var geolocation = {
	getCurrentPosition: function(){
		var options = { timeout: 30000 };
		geoWatchID = navigator.geolocation.watchPosition(this.onSuccess, this.onError, options);
	},

	onSuccess: function (position) {
		$('#latitude').html('Latitude: ' + position.coords.latitude);
		$('#longitude').html('Longitude: ' + position.coords.longitude);
		$('#altitude').html('Altitude: ' + position.coords.altitude);
		$('#accuracy').html('Accuracy: ' + position.coords.accuracy);
		$('#altitudeAccuracy').html('Altitude Accuracy: ' + position.coords.altitudeAccuracy);
		$('#heading').html('Heading: ' + position.coords.heading);
		$('#speed').html('Speed: ' + position.coords.speed);
		$('#timestamp').html('Timestamp: ' + position.timestamp);
	},

	onError: function (error) {
		navigator.notification.alert('code: ' + error.code + '\n' + 'message: ' + error.message + '\n', null, 'Error', 'Ok');
	},

	clearWatch: function() {
		if (geoWatchID != null) {
			navigator.geolocation.clearWatch(geoWatchID);
			geoWatchID = null;
		};
	}
};

var notification = {
	showAlert: function(){
		navigator.notification.alert('This is an alert', null, 'Alert', 'Done');
	},

	showConfirm: function(){
		navigator.notification.confirm('This is a notification!', this.onConfirm, 'Confirm', ['Yes', 'No']);
	},

	onConfirm: function(buttonIndex){
		navigator.notification.alert('You selected button ' + buttonIndex, null , 'Alert', 'Done');
	},

	onPrompt: function (results) {
		navigator.notification.alert("You selected button number " + results.buttonIndex + " and entered " + results.input1, null, 'Alert', 'Ok');
	},

	showPrompt: function () {
		navigator.notification.prompt(
		'Please enter your name',  // message
		this.onPrompt,                  // callback to invoke
		'Registration',            // title
		['Ok','Exit'],             // buttonLabels
		'Photon'                 // defaultText
		);
	},

	playBeep: function () {
		navigator.notification.beep(3);
	},

	vibrate: function () {
		navigator.notification.vibrate(2000);
	}
};

var accelerometer = {
	getCurrentAcceleration: function() {
		navigator.accelerometer.getCurrentAcceleration(this.onSuccess, this.onError);
	},

	watchAcceleration: function() {
		var options = { frequency: 500 };
		accelWatchID = navigator.accelerometer.watchAcceleration(this.onSuccess, this.onError, options);
	},

	onSuccess: function (acceleration) {
		$('#accelerometerControlGroup').show();
		$('#accelX').html('X: ' + acceleration.x);
		$('#accelY').html('Y: ' + acceleration.y);
		$('#accelZ').html('Z: ' + acceleration.z);
		$('#accelTimeStamp').html('Timestamp: ' + acceleration.timestamp);
	},

	onError: function () {
		navigator.notification.alert('Accelerometer Error', null , 'Error', 'Ok');
	},

	clearWatch: function() {
		if (accelWatchID) {
			navigator.accelerometer.clearWatch(accelWatchID);
			accelWatchID = null;
			navigator.notification.alert('Cleared!', null, 'Success', 'Ok');
		};
	}
};

var compass = {
	getCurrentHeading: function(){
		var options = { frequency: 500 };
		compassWatchID = navigator.compass.watchHeading(this.onSuccess, this.onError, options);
	},

	onSuccess: function (heading) {
		$('#compassHeading').html('Heading: ' + heading.magneticHeading);
	},

	onError: function (compassError) {
		navigator.notification.alert('Compass Error : ' + compassError.code, null , 'Error', 'Ok');
	},

	clearWatch: function() {
		if (compassWatchID) {
			navigator.compass.clearWatch(compassWatchID);
			compassWatchID = null;
		};
	}
};

var file = {
	getFileSystem: function() {
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, this.onFileSystemSuccess, this.onFileSystemFail);
	},

	onFileSystemSuccess: function(fileSystem) {
		$('#fileSystemContainer').show();
		$('#fileSystemName').html('Name : ' + fileSystem.name);
		$('#fileSystemRoot').html('Root : ' + fileSystem.root.name);
	},

	onFileSystemFail: function(errorEvent) {
		navigator.notification.alert('Error : ' + errorEvent.target.error.code, null, 'Error', 'Ok');
	},

	writeFile: function() {
		if ($('#fileName').val().length == 0 || $('#fileContent').val().length == 0) {
			navigator.notification.alert('Please complete all the fields!', null, 'Error', 'Ok');
		} else {
			window.requestFileSystem(
				LocalFileSystem.PERSISTENT, 
				0, 
				function(fileSystem) {
					var fileName = $('#fileName').val();
					fileSystem.root.getFile(
						fileName, 
						{create: true, exclusive: false}, 
						function(fileEntry) {
							fileEntry.createWriter(
								function(writer) {
									writer.onwriteend = function(event) {
										navigator.notification.alert('File written successfully!', null, 'Success', 'Ok');
									}
									writer.write($('#fileContent').val());
								},
								file.onError
							);
						}, 
						file.onError
					);
				}, 
				file.onError
			);
		}
	},

	readFile: function() {
		if ($('#readFileName').val().length == 0) {
			navigator.notification.alert('Please enter the file name!', null, 'Error', 'Ok');
		} else {
			window.requestFileSystem(
				LocalFileSystem.PERSISTENT, 
				0, 
				function(fileSystem) {
					var fileName = $('#readFileName').val();
					fileSystem.root.getFile(
						fileName, 
						null, 
						function(fileEntry) {
							fileEntry.file(
								function(readFile) {
									file.readAsText(readFile);
								},
								file.onError
							);
						}, 
						file.onError
					);
				}, 
				file.onError
			);
		}
	},

	readAsText: function(file) {
		var reader = new FileReader();
		reader.onloadend = function(event) {
			$('#readFileContents').html('<h4>File Contents</h4>' + event.target.result);
		}
		reader.readAsText(file);
	},

	onError: function(error) {
		navigator.notification.alert('Error : ' + error.code, null, 'Error', 'Ok');
	}
};

var globalPlugin = {
	getDetails: function(){
		
		$('#globalizationContainer').show();

		navigator.globalization.getPreferredLanguage(
			function(language){
				$('#preferredLanguage').html('Preffered Language : ' + language.value);
			},
			function(){
				navigator.notification.alert('Error getting language', null, 'Error', 'Ok');
			}
		);

		navigator.globalization.getLocaleName(
			function(locale){
				$('#localeName').html('Locale Name : ' + locale.value);
			},
			function(){
				navigator.notification.alert('Error getting locale', null, 'Error', 'Ok');
			}
		);

		navigator.globalization.getDatePattern(
			function(date){
				$('#datePattern').html('Date Pattern : ' + date.pattern);
			},
			function(){
				navigator.notification.alert('Error getting pattern', null, 'Error', 'Ok');
			},
			{ formatLength:'short', selector:'date and time' }
		);

		navigator.globalization.getDateNames(
			function(names){
				var data = 'Months : ';
				for (var i = 0; i < names.value.length; i++) {
					data += names.value[i] + "\n";
				};
				$('#dateNames').html(data);
			},
			function(){
				navigator.notification.alert('Error getting names', null, 'Error', 'Ok');
			},
			{ type:'wide', item:'months' }
		);

		navigator.globalization.isDayLightSavingsTime(
			new Date(),
			function(date){
				$('#dayLightSavingsTime').html('Day Light Savings Time : ' + date.dst);
			},
			function(){
				navigator.notification.alert('Error getting Day Light Savings Time', null, 'Error', 'Ok');
			}
		);

		navigator.globalization.getFirstDayOfWeek(
			function(day){
				$('#firstDayOfWeek').html('First Day of Week : ' + day.value);
			},
			function(){
				navigator.notification.alert('Error getting Day', null, 'Error', 'Ok');
			}
		);
	}
};

var inAppBrowser = {
	addEventListener: function() {
		var ref = window.open('http://www.photon.in/en/', '_blank', 'location=yes');
		ref.addEventListener('loadstart', this.loadEvent);
		ref.addEventListener('loadstop', this.loadEvent);
		ref.addEventListener('loaderror', this.loadError);
		ref.addEventListener('exit', this.loadExit);
	},

	loadEvent: function(event) {
		navigator.notification.alert(event.type + ' : ' + event.url, null, 'Alert', 'Ok');
	},

	loadError: function(event) {
		navigator.notification.alert(event.type + ' : ' + event.message, null, 'Alert', 'Ok');
	},

	loadExit: function(event) {
		navigator.notification.alert(event.type, null, 'Alert', 'Ok');
	},

	close: function() {
		var ref = window.open('http://www.photon.in/en/', '_blank', 'location=yes');
		setTimeout(function() {
			ref.close();
		}, 5000);
	},

	replaceHeaderImage: function() {
		var ref = window.open('http://www.photon.in/en/', '_blank', 'location=yes');
		ref.addEventListener('loadstop', function(){
			ref.executeScript({
				code: "var img=document.querySelector('#logotype'); img.src='http://cordova.apache.org/images/cordova_bot.png';"
			}, function(){
				navigator.notification.alert('Script Executed!', null, 'Alert', 'Ok');			
			});
		});
	},

	changeCSS: function() {
		var ref = window.open('http://www.photon.in/en/', '_blank', 'location=yes');
		ref.addEventListener('loadstop', function(){
			ref.insertCSS({
				code: "body{ background: #ffff00; }"
			}, function(){
				navigator.notification.alert('Styles Altered!', null, 'Alert', 'Ok');			
			});
		});
	}
};

var mediaPlugin = {
	playAudio: function(src) {
		mediaVar = new Media(src, this.onSuccess, this.onError);

		mediaVar.play();

		$('#audioDuration').show();
		$('#audioPosition').show();

		if (mediaTimer == null) {
			mediaTimer = setInterval(function(){
				mediaVar.getCurrentPosition(function(position){
					if (position > -1) {
						$('#audioPosition').html(position + ' sec');
					}
				}, function(e){
					navigator.notification.alert('Error getting pos : ' + e);
						$('#audioPosition').html('Error: ' + e);
				});
			}, 1000);
		}

		var counter = 0;

		mediaTimerDuration = setInterval(function() {

			counter += 100;

			if (counter > 2000) {
				clearInterval(mediaTimerDuration);
			}

			var dur = mediaVar.getDuration();

			if (dur > 0) {
				clearInterval(mediaTimerDuration);
				$('#audioDuration').html(dur + ' sec');
			}
		}, 100);
	},

	pauseAudio: function() {
		if (mediaVar) {
			mediaVar.pause();
		}
	},

	stopAudio: function(){
		if (mediaVar) {
			mediaVar.stop();
		}
		clearInterval(mediaTimer);
		mediaTimer = null;
	},

	onSuccess: function() {

	},

	onError: function(error) {
		navigator.notification.alert('code: ' + error.code + '\nmessage: ' + error.message);
	},

	setVolume: function(volume) {
		if (mediaVar) {
			mediaVar.setVolume(volume);
		}
	},

	startRecordAudio: function() {
		$('#audioPosition').show();

		var src;

		if(device.platform == "Android") {
			src = "recording.amr";
		} else {
			src = "documents://recording.wav";
		}

		mediaRec = new Media(src, this.onSuccess, this.onError);

		mediaRec.startRecord();

		var recTime = 0;
		recInterval = setInterval(function(){
			recTime++;
			$('#audioPosition').html(recTime + ' sec');
		}, 1000);
	},

	stopRecordAudio: function() {
		clearInterval(recInterval);
		mediaRec.stopRecord();
	},

	playRecordAudio: function() {
		var src;

		if(device.platform == "Android") {
			src = "recording.amr";
		} else {
			src = "documents://recording.wav";
		}

		this.playAudio(src);
	}
};

var storage = {
	insertEntry: function() {
		var db = window.openDatabase('Database', '1.0', 'Cordova Demo', 200000);
		db.transaction(this.populateDB, this.onError, this.onSuccess);
	},

	populateDB: function(tx) {
		var id = $('#dbId').val();
		var data = $('#dbData').val();
		tx.executeSql('CREATE TABLE IF NOT EXISTS DEMO (id, data)');
		tx.executeSql('INSERT INTO DEMO (id, data) VALUES (' + id + ', "' + data + '")');
	},

	onSuccess: function() {
		navigator.notification.alert('Entry inserted successfully!', null, 'Success', 'Ok');
		$('#dbId').val('');
		$('#dbData').val('');
	},

	onError: function(tx, error) {
		navigator.notification.alert('Error processing SQL: ' + error, null, 'Error', 'Ok');
	},

	viewDB: function() {
		var db = window.openDatabase('Database', '1.0', 'Cordova Demo', 200000);
		db.transaction(this.queryDB, this.onError);
	},

	queryDB: function(tx) {
		tx.executeSql('SELECT * FROM DEMO', [], function(t, results) {
			var len = results.rows.length;
			var content;
			for (var i = 0; i < len; i++) {
				content += "<tr><td>" + results.rows.item(i).id + "</td><td>" + results.rows.item(i).data + "</td></tr>";
			}
			$('#dbViewTableBody').html(content);
			$('#viewTableContents').show();
		}, this.onError);
	},

	dropTable: function() {
		var db = window.openDatabase('Database', '1.0', 'Cordova Demo', 200000);
		db.transaction(
			function(tx){
				tx.executeSql('DROP TABLE IF EXISTS DEMO');
			}, 
			this.onError, 
			function() {
				navigator.notification.alert('Table dropped successfully!', null, 'Success', 'Ok');
				$('#viewTableContents').hide();
			}
		);
	}
};