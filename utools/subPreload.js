const {ipcRenderer} = require('electron')
const electron = require('electron')

console.log(Object.keys(electron))
console.log(electron.webFrame)

let winId;
ipcRenderer.on('redirect', (e, data) => {
    winId = e.senderId;
    console.log(winId)
    try{
        window.router.push(data)
    }catch(e) {}
})

window.distroySubWindow = function() {
    console.log('trigger distroySubWindow', winId)
    ipcRenderer.sendTo(winId, 'close-subwindow')
}

console.log('sub preload called')