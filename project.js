const path = require('path')
const fs = require('fs')
const readline = require('readline')
const session = require('./session')
const httpServer = require('http-server')
const { BrowserWindow } = require('electron')
const Store = require('electron-store')
const { storeSchema } = require('./config')

const reSetAppName = /\s*set\s*\(\s*APP_NAME/i

async function openProject (projectPath) {
  const store = new Store({
    schema: storeSchema
  })
  const cocosProjPath = path.join(projectPath, '.cocos-project.json')
  if (!fs.existsSync(cocosProjPath)) {
    throw Error('Invalid project path, missing .cocos-project.json')
  }

  const cmakeListsPath = path.join(projectPath, 'CMakeLists.txt')
  if (!fs.existsSync(cmakeListsPath)) {
    throw Error('Invalid project path, missing CMakeLists.txt')
  }

  const readlineInterface = readline.createInterface({
    input: fs.createReadStream(cmakeListsPath)
  })

  let projectName = ''
  for await (const line of readlineInterface) {
    if (line.search(reSetAppName) >= 0) {
      projectName = line.match(/APP_NAME ([^)]+)\)/i)[1]
      break
    }
  }

  if (!projectName) {
    throw Error('Invalid project path, missing APP_NAME in CMakeLists.txt')
  }

  await closeProject()

  session.projectPath = projectPath
  session.projectName = projectName
  const cocosProjConfig = JSON.parse(fs.readFileSync(cocosProjPath))
  session.projectType = cocosProjConfig.project_type
  store.set('project.last_project_path', projectPath)

  const srcPath = path.join(session.projectPath, 'emscripten-build', 'bin', session.projectName)
  const server = httpServer.createServer({
    root: srcPath,
    cache: -1
  })

  while (true) {
    try {
      const port = session.httpServerPort || store.get('player.server_port_start')
      await server.listen(port)
      session.httpServerInstance = server
      session.httpServerPort = port
      break
    } catch (ex) {
      console.error(ex)
      if (++session.httpServerPort > store.get('player.server_port_end')) {
        session.httpServerPort = store.get('player.server_port_start')
      }
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  if (store.get('project.run_when_opening_project')) {
    BrowserWindow.getFocusedWindow().loadURL(`http://localhost:${session.httpServerPort}/${session.projectName}.html`)
  }

  console.log(session)
}

async function closeProject () {
  if (session.httpServerInstance) {
    session.httpServerInstance.close()
    delete session.httpServerInstance
  }
  session.projectType = ''
  session.projectName = ''
  session.projectPath = ''

  BrowserWindow.getFocusedWindow().loadFile('index.html')

  console.log(session)
}

module.exports = {
  openProject,
  closeProject
}
