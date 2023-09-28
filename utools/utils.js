const hmc = require('hmc-win32')

function shutdown(name) {
    if (!name) {
        return false
    }
    const list = hmc.getAllWindows();
    list.forEach(which => {
        if(which.title.includes(name)) {
            hmc.closedHandle(which.handle)
        }
    })
}

function showWindow(win) {
    if (getType(win) === 'string') {
        win = findWindowByTitle(win)
    }
    
    if (!win) return;
    hmc.setWindowFocus(win)
    hmc.setWindowMode(win, "0", "0", null, null)
}

function findWindowByTitle(title) {
    const wins = hmc.getAllWindowsHandle(true)
    
    return wins
        .filter(win => win.exists)
        .find((win) => win.title.includes(title))
}

function getType(obj) {
    return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase()
}

module.exports = {
    shutdown,
    showWindow,
    findWindowByTitle
}
