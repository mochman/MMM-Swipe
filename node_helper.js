'use strict';

/* Magic Mirror
 * Module: MMM-Swipe
 * 
 * By Luke Moch http://github.com/mochman/
 * MIT Licensed
 */

const NodeHelper = require('node_helper');
const usonic = require('mmm-usonic');
const statistics = require('math-statistics');


module.exports = NodeHelper.create({
	start: function () {
		const self = this;
		usonic.init(function (error) {
			if (error) {
				console.log(error);
			} else {
				self.initSensor();
                        }
		});	
	},
	
	socketNotificationReceived: function (notification, payload) {
		const self = this;
		this.config = payload;
		var sensorLeft;
		var sensorRight;
		if ( notification === 'INIT') {
			self.sendSocketNotification('STATUS', 'Initialized');
		} else if ( notification === 'CALIBRATE') {

			self.sensorLeft = usonic.createSensor(self.config.echoLeftPin, self.config.triggerLeftPin, self.config.sensorTimeout);
			self.sensorRight = usonic.createSensor(self.config.echoRightPin, self.config.triggerRightPin, self.config.sensorTimeout);
			var distances = [this.sensorLeft().toFixed(2), this.sensorRight().toFixed(2)];
			self.sendSocketNotification('CALIBRATION', distances);
		} else if (notification === 'RESET') {
			self.sensorLeft = usonic.createSensor(self.config.echoLeftPin, self.config.triggerLeftPin, self.config.sensorTimeout);
			self.sensorRight = usonic.createSensor(self.config.echoRightPin, self.config.triggerRightPin, self.config.sensorTimeout);
			//var distanceLeft = this.sensorLeft().toFixed(2);
			//var distanceRight = this.sensorRight().toFixed(2);
			if (this.sensorLeft().toFixed(2) <= self.config.leftDistance) {
				var distancesLeft;
				var distancesRight;
				var i = 5;
				var countdownTime = self.config.swipeSpeed / i;
				(function measure(x) {
				  //console.log("Iteration - " + x);
					if(x == i) {
					self.distancesLeft = [];
					self.distancesRight = [];
					} else if (x == 1 ) {
						var avgLeft = statistics.median(self.distancesLeft).toFixed(0);
						var avgRight = statistics.median(self.distancesRight).toFixed(0);
						//console.log("Left - " + avgLeft);
						//console.log("Right - " + avgRight);
						if( avgLeft <= self.config.leftDistance && avgRight <= self.config.rightDistance) {
							self.sendSocketNotification('MOVEMENT', 'Press');
						} else if ( avgRight * 1.3 <= avgLeft ) {
							self.sendSocketNotification('MOVEMENT', 'Swipe Right');
						}
					}
					setTimeout(function () {
						self.distancesLeft.push(self.sensorLeft());
						self.distancesRight.push(self.sensorRight());
						if(--x) measure(x);
					}, countdownTime);
				})(i);	
				//console.log("Left Avg - " + statistics.median(self.distancesLeft).toFixed(2));
				//console.log("Right Avg - " + statistics.median(self.distancesRight).toFixed(2));
				//self.sendSocketNotification('MOVEMENT', "Left");
			} else if (this.sensorRight().toFixed(2) <= self.config.rightDistance) {
				var distancesLeft;
				var distancesRight;
				var i = 5;
				var countdownTime = self.config.swipeSpeed / i;
				(function measure(x) {
				  //console.log("Iteration - " + x);
					if(x == i) {
					self.distancesLeft = [];
					self.distancesRight = [];
					} else if (x == 1 ) {
						var avgLeft = statistics.median(self.distancesLeft).toFixed(0);
						var avgRight = statistics.median(self.distancesRight).toFixed(0);
						//console.log("Left - " + avgLeft);
						//console.log("Right - " + avgRight);
						if( avgLeft <= self.config.leftDistance && avgRight <= self.config.rightDistance) {
							self.sendSocketNotification('MOVEMENT', 'Press');
						} else if ( avgLeft * 1.3 <= avgRight ) {
							self.sendSocketNotification('MOVEMENT', 'Swipe Left');
						}
					}
					setTimeout(function () {
						self.distancesLeft.push(self.sensorLeft());
						self.distancesRight.push(self.sensorRight());
						if(--x) measure(x);
					}, countdownTime);
				})(i);
			} else {
				self.sendSocketNotification('STATUS', "Waiting for Movement");
			}
		}
	},
	
	initSensor: function () {
	}
  
});


//var sensor1 = usonic.createSensor(24, 23, 500);
//var sensor2 = usonic.createSensor(26, 25, 500);