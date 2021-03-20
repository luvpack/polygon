const {ipcRenderer} = require('electron');

const getSavePath = () => {
	console.log('getSavePath')
	return ipcRenderer.invoke('get-save-path').then(value => {
		return value;
	});
};

const openSavePath = async () => {
	await ipcRenderer.invoke('open-save-path')
		.then(() => console.log('open'))
};

const changeSavePath = () => {
	ipcRenderer.invoke('change-save-path').then(res => {
		if (res) {
			console.log(res)
			linkPath.textContent = res;
		}
	});
};

const getAutostartBool = async () => {
	return ipcRenderer.invoke('get-autostart-bool').then(res => res);
};

const setAutostartBool = value => {
	ipcRenderer.invoke('set-autostart-bool', (value));
};

const linkPath = document.querySelector('#link__save-path');
const changePath = document.querySelector('#button__change-path');

const autoStartToggle = document.querySelector('#toggle__autostart');

document.addEventListener('DOMContentLoaded', () => {
	linkPath.addEventListener('click', () => openSavePath());
	changePath.addEventListener('click', () => changeSavePath());

	getAutostartBool().then(result => {
		autoStartToggle.querySelector('input').checked = result;
	});

	autoStartToggle.querySelector('input').addEventListener('change', () => {
		if (autoStartToggle.querySelector('input').checked) {
			setAutostartBool(true);
		} else if (!autoStartToggle.querySelector('input').checked) {
			setAutostartBool(false);
		}
	});

	getSavePath().then(res => {
		linkPath.textContent = res;
	});
});

