<template>
  <div class="time-container">
    <div class="year-progress">
      <h3>今年已过去</h3>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${yearProgress}%` }"></div>
      </div>
      <div class="progress-text">{{ yearProgress.toFixed(2) }}%</div>
      <div class="day-progress">
        第 {{ currentDay }} 天 / 共 {{ totalDays }} 天
      </div>
    </div>
    
    <div class="today-progress">
      <h3>今日已过去</h3>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${todayProgress}%` }"></div>
      </div>
      <div class="progress-text">{{ todayProgress.toFixed(2) }}%</div>
    </div>
    
    <!-- 截图功能已隐藏 -->
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const yearProgress = ref(0)
const currentDay = ref(0)
const totalDays = ref(0)
const todayProgress = ref(0)
let timer = null

// 计算今年的总天数（考虑闰年）
const calculateTotalDays = (year) => {
  return new Date(year, 1, 29).getDate() === 29 ? 366 : 365;
}

// 计算今年已过去的天数
const calculateCurrentDay = (now, startOfYear) => {
  const diffTime = now - startOfYear;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 因为第一天是第1天
}

// 计算今日已过去的时间百分比
const calculateTodayProgress = () => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  
  const totalMilliseconds = endOfDay - startOfDay;
  const elapsedMilliseconds = now - startOfDay;
  
  return (elapsedMilliseconds / totalMilliseconds) * 100;
}

// 计算今年已过去的时间百分比
const calculateYearProgress = () => {
  const now = new Date()
  const year = now.getFullYear()
  const startOfYear = new Date(year, 0, 1) // 1月1日
  const endOfYear = new Date(year + 1, 0, 1) // 下一年的1月1日
  
  // 更新天数信息
  totalDays.value = calculateTotalDays(year)
  currentDay.value = calculateCurrentDay(now, startOfYear)
  
  const totalMilliseconds = endOfYear - startOfYear
  const elapsedMilliseconds = now - startOfYear
  
  return (elapsedMilliseconds / totalMilliseconds) * 100
}

// 更新时间百分比
const updateProgress = () => {
  yearProgress.value = calculateYearProgress()
  todayProgress.value = calculateTodayProgress()
}

// 组件挂载时开始计时器
onMounted(() => {
  updateProgress() // 立即更新一次
  timer = setInterval(updateProgress, 1000) // 每秒更新一次，使今日进度更流畅
})

// 组件卸载时清除计时器
onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.time-container {
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.year-progress, .today-progress {
  width: 100%;
  margin-bottom: 20px;
  text-align: center;
}

.year-progress h3, .today-progress h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
}

.progress-bar {
  width: 100%;
  height: 12px;
  background-color: #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 4px;
}

.year-progress .progress-fill {
  height: 100%;
  background-color: #4CAF50;
  border-radius: 6px;
  transition: width 0.5s ease;
}

.today-progress .progress-fill {
  height: 100%;
  background-color: #2196F3;
  border-radius: 6px;
  transition: width 0.3s linear;
}

.year-progress .progress-text {
  font-size: 14px;
  font-weight: bold;
  color: #4CAF50;
  margin-bottom: 4px;
}

.today-progress .progress-text {
  font-size: 14px;
  font-weight: bold;
  color: #2196F3;
  margin-bottom: 4px;
}

.day-progress {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}
</style> 