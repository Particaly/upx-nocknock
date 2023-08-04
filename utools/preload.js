const { shutdown } = require('./utils')
const {ipcRenderer} = require('electron')
const dayjs = require('dayjs')

utools.onPluginEnter(({code, type, payload}) => {
    console.log('用户进入插件应用', code, type, payload)
})

utools.showNotification('开始计时')

const notifyMode = {
    eachDay: 'each-day',
    eachWeek: 'each-week',
    eachMonth: 'each-month',
    eachYear: 'each-year',
}

const winContainer = []

let config;

shutdown('utools-nocknock-时钟展示')

window.readConfig = readConfig;
window.saveConfig = saveConfig;
window.utools = utools;

function readConfig() {
    if (config) return config;
    config = utools.dbStorage.getItem('config')
    if (config) {
        return config;
    } else {
        const defaultData = [
            {
                mode: notifyMode.eachDay,
                time: '08:27',
                week: 0,
                date: '',
                title: '上班打卡',
                alive: true,
                repeat: true,
                lastNotifyTime: '',
                nextNotifyTime: '',
                id: 1
            },
            {
                mode: notifyMode.eachDay,
                time: '18:00',
                week: 0,
                date: '',
                title: '下班打卡',
                alive: true,
                repeat: true,
                lastNotifyTime: '',
                nextNotifyTime: '',
                id: 2
            }
        ]
        utools.dbStorage.setItem('config', defaultData)
        config = JSON.parse(JSON.stringify(defaultData))
        return config
    }
}

function saveConfig(conf, force=false) {
    const n = JSON.stringify(conf)
    if (!force) {
        const o = config ? JSON.stringify(config) : ''
        console.log(n, o)
        if (n === o) {
            return false;
        }
    }
    config = JSON.parse(n)
    utools.dbStorage.setItem('config', config)
}

async function createBrowserWindow(title, time) {
    const display = utools.getPrimaryDisplay()
    const { size } = display;
    const width = Math.floor(size.width / 7);
    const height = Math.floor(width / 16 * 7);
    const x = 10;
    const y = Math.floor(size.height / 10)
    
    const sideWindow = await new Promise(resolve => {
        const win = utools.createBrowserWindow('./index.html', {
            show: true,
            frame: false,
            transparent: true,
            backgroundColor: 'transparent',
            
            webPreferences: {
                preload: './utools/subPreload.js'
            },
            width,
            height,
            x: -1000,
            y: -1000,
        }, () => resolve(win))
    })
    winContainer.push(sideWindow)
    sideWindow.setTitle('utools-nocknock-时钟展示')
    sideWindow.setBackgroundColor('rgba(0,0,0,0)')
    // console.log(Object.keys(sideWindow))
    sideWindow.setSkipTaskbar(true)
    sideWindow.setAlwaysOnTop(true)
    
    setTimeout(() => {
        sideWindow.setPosition(x, y)
    }, 100)
    // sideWindow.webContents.openDevTools()
    ipcRenderer.sendTo(sideWindow.webContents.id, 'redirect', `/clock?title=${title}&time=${time}`)

    ipcRenderer.on('close-subwindow', (e) => {
        if (e.senderId == sideWindow.webContents.id) {
            sideWindow.close()
        }
    })

    return sideWindow
}

try {
    main()
    setInterval(main, 1000)
} catch(err) {
    utools.showNotification(err)
}
function main() {
    const config = readConfig()
    const now = dayjs().unix()
    config.forEach(async condition => {
        if (!condition.alive) {
            return false
        }
        const str = getTriggerTime(condition)
        if (str === condition.lastNotifyTime) {
            // 已经提醒过了
            return false
        }
        condition.nextNotifyTime = str;
        const time = dayjs(str)
        const del = time.unix() - now;
        
        if (Math.abs(del) < 60) {
            createBrowserWindow(condition.title, str)
            condition.lastNotifyTime = str;
        }
        saveConfig(config, true)
    })
}



function getTriggerTime(condition) {
    const now = dayjs()
    switch (condition.mode) {
        case notifyMode.eachDay: {
            const str = now.format('YYYY-MM-DD')
            const r = `${str} ${condition.time}:00`
            const t = dayjs(r)
            if (t.unix() < now.unix()) {
                return t.add(1, 'day').format('YYYY-MM-DD HH:mm:ss')
            }
            return r
        }
        case notifyMode.eachWeek: {
            // 从周日算 周一就+1天，周二就+2天
            const plus = condition.week == 7 ? 0 : condition.week;
            const d = dayjs().startOf('week').add(Number(plus), 'day')
            const r = `${d.format('YYYY-MM-DD')} ${condition.time}:00`
            const t = dayjs(r)
            if (t.unix() < now.unix()) {
                return t.add(7, 'day').format('YYYY-MM-DD HH:mm:ss')
            }
            return r
        }
        case notifyMode.eachMonth: {
            const r = `${now.format('YYYY-MM-')}${condition.date} ${condition.time}:00`
            const t = dayjs(r)
            if (t.unix() < now.unix()) {
                return t.add(7, 'day').format('YYYY-MM-DD HH:mm:ss')
            }
            return r
        }
        case notifyMode.eachYear: {
            const r = `${now.format('YYYY-')}${condition.date} ${condition.time}:00`
            const t = dayjs(r)
            if (t.unix() < now.unix()) {
                return t.add(7, 'day').format('YYYY-MM-DD HH:mm:ss')
            }
            return r
        }
    }
}
