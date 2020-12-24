const {ipcMain} = require('electron-better-ipc');
const {shell, dialog} = require('electron');
const utils = require('electron-util');
const browserWindow = require('electron').BrowserWindow;

const ffmpegPath = utils.fixPathForAsarUnpack(require('@ffmpeg-installer/ffmpeg').path);
const ffmpeg = require('fluent-ffmpeg');

const config = require('./config');

const savePath = config.get('savePath');

// Show popup menu when clicked more__button
const getMoreMenuHandler = () => ipcMain.handle('get-more-menu', async () => {
	require('./menus').getMoreMenu().popup({window: browserWindow});
});

// Show popup menu with applcation list
const getAppsMenuHandler = () => ipcMain.handle('get-apps-menu', async (event, sources) => {
	require('./menus').getAppsMenu(JSON.parse(sources)).popup({window: browserWindow});
});

const convertToHandler = () => ipcMain.handle('convert-file', async (event, options) => {
	ffmpeg.setFfmpegPath(ffmpegPath);

	ffmpeg(`${options.path}/${options.fileName}`)
		.outputOption('-c:v', 'copy')
		.save(`${config.get('savePath')}/${options.fileName}.mp4`)
		.on('end', () => shell.openPath(config.get('savePath')))
		.on('error', err => console.log(err.message));
});

const getSavePathHandler = () => ipcMain.handle('get-save-path', () => savePath);

const openSavePathHandler = () => ipcMain.handle('open-save-path', () => shell.openPath(savePath));

const changeSavePathHandler = async () => {
	return ipcMain.handle('change-save-path', () => {
		return dialog.showOpenDialog({
			title: 'Select Polygon folder',
			defaultPath: savePath,
			properties: ['openDirectory']
		}).then(result => {
			if (result.filePaths.length > 0) {
				config.set('savePath', result.filePaths[0]);
				return result.filePaths[0];
			}
		});
	});
};

const getAutostartBoolHandler = () => {
	ipcMain.handle('get-autostart-bool', () => config.get('autostart'));
};

const setAutostartBoolHandler = () => {
	ipcMain.handle('set-autostart-bool', (ev, value) => {
		config.set('autostart', value);
	});
};

const initHandlers = () => {
	getMoreMenuHandler();
	getAppsMenuHandler();
	convertToHandler();

	getSavePathHandler();
	openSavePathHandler();
	changeSavePathHandler();

	getAutostartBoolHandler();
	setAutostartBoolHandler();
};

const sendMediaId = id => {
	ipcMain.callFocusedRenderer('media-id', id);
};

module.exports = {initHandlers, sendMediaId};

