const $ = require('jquery');
const {ipcRenderer} = require('electron');
const Recorder = require('./recoder');

const recorder = new Recorder();

$(document).on('DOMContentLoaded', async () => {
	ipcRenderer.on('media-id', id => {
		recorder.id = id;
		recorder.type = 'window';
		buttons.selectApp.get(0).dataset.selected = 'true';
	});

	const buttons = Object.assign({}, {
		more: $('#button__more'),
		record: $('#button__record'),
		selectApp: $('#button__select-app'),
		crop: $('button__crop'),
		cropFs: $('button__use-fs')
	});

	buttons.record.on('click', e => {
		if (e.currentTarget.dataset.record === 'false') {
			e.currentTarget.dataset.record = 'true';
			recorder.start.bind(recorder)();
		} else {
			e.currentTarget.dataset.record = 'false';
			recorder.stop.bind(recorder)();
		}
	});

	buttons.selectApp.on('click', async event => {
		if (event.currentTarget.dataset.selected === 'false') {
			const sources = await recorder.getSources('window');
			await require('./ipc').appsMenuGet(sources);
		} else {
			event.currentTarget.dataset.selected = 'false';
			recorder.type = 'screen';
		}
	});

	buttons.more.on('click', async () => {
		await require('./ipc').moreMenuGet()
	});
});

module.exports = {recorder};
