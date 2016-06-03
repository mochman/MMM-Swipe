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
		calibrate: false
	},
	
	socketNotificationReceived: function(notification, payload) {
		this.sendNotification(notification, payload);
	},
  
	start: function() {
		var self = this;
		var notificationData = null;
		var displayData = null;
		var currentData = false;
		
		this.sendSocketNotification('INIT', self.config);

		console.log('Starting Module: ' + this.name);
		setInterval(function () {
			//console.log("calibrate = " + self.config.calibrate);
			if (self.currentData === 1) {
				self.displayData = self.notificationData;
				self.currentData = 2;
			} else if (self.config.calibrate === true) {
				self.sendSocketNotification('CALIBRATE', self.config);
			} else {
				//self.displayData = "";
				self.sendSocketNotification('RESET', self.config);
			}
			self.updateDom(self.config.animationSpeed);
			if (self.currentData === 2) {
				self.currentData = 0;
			}
		}, self.config.sampleInterval);
	},
	
	socketNotificationReceived: function(notification, payload) {
		if (notification === 'CALIBRATION') {
			this.notificationData = "<table border=\"1\" cellpadding=\"5\"><tr align=\"center\"><th>Left</td><th>Right</td></tr><tr align=\"center\"><td>" + payload[0] + "</td><td>" + payload[1] + "</td></tr></table>";
		} else if(notification === 'MOVEMENT') {
			 this.notificationData = payload;
		} else {
			this.notificationData = notification + " - " + payload;
		}
		this.currentData = 1;
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