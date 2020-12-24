'use strict';
const {app, Menu} = require('electron');
const {BrowserWindow} = require('electron');
const {is} = require('electron-util');

const {sendMediaId} = require('./ipc');
const { openPrefsWindow } = require('./prefs');

const appMenuTemplate = [
	// { role: 'appMenu' }
	...(is.macos ? [{
		label: app.name,
		submenu: [
			{role: 'about'},
			{type: 'separator'},
			{role: 'services'},
			{type: 'separator'},
			{role: 'hide'},
			{role: 'hideothers'},
			{role: 'unhide'},
			{type: 'separator'},
			{role: 'quit'}
		]
	}] : []),
	// { role: 'fileMenu' }
	{
		label: 'File',
		submenu: [
			is.macos ? {role: 'close'} : {role: 'quit'}
		]
	},
	// { role: 'editMenu' }
	{
		label: 'Edit',
		submenu: [
			{role: 'undo'},
			{role: 'redo'},
			{type: 'separator'},
			{role: 'cut'},
			{role: 'copy'},
			{role: 'paste'},
			...(is.macos ? [
				{role: 'pasteAndMatchStyle'},
				{role: 'delete'},
				{role: 'selectAll'},
				{type: 'separator'},
				{
					label: 'Speech',
					submenu: [
						{role: 'startspeaking'},
						{role: 'stopspeaking'}
					]
				}
			] : [
				{role: 'delete'},
				{type: 'separator'},
				{role: 'selectAll'}
			])
		]
	},
	// { role: 'viewMenu' }
	{
		label: 'View',
		submenu: [
			{role: 'reload'},
			{role: 'forcereload'},
			{role: 'toggledevtools'},
			{type: 'separator'},
			{type: 'separator'}
		]
	},
	// { role: 'windowMenu' }
	{
		label: 'Window',
		submenu: [
			{role: 'minimize'},
			{role: 'zoom'},
			...(is.macos ? [
				{type: 'separator'},
				{role: 'front'},
				{type: 'separator'},
				{role: 'window'}
			] : [
				{role: 'close'}
			])
		]
	},
	{
		role: 'help',
		submenu: [
			{
				label: 'Learn More',
				click: async () => {
					const {shell} = require('electron');
					await shell.openExternal('https://electronjs.org');
				}
			}
		]
	}
];

const aboutItem = {
	label: `About ${app.name}`,
	accelerator: 'Command+O',
	click: () => app.showAboutPanel()
};

const preferencesItem = {
	label: 'Preferences…',
	accelerator: 'Command+,',
	click: () => openPrefsWindow()
};

const moreMenuTemplate = () => [
	aboutItem,
	{
		type: 'separator'
	},
	preferencesItem,
	{
		type: 'separator'
	},
	{
		role: 'quit',
		accelerator: 'Command+Q'
	}
];

const buildAppsTemplate = sources => {
	const template = [];
	for (const source of sources) {
		template.push({label: source.name, click: () => sendMediaId(source.id)});
	}

	return template.filter(obj => obj !== null || obj !== undefined);
};

const getAppsMenu = sources => {
	const template = buildAppsTemplate(sources);
	return Menu.buildFromTemplate(template);
};

const moreMenu = Menu.buildFromTemplate(moreMenuTemplate());

const getMoreMenu = () => moreMenu;

// App menu
const appMenu = Menu.buildFromTemplate(appMenuTemplate);

const setAppMenu = () => Menu.setApplicationMenu(appMenu);

module.exports = {getMoreMenu, getAppsMenu, setAppMenu};
