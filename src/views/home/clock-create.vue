<template>
	<n-card class="clock-create">
		<div class="line-container">
			<div class="title">是否启用</div>
			<n-switch class="value" v-model:value="state.params.alive" placeholder="太长会不好看哦"></n-switch>

			<div class="title">名称</div>
			<n-input v-model:value="state.params.title" placeholder="太长会不好看哦"></n-input>

			<div class="title">时间</div>
			<n-time-picker placeholder="太晚犯困忘了提醒也情有可原吧"
			               v-model:value="state.params.time"
			               value-format="HH:mm"
			               format="HH:mm"/>

			<div class="title">周期提醒</div>
			<n-switch class="value" v-model:value="state.params.repeat"></n-switch>

			<div v-if="state.params.repeat" class="title" >选择周期</div>
			<n-select v-if="state.params.repeat" class="value" v-model:value="state.params.mode" :options="state.options.mode"></n-select>

			<div v-if="state.condition.showWeek" class="title">每周几</div>
			<div v-if="state.condition.showWeek" class="value" style="width: 270px">
				<n-select
				          v-model:value="state.params.week"
				          :options="state.options.week"
				          multiple
				          max-tag-count="responsive"
				></n-select>
			</div>


			<div v-if="state.condition.showDate" class="title">日期</div>
			<n-date-picker v-if="state.condition.showDate" class="value"
			               placeholder="这是一个值得记住的日子"
			               v-model:value="state.params.date"
			               value-format="MM-dd"
			               format="MM-dd"
			></n-date-picker>

			<div class="button-group">
				<n-button @click="props.close">取消</n-button>
				<n-button type="primary" @click="save">确定</n-button>
			</div>
		</div>
	</n-card>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import { computed, reactive } from "vue";

interface Props {
	mode: 'create' | 'edit'
	rule: any
	close: () => any
}
const props = defineProps<Props>()

interface Emits {
	(e: 'update'): void
}
const emit = defineEmits<Emits>()

const state: any = reactive({
	params: {
		id: null,
		title: '',
		time: null,
		repeat: false,
		mode: 'each-day',
		date: null,
		week: ['1'],
		alive: true,
	},
	options: {
		mode: [
			{ label: '每天提醒', value: 'each-day' },
			{ label: '每周提醒', value: 'each-week' },
			{ label: '每年提醒', value: 'each-year' },
		],
		week: [
			{ label: '周一', value: '1' },
			{ label: '周二', value: '2' },
			{ label: '周三', value: '3' },
			{ label: '周四', value: '4' },
			{ label: '周五', value: '5' },
			{ label: '周六', value: '6' },
			{ label: '周日', value: '7' },
		],
	},
	condition: {
		showWeek: computed(() => {
			return state.params.repeat && state.params.mode === 'each-week'
		}),
		showDate: computed(() => {
			return state.params.repeat && state.params.mode === 'each-year'
		})
	}
})

function save() {
	const options = Object.assign({}, state.params);
	options.time = dayjs(options.time).format('HH:mm');
	options.lastNotifyTime = '';
	options.nextNotifyTime = '';
	(window as any).saveRule(options)
	emit('update')
	props.close()
}

function init() {
	if (props.mode === 'edit') {
		Object.assign(state.params, props.rule)
		state.params.time = dayjs(`2000-01-01 ${state.params.time}:00`).unix() * 1000
	}
}
init()
</script>

<style scoped>
.clock-create {
	width: 400px;
	.line-container {
		width: 100%;
		display: grid;
		grid-template-columns: 60px 1fr;
		align-items: center;
		column-gap: 20px;
		row-gap: 10px;
		.title {
			text-align: justify;
			text-align-last: justify;
		}
		.value {
			justify-self: flex-start;
		}
		.button-group {
			width: 100%;
			grid-column: 1 / 3;
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 20px;
		}
	}
}
</style>
