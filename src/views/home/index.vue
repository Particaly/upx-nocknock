<template>
    <div class="main wh-full">
        <div class="card-container" v-for="(item, i) in data" :key="i" @click="whenEdit(item)">
            <n-input class="title" :default-value="item.title" :on-input="val => whenChangeTitle(item, val)" />
            <div class="time">
                <span @click.stop="showTimeSelector(i)">{{ item.time }}</span>
                <n-time-picker :formatted-value="item.time"
                    ref="timepick"
                    value-format="HH:mm"
                    :on-update:value="v => whenChangeTimeValue(item, v)"
                    format="HH:mm" />
            </div>
            <div class="notice">{{ item.timeDistance }}</div>
            <div class="description">{{ getType(item) }}</div>
            <n-switch class="switch" v-model:value="item.alive" :on-update:value="val => whenChangeAlive(item, val)"></n-switch>
        </div>
    </div>
</template>

<script setup>
import dayjs from 'dayjs'
import { computed, ref, onBeforeUnmount, watch } from 'vue'

const data = ref([])
const timepick = ref()
const timer = setInterval(() => {
    const config = window.readConfig()
    config.forEach(item => {
        const next = dayjs(item.nextNotifyTime)
        const now = dayjs()
        const distance = next.unix() - now.unix();
        const day = Math.floor(distance / (60 * 60 * 24))
        const hour = Math.floor(distance%(60 * 60 * 24) / (60 * 60))
        const minute = Math.ceil(distance % (60 * 60) / 60)
        let str = '还有'
        if (day) {
            str += day + '天'
        }
        if (hour) {
            str += hour + '小时'
        }
        if (minute) {
            str += minute + '分'
        }
        item.timeDistance = str
    })
    data.value = JSON.parse(JSON.stringify(config));
}, 1000)

function whenChangeTimeValue(item, v) {
    item.time = dayjs(v).format('HH:mm')
    save()
}

function whenChangeTitle(item, v) {
    item.title = v;
    save()
}

function whenEdit() {

}

function showTimeSelector(i) {
    const r = timepick.value[i]
    r.handleTriggerClick(window.event)
    console.log(window.event)
}

function whenChangeAlive(item, val) {
    console.log('change item')
    item.alive = val
    save()
}

function save() {
    const d = JSON.parse(JSON.stringify(data.value));
    d.forEach(item => {
        delete item.timeDistance
    })
    window.saveConfig(d)
}

onBeforeUnmount(() => {
    clearInterval(timer)
})

const columns = [
    {
        title: '标题',
        key: 'title'
    },
    {
        title: '时间',
        key: 'time'
    },
    {
        title: '周期',
        key: 'mode'
    }
]

function getType(item) {
    const notifyMode = {
        'each-day': '每天提醒',
        'each-week': '每周提醒',
        'each-month': '每月提醒',
        'each-year': '每年提醒',
    }
    return item.alive ? notifyMode[item.mode] : '已关闭'
}
</script>

<style lang="scss" scoped>
.main {
    padding: 10px 20px;
    background: #e7eaed;
    height: 100%;
    overflow: auto;
    display: flex;
    column-gap: 20px;
    row-gap: 15px;
    line-height: 1;
    .card-container {
        width: 200px;
        height: 150px;
        background: white;
        border-radius: 10px;
        padding: 15px;
        position: relative;
        cursor: default;
        transition: all .2s;
        filter: drop-shadow(1px 2px 8px rgba(0,0,0,0.1));

        &:hover {
            filter: drop-shadow(1px 2px 8px rgba(0,0,0,0.2))
        }
        .title {
            font-size: 1.6rem;
            border: none;
            outline: none;
            ::v-deep(*) {
                border: none;
                outline: none;
                padding: 0;
            }
        }
        .time {
            margin-top: 10px;
            font-size: 2rem;
            opacity: 0.8;
            position: relative;
            ::v-deep(.n-time-picker) {
                position: absolute;
                height: 100%;
                pointer-events: none;
                opacity: 0;
                left: 0;
                top: -10px;
            }
        }
        .notice {
            font-size: 1rem;
            opacity: 0.6;
            margin-top: 10px;
        }
        .description {
            margin-top: 15px;
            opacity: 0.6;
        }

        .switch {
            position: absolute;
            right: 20px;
            bottom: 8px
        }
    }
}
</style>