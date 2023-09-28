<template>
	<div class="main wh-full" v-if="show">
		<div class="card-container" v-for="(item, i) in data" :key="i" @click="whenEdit(item)">
			<svg @click.stop="deleteRule(item)" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32"><path d="M24 9.4L22.6 8L16 14.6L9.4 8L8 9.4l6.6 6.6L8 22.6L9.4 24l6.6-6.6l6.6 6.6l1.4-1.4l-6.6-6.6L24 9.4z" fill="currentColor"></path></svg>
			<n-input class="title" :default-value="item.title" :on-input="val => whenChangeTitle(item, val)"/>
			<div class="time">
				<span @click.stop="showTimeSelector(i)">{{ item.time }}</span>
				<n-time-picker :formatted-value="item.time"
				               ref="timePick"
				               value-format="HH:mm"
				               :on-update:value="v => whenChangeTimeValue(item, v)"
				               format="HH:mm"/>
			</div>
			<div class="notice">{{ item.timeDistance }}</div>
			<div class="description">{{ getType(item) }}</div>
			<n-switch class="switch"
			          v-model:value="item.alive"
			          :on-update:value="val => whenChangeAlive(item, val)"
			          @click.stop="() => {}"
			></n-switch>
		</div>
		<div class="add-notify" @click="addNewNotify">
			<n-icon size="40">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
					<path
						d="M368.5 240H272v-96.5c0-8.8-7.2-16-16-16s-16 7.2-16 16V240h-96.5c-8.8 0-16 7.2-16 16 0 4.4 1.8 8.4 4.7 11.3 2.9 2.9 6.9 4.7 11.3 4.7H240v96.5c0 4.4 1.8 8.4 4.7 11.3 2.9 2.9 6.9 4.7 11.3 4.7 8.8 0 16-7.2 16-16V272h96.5c8.8 0 16-7.2 16-16s-7.2-16-16-16z"
					/>
				</svg>
			</n-icon>
		</div>
		<n-modal :show="state.show">
			<ClockCreate :mode="state.mode" :rule="state.rule" :close="() => state.show=false" @update="onUpdate"></ClockCreate>
		</n-modal>
	</div>
</template>

<script setup>
import dayjs from 'dayjs'
import { ref, onBeforeUnmount, reactive, nextTick } from 'vue'
import ClockCreate from "./clock-create.vue";

const data = ref([])
const show = ref(true)
const timePick = ref()
const timer = setInterval(() => {
	const config = window.readConfig()
	config.forEach(item => {
		const next = dayjs(item.nextNotifyTime)
		const now = dayjs()
		const distance = next.unix() - now.unix();
		const day = Math.floor(distance / (60 * 60 * 24))
		const hour = Math.floor(distance % (60 * 60 * 24) / (60 * 60))
		const minute = Math.floor(distance % (60 * 60) / 60)
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
		if (str === '还有') {
			item.timeDistance = !item.alive ? '已关闭' : str;
		} else {
			item.timeDistance = str
		}
	})
	data.value = JSON.parse(JSON.stringify(config));
}, 1000)

const state = reactive({
	show: false,
	rule: null,
	mode: 'edit'
})

function whenChangeTimeValue (item, v) {
	item.time = dayjs(v).format('HH:mm')
	save()
}

function whenChangeTitle (item, v) {
	item.title = v;
	save()
}

function whenEdit(rule) {
	state.mode = "edit";
	state.rule = JSON.parse(JSON.stringify(rule));
	state.show = true;
}

async function onUpdate() {
	show.value = false;
	const config = window.readConfig()
	config.forEach(item => {
		const next = dayjs(item.nextNotifyTime)
		const now = dayjs()
		const distance = next.unix() - now.unix();
		const day = Math.floor(distance / (60 * 60 * 24))
		const hour = Math.floor(distance % (60 * 60 * 24) / (60 * 60))
		const minute = Math.floor(distance % (60 * 60) / 60)
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
		if (str === '还有') {
			item.timeDistance = !item.alive ? '已关闭' : str;
		} else {
			item.timeDistance = str
		}
	})
	data.value = JSON.parse(JSON.stringify(config));
	await nextTick();
	show.value = true;
}

function showTimeSelector (i) {
	const r = timePick.value[i]
	r.handleTriggerClick(window.event)
	console.log(window.event)
}

function whenChangeAlive (item, val) {
	console.log('change item')
	item.alive = val
	save()
}

function save () {
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

const weekWords = [
	'一', '二', '三', '四', '五', '六', '日'
]
function getType (item) {
	if (!item.repeat) {
		return '仅一次'
	}
	const notifyMode = {
		'each-day': '每天提醒',
		'each-week': `每周${item.week.map(t => weekWords[t - 1]).join('、')}提醒`,
		'each-month': '每月提醒',
		'each-year': '每年提醒',
	}
	return item.alive ? notifyMode[item.mode] : '已关闭'
}

function addNewNotify () {
	state.mode = "create";
	state.rule = null;
	state.show = true;
}

function deleteRule(item) {
	const id = item.id;
	window.deleteRule(id);
}
</script>

<style lang="scss" scoped>
.main {
	padding: 10px 20px;
	background: #e7eaed;
	height: 100%;
	overflow: auto;
	display: flex;
	flex-wrap: wrap;
	column-gap: 20px;
	row-gap: 15px;
	line-height: 1;
	align-content: flex-start;

	.card-container {
		width: 200px;
		height: fit-content;
		background: white;
		border-radius: 10px;
		padding: 15px;
		position: relative;
		cursor: default;
		transition: all .2s;
		filter: drop-shadow(1px 2px 8px rgba(0, 0, 0, 0.1));

		&:hover {
			filter: drop-shadow(1px 2px 8px rgba(0, 0, 0, 0.2));
			svg {
				opacity: 1;
			}
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
			width: 80%
		}

		.switch {
			position: absolute;
			right: 20px;
			bottom: 8px
		}

		svg {
			transition: opacity 0.4s;
			opacity: 0;
			position: absolute;
			width: 27px;
			height: 26px;
			right: 10px;
			top: 10px;
			z-index: 10;
			cursor: pointer;
		}
	}

	.add-notify {
		width: 50px;
		height: 50px;
		border-radius: 50%;
		background: white;
		position: fixed;
		right: 20px;
		top: 20px;
		display: flex;
		justify-content: center;
		align-items: center;
		color: gray;

		cursor: default;
		transition: all .2s;
		transform: scale(0.9);
		filter: drop-shadow(1px 2px 8px rgba(0, 0, 0, 0.1));

		&:hover {
			transform: scale(1);
			filter: drop-shadow(1px 2px 8px rgba(0, 0, 0, 0.2))
		}

		&:active {
			transform: scale(0.9) !important;
		}
	}
}
</style>
