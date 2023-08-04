<template>
    <div class="frame wh-full flex-y-center" @click="whenClickBox">
        <div class="content wh-full flex-y-center" :class="{display}">
            <Clock class="clock" :width="size" ref="clock"></Clock>
            <div class="h-full flex flex-1 time-container">
                <div class="title">{{ route.query.title }}</div>
                <div class="number">{{ time }}</div>
            </div>
        </div>
    </div>
</template>

<script setup>
import Clock from './clock.vue'
import { useNow } from '@vueuse/core'
import dayjs from 'dayjs'
import { computed, watch, ref } from 'vue';
import {useRoute} from 'vue-router'

const clock = ref()
const display = ref(false)
const route = useRoute()

defineOptions({
    name: 'Clock'
})

const size = document.body.clientHeight * 0.8

const now = useNow()
const time = computed(() => dayjs(now.value).format('HH:mm:ss'))
watch(() => time.value, () => {
    if (clock.value) {
        clock.value.draw()
    }
})

const needQuit = computed(() => {
    const n = dayjs(now.value)
    const t = dayjs(route.query.time)
    return t.unix() < n.unix()
})

watch(() => needQuit.value, whenClickBox)

setTimeout(() => {
    display.value = true
}, 100)

async function whenClickBox() {
    display.value = false;
    setTimeout(window.distroySubWindow, 1000)
}

</script>

<style scoped lang="scss">
.frame {
    overflow: hidden;
    .content {
        border-radius: 10px;
        background: white;
        display: flex;
        border: 2px solid rgba(0,0,0,0.1);
        column-gap: 20px;
        padding: 0 20px;
        transform: translateX(-100%);
        opacity: 0;
        transition: all .4s;
        &.display {
            transform: translateX(0);
            opacity: 1;
        }
    }
}
.number {
    display: flex;
    justify-content: center;
    align-items: center;
}
.time-container {
    justify-content: center;
    flex-direction: column;
    font-family: 'Number';
    font-size: 2.4rem;
}
.title {
    font-size: 1.5rem;
    padding: 10px 0;
    text-align: center;
}
</style>