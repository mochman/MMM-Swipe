/* Magic Mirror
 * Module: MMM-Swipe
 * 
 * By Luke Moch
 * MIT Licensed
 */

Module.register("MMM-Swipe", {
	defaults : {
		echoLeftPin: 24,
		triggerLeftPin: 23,
		echoRightPin: 26,
		triggerRightPin: 25,
		leftDistance: 20,
		rightDistance: 20,
		sensorTimeout: 500,
		animationSpeed: 200,
		sampleInterval: 300,
		swipeSpeed: 1000,
		verbose: false,
		calibrate: false
	},
	  
	start: function() {
		var self = this;
		var previousNote = null;
		var notificationData = null;
		var notificationInfo = null;
		var displayData = null;
		var currentData = false;
		console.log('Starting Module: ' + this.name);
		if(((27 - self.config.echoLeftPin)*(27 - self.config.echoRightPin) * (27 - self.config.triggerLeftPin) * (27 - self.config.triggerRightPin))>0) {
			setInterval(function () {
				if (self.currentData === 1) {
					if(self.notificationInfo === 'MOVEMENT') {
						self.sendNotification(self.notificationInfo, self.notificationData);
					}
					self.displayData = self.notificationData;
					if (self.config.verbose === true || self.config.calibrate === true) {
						self.currentData = 2;
					} else {
						self.currentData = 0;
					}
				} else if (self.config.calibrate === true) {
					self.sendSocketNotification('CALIBRATE', self.config);
				} else {
					self.currentData = 0;
					self.notificationInfo = null;
					self.displayData = null;
					self.sendSocketNotification('INIT', self.config);
				}
				
				if (self.currentData === 2) {
					self.updateDom(self.config.animationSpeed);
					self.currentData = 0;
				}
			}, self.config.sampleInterval);
		} else {
			console.log("Improper Pin configuration.  Please use BCM Numbering");
		}
	},
	
	socketNotificationReceived: function(notification, payload) {

		if (notification === 'CALIBRATION') {
			this.notificationData = "<table border=\"1\" cellpadding=\"5\"><tr align=\"center\"><th>Left</td><th>Right</td></tr><tr align=\"center\"><td>" + payload[0] + "</td><td>" + payload[1] + "</td></tr></table>";
			this.currentData = 1;
		} else if(notification === 'MOVEMENT' && this.previousNote !== 'MOVEMENT' && this.currentData === 0) {
			this.previousNote = notification;
			this.notificationData = payload;
			this.notificationInfo = notification;	
			this.currentData = 1;
		} else if(notification === 'STATUS' && this.currentData === 0) {
			this.previousNote = notification;
			this.notificationData = payload;
			this.currentData = 1;
		} else {
			this.notificationData = "";
			this.currentData = 0;
		}
	},
	
	getDom: function() {
		var wrapper = document.createElement("div");
		if(this.displayData !== undefined) {
		wrapper.innerHTML = this.displayData;
		wrapper.className = "dimmed light small";
		}
		return wrapper;
	}
});