'use strict';
const path = require('path');
const {app, BrowserWindow} = require('electron');
/// const {autoUpdater} = require('electron-updater');
const {is} = require('electron-util');
const unhandled = require('electron-unhandled');

const { hasScreenCapturePermission } = require('mac-screen-capture-permissions');

// Const config = require('./config');
const {initHandlers} = require('./ipc');
const {setAppMenu} = require('./menus');
const config = require('./config');

unhandled();

// Note: Must match `build.appId` in package.json
app.setAppUserModelId('com.hyperwave.Polygon');

// Uncomment this before publishing your first version.
// It's commented out as it throws an error if there are no published versions.
// if (!is.development) {
// 	const FOUR_HOURS = 1000 * 60 * 60 * 4;
// 	setInterval(() => {
// 		autoUpdater.checkForUpdates();
// 	}, FOUR_HOURS);
//
// 	autoUpdater.checkForUpdates();
// }

// Prevent window from being garbage collected
let mainWindow; let prefsWin;

const createMainWindow = async () => {
	const win = new BrowserWindow({
		title: app.name,
		show: false,
		width: 400,
		height: 70,
		resizable: false,
		frame: false,
		zoomToPageWidth: false,
		fullscreen: false,
		fullscreenable: false,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			enableRemoteModule: false,
			webSecurity: true
		}
	});

	// TsWin.setBackgroundColor('rgba(67, 67, 67, 0.51)')

	win.on('ready-to-show', () => {
		setAppMenu();
		win.show();
		// TsWin.show()
	});

	win.on('closed', () => {
		// Dereference the window
		// For multiple  windows store them in an array
		mainWindow = undefined;
	});

	await win.loadFile(path.join(__dirname, '../render/index.html'));

	return win;
};

// Prevent multiple instances of the app
if (!app.requestSingleInstanceLock()) {
	app.quit();
}

app.on('second-instance', () => {
	if (mainWindow) {
		if (mainWindow.isMinimized()) {
			mainWindow.restore();
		}

		mainWindow.show();
	}
});

app.on('window-all-closed', () => {
	if (!is.macos) {
		app.quit();
	}
});

app.on('activate', async () => {
	if (!mainWindow) {
		mainWindow = await createMainWindow();
	}
});

(async () => {
	await app.whenReady();

	mainWindow = await createMainWindow();

	if (config.get('autostart')) {
		app.setLoginItemSettings({
			openAtLogin: true
		});
	} else {
		app.setLoginItemSettings({
			openAtLogin: false
		});
	}

	hasScreenCapturePermission();

	initHandlers();
})();
