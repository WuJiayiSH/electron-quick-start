// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
const TabGroup = require('electron-tabs')

const tabGroup = new TabGroup({
  newTab: {
    title: 'New Tab'
  }
})

tabGroup.addTab({
  title: 'Google',
  src: 'http://google.com',
  active: true
})
