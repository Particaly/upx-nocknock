<template>
    <canvas ref="canva" :width="size.width" :height="size.height"></canvas>
</template>

<script setup>
import { ref, onMounted } from 'vue'
const canva = ref()

const size = ref({
    width: 0,
    height: 0
})
// 获取Canvas元素和绘图上下文
// var canvas = document.getElementById("clockCanvas");
onMounted(() => {
    const canvas = canva.value;
    var ctx = canvas.getContext("2d");
    size.width = canvas.clientWidth;
    size.height = canvas.clientHeight;
    canvas.width = size.width;
    canvas.height = size.height;
    console.log(canvas.clientWidth, canvas.clientHeight)

    // 设置数字电子钟的位置和尺寸
    var clockX = 20;
    var clockY = 20;
    var clockWidth = size.width;
    var clockHeight = size.height;

    // 绘制数字电子钟
    function drawClock() {
        console.log(canvas.width)
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 绘制外框
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.strokeRect(clockX, clockY, clockWidth, clockHeight);

        // 绘制数字
        var now = new Date();
        var hours = now.getHours().toString().padStart(2, "0");
        var minutes = now.getMinutes().toString().padStart(2, "0");
        var seconds = now.getSeconds().toString().padStart(2, "0");
        var time = hours + ":" + minutes + ":" + seconds;

        ctx.font = "bold 80px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#000";
        ctx.fillText(time, clockX + clockWidth / 2, clockY + clockHeight / 2);
    }

    // 每秒更新一次钟表
    setInterval(drawClock, 1000);
})




</script>

<style scoped>
canvas{
    width: 100%;
    height: 100%;
}
</style>