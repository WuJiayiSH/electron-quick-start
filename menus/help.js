const { shell } = require('electron')

async function learnMore () {
  await shell.openExternal('https://github.com/WuJiayiSH/electron-quick-start')
}

module.exports = {
  learnMore
}
