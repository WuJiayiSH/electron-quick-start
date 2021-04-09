const session = require('../session')
const { exec } = require('child_process')
const { dialog, BrowserWindow } = require('electron')
const fs = require('fs')
const path = require('path')

function checkProjectPath () {
  if (!session.projectPath) {
    dialog.showMessageBox(BrowserWindow.getFocusedWindow(), {
      type: 'warning',
      message: 'You have to open a cocos2d-x project before this operation.'
    })
    return false
  } else {
    return true
  }
}

/*
async function compile () {
  if (!checkProjectPath()) {
    return
  }

  exec(`cocos compile -p emscripten -s ${session.projectPath}`, (err, stdout, stderr) => {
    if (err) {
      console.error(err)
      return
    }
    console.log(stdout)
  })
}
*/

async function clean () {
  if (!checkProjectPath()) {
    return
  }

  fs.rmdirSync(path.join(session.projectPath, 'emscripten-build'), { recursive: true })
}

async function buildResources () {
  if (!checkProjectPath()) {
    return
  }

  if (!process.env.EMSDK_ROOT) {
    dialog.showMessageBox(BrowserWindow.getFocusedWindow(), {
      type: 'warning',
      message: 'EMSDK_ROOT not found, run setup.py under cocos2d-x to setup emsdk'
    })
  }

  const resourceDataPath = path.join(session.projectPath, 'emscripten-build', 'bin', session.projectName, 'resource.data')
  const resourceJsPath = path.join(session.projectPath, 'emscripten-build', 'bin', session.projectName, 'resource.js')
  const dataFiles = []
  if (session.projectType === 'cpp') {
    dataFiles.push(path.join(session.projectPath, 'Resources@'))
  } else {
    dataFiles.push(path.join(session.projectPath, 'src@', 'src'))
    dataFiles.push(path.join(session.projectPath, 'res@', 'res'))
  }

  if (process.platform === 'win32') {
    const emsdkEnvPath = path.join(process.env.EMSDK_ROOT, 'emsdk_env.bat')
    const filePackagerPath = path.join(process.env.EMSDK_ROOT, 'upstream', 'emscripten', 'tools', 'file_packager.bat')
    const command = `${emsdkEnvPath} && ${filePackagerPath} ${resourceDataPath} --use-preload-cache --preload ${dataFiles.join(' ')} --js-output=${resourceJsPath}`
    exec(command, (err, stdout, stderr) => {
      if (err) {
        console.error(err)
        return
      }
      console.log(stdout)
    })
  } else {
    const emsdkEnvPath = path.join(process.env.EMSDK_ROOT, 'emsdk_env')
    const filePackagerPath = path.join(process.env.EMSDK_ROOT, 'upstream', 'emscripten', 'tools', 'file_packager')
    const command = `source ${emsdkEnvPath} && ${filePackagerPath} ${resourceDataPath} --use-preload-cache --preload ${dataFiles.join(' ')} --js-output=${resourceJsPath}`
    exec(command, { shell: 'bash' }, (err, stdout, stderr) => {
      if (err) {
        console.error(err)
        return
      }
      console.log(stdout)
    })
  }
}

async function run () {
  if (!checkProjectPath()) {
    return
  }

  BrowserWindow.getFocusedWindow().loadURL(`http://localhost:${session.httpServerPort}/${session.projectName}.html`)
}

async function stop () {
  if (!checkProjectPath()) {
    return
  }

  BrowserWindow.getFocusedWindow().loadFile('index.html')
}

module.exports = {
  clean,
  buildResources,
  run,
  stop
}
