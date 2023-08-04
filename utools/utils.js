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

module.exports = {
    shutdown
}