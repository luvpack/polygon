'use strict';

const {BrowserWindow} = require('electron');
const path = require('path');

let prefsWindow = null;

const openPrefsWindow = async options => {
	if (prefsWindow) {
		prefsWindow.show();
		return prefsWindow;
	}

	prefsWindow = new BrowserWindow({
		title: 'Preferences',
		width: 480,
		height: 480,
		resizable: false,
		minimizable: false,
		maximizable: false,
		fullscreenable: false,
		titleBarStyle: 'hiddenInset',
		show: false,
		frame: true,
		backgroundColor: '#fff',
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			enableRemoteModule: false,
			webSecurity: true
		}
	});

	const titlebarHeight = 30;
	prefsWindow.setSheetOffset(titlebarHeight);

	prefsWindow.on('close', () => {
		prefsWindow = null;
	});

	await prefsWindow.loadFile(path.join(__dirname, '../render/prefs.html'));

	// Await pEvent(prefsWindow.webContents, 'did-finish-load');

	// Await promisify(ipc.answerRenderer)('preferences-ready');

	prefsWindow.webContents.openDevTools({
		mode: 'detach'
	})
	prefsWindow.show();
	return prefsWindow;
};

const closePrefsWindow = () => {
	if (prefsWindow) {
		prefsWindow.close();
	}
};

module.exports = {
	openPrefsWindow,
	closePrefsWindow
};
