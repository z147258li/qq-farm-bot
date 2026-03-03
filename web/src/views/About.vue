<script setup lang="ts">
const version = __APP_VERSION__
</script>

<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">关于</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">关于本系统</p>
    </div>

    <div class="mx-auto max-w-2xl">
      <!-- 这里编辑关于内容 -->
      <div class="mb-6 rounded-lg bg-white p-8 shadow dark:bg-gray-800">
        <div class="mb-6 text-center">
          <div class="mb-4 mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500">
            <div class="text-4xl text-white i-carbon-sprout" />
          </div>
          <h4 class="mb-2 text-xl font-bold text-gray-900 dark:text-white">QQ农场智能助手</h4>
          <p class="text-sm text-gray-600 dark:text-gray-400">Version {{ version }}</p>
        </div>

        <div class="mb-6 rounded-lg bg-gray-50 p-6 dark:bg-gray-700/50">
          <p class="mb-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            &nbsp;&nbsp;本项目基于Penty-d的项目二开而来，原项目<a href="https://github.com/Penty-d/qq-farm-bot-ui" target="_blank" class="text-blue-500 hover:text-blue-600 underline">&nbsp;点此查看</a>
          </p>
		  <p class="mb-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            &nbsp;&nbsp;智能化的QQ农场管理工具，支持自动种植、收获、任务、好友互动等功能，让你的农场管理更加轻松高效。
          </p>
          <ul class="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <li class="flex items-start gap-3">
              <div class="mt-0.5 i-carbon-checkmark-filled text-green-500 shrink-0" />
              <span>全自动农场管理 - 自动种植、收获、施肥</span>
            </li>
            <li class="flex items-start gap-3">
              <div class="mt-0.5 i-carbon-checkmark-filled text-green-500 shrink-0" />
              <span>智能好友互动 - 自动偷菜、浇水、除草</span>
            </li>
            <li class="flex items-start gap-3">
              <div class="mt-0.5 i-carbon-checkmark-filled text-green-500 shrink-0" />
              <span>数据分析与优化 - 实时监控农场状态</span>
            </li>
            <li class="flex items-start gap-3">
              <div class="mt-0.5 i-carbon-checkmark-filled text-green-500 shrink-0" />
              <span>多账号管理 - 统一管理多个农场账号</span>
            </li>
			<li class="flex items-start gap-3">
              <div class="mt-0.5 i-carbon-checkmark-filled text-green-500 shrink-0" />
              <span>多用户管理 - 每个用户之间互不干扰</span>
            </li>
			<li class="flex items-start gap-3">
              <div class="mt-0.5 i-carbon-checkmark-filled text-green-500 shrink-0" />
              <span>卡密管理 - 生成各种各种形式的卡密</span>
            </li>
          </ul>
        </div>

        <div class="text-center text-xs text-gray-500 dark:text-gray-400">
          © 2026 QQ Farm Bot. All rights reserved.By：Mr.蘇.QQ：499642078
        </div>
      </div>
    </div>
  </div>
</template>
