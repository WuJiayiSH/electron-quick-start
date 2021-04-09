const { dialog, BrowserWindow, app, shell } = require('electron')
const project = require('../project')
const path = require('path')

async function openProject () {
  const { canceled, filePaths } = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
    properties: ['openDirectory']
  })

  if (!canceled) {
    try {
      project.openProject(filePaths[0])
    } catch (ex) {
      dialog.showMessageBox(BrowserWindow.getFocusedWindow(), {
        type: 'warning',
        message: ex.message
      })
    }
  }
}

async function closeProject () {
  await project.closeProject()
}

async function preferences () {
  shell.openPath(path.join(app.getPath('userData'), 'config.json'))
}

module.exports = {
  openProject,
  closeProject,
  preferences
}
