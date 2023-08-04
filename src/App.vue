<template>
  <n-config-provider
    :locale="zhCN"
    :date-locale="dateZhCN"
    class="wh-full"
  >
    <naive-provider>
        <router-view />
    </naive-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { dateZhCN, zhCN } from 'naive-ui';
</script>
