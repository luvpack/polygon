'use strict';
const Store = require('electron-store');

module.exports = new Store({
	defaults: {
		savePath: `${process.env.HOME}/Movies/Polygon`,
		autostart: false
	}
});
