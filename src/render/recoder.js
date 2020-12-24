const {desktopCapturer, ipcRenderer} = require('electron');

const fs = require('fs');
const tempy = require('tempy');
const moment = require('moment');

const Recorder = function () {
	this._id = null;
	this._type = 'screen';
	this.selectedScreen = 0;
	this.size = {width: 1920, height: 1080};
	this._blobs = [];
	this._cache = {};
	this._recOptions = {
		mimeType: 'video/webm;codecs=h264',
		videoBitsPerSecond: 35000000
	};
	this._navigator = window.navigator;
	this._recorder = null;

	Object.defineProperty(this, 'id', {
		get() {
			return this._id;
		},
		set(val) {
			this._id = val;
		}
		// Writable: true
	});

	Object.defineProperty(this, 'type', {
		get() {
			return this._type;
		},
		set(val) {
			this._type = val;
		}
		// Writable: true
	});

	Object.defineProperty(this, 'blobs', {
		get() {
			return this._blobs;
		},
		set(val) {
			this._blobs = val;
		}
	});
};

Recorder.prototype.convert = function (path, fileName) {
	ipcRenderer.invoke('convert-file', ({path, fileName}));
};

Recorder.prototype.getStreamById = function (id) {
	const constraints = {
		audio: false,
		video: {
			mandatory: {
				chromeMediaSource: 'desktop',
				chromeMediaSourceId: id,
				minWidth: this.size.width,
				minHeight: this.size.height
			}
		}
	};

	return this._navigator.mediaDevices.getUserMedia(constraints);
};

Recorder.prototype.getSelectedScreenId = function () {
	return this.getSources('screen').then(screens => screens[this.selectedScreen].id);
};

Recorder.prototype.getSources = function (type) {
	// 'window', 'screen'
	return desktopCapturer.getSources({types: [type], fetchWindowIcons: true}).then(sources => sources);
};

Recorder.prototype.start = async function () {
	const stream = this.type === 'screen' ? await this.getSelectedScreenId().then(scrid => this.getStreamById(scrid)) : await this.getStreamById(this.id);
	this._recorder = new MediaRecorder(stream, this._recOptions);
	this._recorder.addEventListener('dataavailable', event => {
		this._blobs.push(event.data);
	});

	this._recorder.start();
};

Recorder.prototype.stop = function () {
	this._recorder.addEventListener('stop', () => {
		this.saveAs(this.blobs[this.blobs.length - 1], `Polygon ${moment().format('dddd, MMMM Do YYYY, h:mm:ss a')}`);
	});

	this._recorder.stop();
};

Recorder.prototype.saveAs = function (blob, fileName) {
	const f = new FileReader();
	const tmp = tempy.root;
	f.addEventListener('loadend', () => {
		fs.promises.writeFile(`${tmp}/${fileName}.webm`, Buffer.from(f.result))
			.then(() => this.convert(`${tmp}`, `${fileName}.webm`))
			.catch(error => console.log(error));
	});

	f.readAsArrayBuffer(blob);
};

module.exports = Recorder;
