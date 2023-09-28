const {ipcRenderer} = require('electron')

let winId;
ipcRenderer.on('redirect', (e, data) => {
    winId = e.senderId;
    try{
        window.router.push(data)
    }catch(e) {}
})

window.destroySubWindow = function() {
    ipcRenderer.sendTo(winId, 'close-sub-window')
}
