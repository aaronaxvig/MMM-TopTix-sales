/* global Module */

/* Magic Mirror
 * Module: MMM-TopTix-sales
 *
 * By Aaron Axvig https://github.com/aaronaxvig
 * MIT Licensed
 */

Module.register("MMM-TopTix-sales", {
	defaults: {
		feedUrl: "https://www.floralpavilion.com/feed/events?todate=2017-01-15?&json",
		updateInterval: 60 * 60 * 1000, // 60 minutes
		initialLoadDelay: 0 // 0 seconds delay
	},

	start: function () {
		self = this;
		this.url = this.urls[this.config.location];

		this.text = null;

		this.scheduleUpdate(this.config.initialLoadDelay);
	},

	/* updateData()
	 * Requests new data from the API
	 * Calls processData on successfull response.
	 */
	updateData: function() {
		if (this.config.feedUrl === "") {
			Log.error("CurrentData: feed URL not set!");
			return;
		}

		var url = this.config.feedUrl;
		var self = this;
		var retry = true;

		var dataRequest = new XMLHttpRequest();
		dataRequest.open("GET", url, true);
		dataRequest.onreadystatechange = function() {
			if (this.readyState === 4) {
				if (this.status === 200) {
					self.processData(JSON.parse(this.response));
				} else {
					Log.error(self.name + ": Could not load data.");
				}

				if (retry) {
					self.scheduleUpdate((self.loaded) ? -1 : self.config.retryDelay);
				}
			}
		};
		dataRequest.send();
	},
	
	processData: function(data) {

		if (!data || !data.main || !data.main.temp) {
			// Did not receive usable new data.
			// Maybe this needs a better check?
			return;
		}

		this.text = data.feed.title;

		this.show(this.config.animationSpeed, {lockString:this.identifier});
		this.loaded = true;
		this.updateDom(this.config.animationSpeed);
	},

	/* scheduleUpdate()
	 * Schedule next update.
	 *
	 * argument delay number - Milliseconds before next update. If empty, this.config.updateInterval is used.
	 */
	scheduleUpdate: function(delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}

		var self = this;
		setTimeout(function() {
			self.updateData();
		}, nextLoad);
	},

	getStyles: function () {
		return ["MMM-TopTix-sales.css"]
	},

	getDom: function () {
		var wrapper = document.createElement("div");
		
		wrapper.innerHTML = '<p>' + this.config.text + 'test</p>';

		return wrapper;
	}
});
