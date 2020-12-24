const {ipcRenderer} = require('electron');

const appsMenuGet = sources => ipcRenderer.invoke('get-apps-menu', JSON.stringify(sources));

const moreMenuGet = () => ipcRenderer.invoke('get-more-menu');

const useConverter = options => ipcRenderer.invoke('converter-use', {filename: options.filename, format: options.format});

module.exports = {appsMenuGet, moreMenuGet, useConverter};
