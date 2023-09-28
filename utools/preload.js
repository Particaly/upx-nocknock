const { shutdown, showWindow } = require('./utils')
const {ipcRenderer} = require('electron')
const dayjs = require('dayjs')

utools.onPluginEnter(({code, type, payload}) => {
    console.log('用户进入插件应用', code, type, payload)
})

// utools.showNotification('开始计时')

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
window.saveRule = saveRule;
window.deleteRule = deleteRule;
window.utools = utools;

function readConfig() {
    if (config) return config;
    config = utools.dbStorage.getItem('config')
    if (config) {
        config.forEach(t => {
            if (t.week && !Array.isArray(t.week)) {
                t.week = null
            }
        })
        return config;
    } else {
        const defaultData = [
            {
                mode: notifyMode.eachDay,
                time: '08:27',
                week: null,
                date: null,
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
                week: null,
                date: null,
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
        if (n === o) {
            return false;
        }
    }
    config = JSON.parse(n)
    utools.dbStorage.setItem('config', config)
}

function saveRule(conf) {
    conf = JSON.parse(JSON.stringify(conf));
    const source = readConfig()
    if (conf.id) {
        const i = source.findIndex(c => c.id === conf.id);
        if (i !== -1) {
            source[i] = conf;
        } else {
            source.push(conf);
        }
    } else {
        conf.id = ~~(Math.random() * 100000) + 100000
        source.push(conf);
    }
    utools.dbStorage.setItem('config', source)
    config = source;
}

function deleteRule (id) {
    let source = readConfig()
    source = source.filter(t => t.id !== id);
    utools.dbStorage.setItem('config', source)
    config = source;
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
    
    // sideWindow.setSkipTaskbar(true)
    sideWindow.setAlwaysOnTop(true)
    
    showWindow('utools-nocknock-时钟展示')
    
    setTimeout(() => {
        sideWindow.setPosition(x, y)
    }, 100)
    
    ipcRenderer.sendTo(sideWindow.webContents.id, 'redirect', `/clock?title=${title}&time=${time}`)

    ipcRenderer.on('close-sub-window', (e) => {
        if (String(e.senderId) === String(sideWindow.webContents.id)) {
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
        const str = getTriggerTime(condition)
        if (str === condition.lastNotifyTime) {
            // 已经提醒过了
            return false
        }
        condition.nextNotifyTime = str;
        const time = dayjs(str)
        const del = time.unix() - now;
        
        if (Math.abs(del) < 60 && condition.alive) {
            createBrowserWindow(condition.title, str)
            condition.lastNotifyTime = str;
            if (!condition.repeat) {
                condition.alive = false;
            }
        }
        saveRule(condition)
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
            const target = condition.week.find(week => {
                const plus = Number(week) === 7 ? 0 : Number(week);
                const d = dayjs().startOf('week').add(plus, 'day')
                const r = `${d.format('YYYY-MM-DD')} ${condition.time}:00`
                const t = dayjs(r)
                return t.unix() > now.unix()
            })
            let plus;
            if (!target) {
                const week = condition.week[0];
                plus = Number(week) === 7 ? 7 : Number(week) + 7;
            } else {
                plus = Number(target) === 7 ? 0 : Number(target);
            }
            const d = dayjs().startOf('week').add(plus, 'day')
            const r = `${d.format('YYYY-MM-DD')} ${condition.time}:00`
            const t = dayjs(r)
            if (t.unix() < now.unix()) {
                return t.add(7, 'day').format('YYYY-MM-DD HH:mm:ss')
            }
            return r
        }
        case notifyMode.eachYear: {
            const md = dayjs(condition.date).format('MM-DD');
            const r = `${now.format('YYYY-')}${md} ${condition.time}:00`
            const t = dayjs(r)
            if (t.unix() < now.unix()) {
                return t.add(1, 'year').format('YYYY-MM-DD HH:mm:ss')
            }
            return r
        }
    }
}
