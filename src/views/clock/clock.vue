<template>
	<div class="lonlyape_clock" v-bind:style="clockBoxStyle">
		<canvas></canvas>
	</div>
</template>
<script>
export default {
	name: 'vueClock',
	data() {
		return {
			clockBoxStyle: {},
			canvas: {},
			context: {},
			timeAngle: {},
			timeInterval: {},
			transitionOption: {},
			defOption: {
				time: {
					isStatic: false,
					timestamp: 0
				},
				border: {
					type: 'circle', //边界类型（圆、四边形）;circle(圆形) 、 rectangle(四边形)
					width: 300,
					height: 300,
					lineWidth: 4,
					color: '#bbb'
				},
				background: {
					color: '',
					image: ''
				},
				dial: {
					isDial: true, //是否要刻度
					distance: 0, //刻度与边界的距离
					maxLength: 8,
					minLength: 5,
					maxWidth: 3,
					minWidth: 2,
					color: '#888'
				},
				number: {
					isNumber: true, //是否要数字
					type: 'arabic', //数字类型，罗马：“roman”；阿拉伯：“arabic”（默认）
					color: '#777',
					fontSize: '19px',
					fontWeight: 'normal',
					fontFamily: '微软雅黑',
					radius: 125,
				},
				needle: {
					second: {
						length: 100,
						color: '#aaa',
						lineWidth: 5,
						longOut: 5,
					},
					minute: {
						length: 110,
						color: '#999',
						lineWidth: 6,
						longOut: 5,
					},
					hour: {
						length: 70,
						color: '#888',
						lineWidth: 6,
						longOut: 5,
					}
				}
			}
		}
	},
	props: {
		width: {
			default: ''
		},
		height: {
			default: ''
		},
		//自适应
		adaptive: {
			type: Boolean,
			default: true
		},
		//时区
		timezone: {
			default: ''
		},
		//时间
		time: {
			type: Object
		},
		//边界
		border: {
			type: Object
		},
		//背景
		background: {
			type: Object
		},
		//刻度
		dial: {
			type: Object
		},
		//数字
		number: {
			type: Object
		},
		//针
		needle: {
			type: Object,
			default () {
				return {
					second: {},
					minute: {},
					hour: {}
				}
			}
		},
	},
	computed: {
		drawOption() {
			var time = {
				...this.defOption.time,
				...this.time
			};
			var border = {
				...this.defOption.border,
				...this.border
			};
			var background = {
				...this.defOption.background,
				...this.background
			};
			var dial = {
				...this.defOption.dial,
				...this.dial
			};
			var number = {
				...this.defOption.number,
				...this.number
			};
			var needle = {
				second: {
					...this.defOption.needle.second,
					...this.needle.second
				},
				minute: {
					...this.defOption.needle.minute,
					...this.needle.minute
				},
				hour: {
					...this.defOption.needle.hour,
					...this.needle.hour
				},
			};
			return {
				time,
				border,
				background,
				dial,
				number,
				needle,
			}
		}
	},
	watch: {
		drawOption: {
			handler: function(val) {
				if (val.time.isStatic) {
					clearInterval(this.timeInterval);
				}
				this.draw();
			},
			deep: true,
		},
		timeAngle: function() {
			// this.draw();
		},
	},
	created() {
		this.$nextTick(() => {
			this.canvas = this.$el.querySelector('canvas');
			this.context = this.canvas.getContext('2d');
			this.setClockBoxStyle();
			this.newData();
			if (!this.drawOption.time.isStatic) {
				this.timeInterval = setInterval(this.newData, 1000);
			}

			this.draw();
            console.log('drawoption,', this.drawOption)
			setTimeout(this.drawAsResize, 100);
		});
	},
	methods: {
		//resize
		drawAsResize() {
			var _this = this;
			const oldOpthion = JSON.parse(JSON.stringify(this.drawOption));
			const oldW = oldOpthion.border.width;
			//监听元素的变化
			var elObserver = new ResizeObserver((entries) => {
				entries.forEach((entry) => {
					let contentRect = entry.contentRect;
					let option = _this.drawOption;
					_this.setNumberValue(option, oldOpthion, contentRect.width - 6, oldW);
					_this.setClockBoxStyle();
					_this.draw();
				});
			})
			elObserver.observe(this.$el);
		},
		//自适应参数设置
		setNumberValue(obj, oldObj, newW, oldW) {
			if (!this.adaptive) {
				return;
			}
			for (let key in obj) {
				let newVal = obj[key];
				let oldVal = oldObj[key];
				let magnification = newW / oldW < 1 ? newW / oldW : 1;
				if (typeof newVal == 'number') {
					obj[key] = oldVal * magnification;
				} else if (typeof newVal == 'object') {
					this.setNumberValue(newVal, oldVal, newW, oldW);
				} else if (key == 'fontSize') {
					obj[key] = oldVal.replace(/^\d*/, (num) => {
						return num * magnification;
					})
				}
			}
		},
		//画
		draw() {
			this.clear();
			this.setNumberValue(this.drawOption, this.drawOption, this.canvas.width - 6, this.drawOption.border.width);
			this.drawBackground();
			this.drawBorder();
			this.drawDial();
			this.drawNumber();
			this.drawNeedle();
		},
		//清除
		clear() {
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.width);
		},
		//设置大小
		setClockBoxStyle() {
			this.canvas.width = this.width || this.$el.clientWidth;
			this.canvas.height = this.width;
            this.clockBoxStyle = {
                width: this.canvas.width + 'px',
                height: this.canvas.height + 'px'
            };
		},
		//画边框
		drawBorder() {
			this.context.save();
			this.context.translate(this.canvas.width / 2, this.canvas.height / 2);
			this.context.beginPath();
			if (this.drawOption.border.type == 'rectangle') {
				this.context.rect(-this.drawOption.border.width / 2, -this.drawOption.border.height / 2, this.drawOption.border.width, this.drawOption.border.height);
			} else {
				this.context.arc(0, 0, this.drawOption.border.width / 2, 0, Math.PI * 2, true);
			}
			this.context.closePath();
			this.context.strokeStyle = this.drawOption.border.color;
			this.context.lineWidth = this.drawOption.border.lineWidth;
			this.context.stroke();
			this.context.restore();
		},
		//背景图片
		drawBackground() {
			this.context.save();
			this.context.beginPath();
			this.context.translate(this.canvas.width / 2, this.canvas.height / 2);
			var x, y;
			if (this.drawOption.border.type == 'rectangle') {
				this.context.rect(-this.drawOption.border.width / 2, -this.drawOption.border.height / 2, this.drawOption.border.width, this.drawOption.border.height);

				x = -this.drawOption.border.width / 2;
				y = -this.drawOption.border.height / 2;
			} else {
				this.context.arc(0, 0, this.drawOption.border.width / 2, 0, Math.PI * 2, true);
				x = -this.drawOption.border.width / 2;
				y = -this.drawOption.border.width / 2;
			}
			if (this.drawOption.background.color) {
				this.context.fillStyle = this.drawOption.background.color;
				this.context.fill();
			}
			if (this.drawOption.background.image) {
				var image = new Image();

				if (!this.transitionOption.bgImg) {
					var _this = this;
					image.src = this.drawOption.background.image;
					image.onload = function() {
						console.log('img loaded');
						_this.$set(_this.transitionOption, 'bgImg', image);
					}
				} else {
					image = this.transitionOption.bgImg;
				}

				var sx, sy, autow;
				if (image.width >= image.height) {
					sx = (image.width - image.height) / 2;
					sy = 0;
					autow = image.height;
				} else {
					sx = 0;
					sy = (image.height - image.width) / 2;
					autow = image.width;
				}

				this.context.clip();
				this.context.drawImage(image, sx, sy, autow, autow, x, y, -x * 2, -y * 2);
			}
			this.context.closePath();
			this.context.restore();
		},
		//画刻度
		drawDial() {
			if (!this.drawOption.dial.isDial) return;
			var degMinute = Math.PI * 2 / 60;
			var degM = 0;
			var distance = this.drawOption.dial.distance ? this.drawOption.dial.distance + this.drawOption.border.lineWidth / 2 : this.drawOption.border.lineWidth / 2;
			if (this.drawOption.dial.distance == 0) distance = this.drawOption.border.lineWidth / 2;
			var begainPosition = {
				x: 0,
				y: this.drawOption.border.width / 2 - distance
			};
			for (let i = 0; i < 60; i++) {
				degM = degMinute * i;
				this.context.save();
				this.context.translate(this.canvas.width / 2, this.canvas.height / 2);
				if (i % 5 == 0) {
					this.line(begainPosition, degM, this.drawOption.dial.maxLength - begainPosition.y, this.drawOption.dial.color, this.drawOption.dial.maxWidth);
				} else {
					this.line(begainPosition, degM, this.drawOption.dial.minLength - begainPosition.y, this.drawOption.dial.color, this.drawOption.dial.minWidth);
				}
				this.context.restore();
			}
		},
		//画数字
		drawNumber() {
			if (!this.drawOption.number.isNumber) return;
			var num = [];
			for (let i = 1; i < 13; i++) {
				num[i - 1] = i + 3;
				if ((i + 3) > 12) {
					num[i - 1] = 3 - (12 - i);
				}
			}
			if (this.drawOption.number.type == 'roman') {
				for (let i = 0; i < 12; i++) {
					num[i] = this.intToRoman(num[i]);
				}
			}
			var ar = Math.PI / 6;
			this.context.save();
			this.context.fillStyle = this.drawOption.number.color;
			this.context.font = this.drawOption.number.fontWeight + ' ' + this.drawOption.number.fontSize + ' ' + this.drawOption.number.fontFamily;
			this.context.textBaseline = 'middle';
			this.context.textAlign = 'center';
			this.context.translate(this.canvas.width / 2, this.canvas.height / 2);
			for (let i = 0; i < num.length; i++) {
				this.context.fillText(num[i], this.drawOption.number.radius * Math.cos(ar * (i + 1)), this.drawOption.number.radius * Math.sin(ar * (i + 1)));
			}
			this.context.restore();
		},
		//转罗马数字
		intToRoman(num) {
			var roman = ['I', 'V', 'X', 'L', 'C', 'D', 'M'];
			var numArr = num.toString().split('');
			for (let i = 0; i < numArr.length; i++) {
				var n = Number(numArr[numArr.length - 1 - i]);
				numArr[numArr.length - 1 - i] = '';
				if (n >= 5 && n < 9) {
					numArr[numArr.length - 1 - i] = roman[2 * i + 1];
					for (let j = 0; j < n - 5; j++) {
						numArr[numArr.length - 1 - i] += roman[2 * i];
					}
				} else if (n == 9) {
					numArr[numArr.length - 1 - i] = roman[2 * i] + roman[2 * i + 2];
				} else if (n == 4) {
					numArr[numArr.length - 1 - i] = roman[2 * i] + roman[2 * i + 1];
				} else {
					for (let j = 0; j < n; j++) {
						numArr[numArr.length - 1 - i] += roman[2 * i];
					}
				}
			}
			return numArr.join('');
		},
		//画针
		drawNeedle() {
			var h = this.timeAngle.hAngle;
			var m = this.timeAngle.mAngle;
			var s = this.timeAngle.sAngle;
			this.context.save();
			this.context.translate(this.canvas.width / 2, this.canvas.height / 2);

			this.line({
				x: 0,
				y: this.drawOption.needle.hour.longOut
			}, h, this.drawOption.needle.hour.length, this.drawOption.needle.hour.color, this.drawOption.needle.hour.lineWidth); //时针
			this.line({
				x: 0,
				y: this.drawOption.needle.minute.longOut
			}, m, this.drawOption.needle.minute.length, this.drawOption.needle.minute.color, this.drawOption.needle.minute.lineWidth); //分针
			this.line({
				x: 0,
				y: this.drawOption.needle.second.longOut
			}, s, this.drawOption.needle.second.length, this.drawOption.needle.second.color, this.drawOption.needle.second.lineWidth); //秒针

			this.context.restore();
		},
		//以时区确定时间
		selectTimezone() {
			var d = this.drawOption.time.isStatic ? new Date(this.drawOption.time.timestamp) : new Date();
			//得到1970年一月一日到现在的秒数
			var len = d.getTime();
			//确定时区
			var timezone;
			if (this.timezone === '') {
				timezone = -d.getTimezoneOffset() / 60;
			} else {
				timezone = Number(this.timezone);
			}
			//本地时间与GMT时间的时间偏移差
			var offset = d.getTimezoneOffset() * 60000;
			//得到现在的格林尼治时间
			var utcTime = len + offset;
			return new Date(utcTime + 3600000 * timezone);
		},
		//时间计算
		newData() {
			var nd = this.selectTimezone();
			var hour = nd.getHours();
			var minute = nd.getMinutes();
			var second = nd.getSeconds();
			var sAngle = Math.PI * 2 * (second % 60) / 60;
			var mAngle = Math.PI * 2 * (minute % 60) / 60 + sAngle / 60;
			var hAngle = Math.PI * 2 * (hour % 12) / 12 + mAngle / 12;
			this.timeAngle = {
				sAngle,
				mAngle,
				hAngle
			}

			//时间事件
			this.$emit('timeChange', nd);

		},
		//画线（公用）
		line(starp, s, len, col, lw) {
			this.context.save();
			this.context.beginPath();
			this.context.rotate(s);
			this.context.moveTo(starp.x, starp.y);
			this.context.lineTo(0, -len);
			this.context.strokeStyle = col;
			this.context.lineWidth = lw;
			this.context.stroke();
			this.context.restore();
		},
	},
}

</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>