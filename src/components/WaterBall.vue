<template>
  <div class="water-ball-container" :style="containerStyle" ref="container">
    <div class="water-ball">
      <div class="water-wave" :style="waveStyle"></div>
      <div class="percentage">{{ percentage.toFixed(1) }}%</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
  percentage: {
    type: Number,
    default: 0
  },
  size: {
    type: Number,
    default: 120
  },
  position: {
    type: String,
    default: 'bottom-right' // 'top-left', 'top-right', 'bottom-left', 'bottom-right'
  },
  draggable: {
    type: Boolean,
    default: true
  }
});

const container = ref(null);
let isDragging = false;
let startX = 0;
let startY = 0;
let offsetX = 0;
let offsetY = 0;

const containerStyle = computed(() => {
  const positionStyles = {
    'top-left': { top: '20px', left: '20px' },
    'top-right': { top: '20px', right: '20px' },
    'bottom-left': { bottom: '20px', left: '20px' },
    'bottom-right': { bottom: '20px', right: '20px' }
  };

  return {
    width: `${props.size}px`,
    height: `${props.size}px`,
    ...positionStyles[props.position],
    transform: offsetX || offsetY ? `translate(${offsetX}px, ${offsetY}px)` : ''
  };
});

const waveStyle = computed(() => {
  // 100% - percentage 是因为水位从下往上升
  const height = `${100 - props.percentage}%`;
  return {
    height: height,
    background: getColorByPercentage(props.percentage)
  };
});

function getColorByPercentage(percentage) {
  // 颜色从蓝色渐变到红色
  if (percentage < 25) {
    return '#4fc3f7'; // 浅蓝色
  } else if (percentage < 50) {
    return '#29b6f6'; // 蓝色
  } else if (percentage < 75) {
    return '#ffa726'; // 橙色
  } else {
    return '#f44336'; // 红色
  }
}

function handleMouseDown(e) {
  if (!props.draggable) return;
  
  isDragging = true;
  startX = e.clientX;
  startY = e.clientY;
  
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
  
  e.preventDefault();
}

function handleMouseMove(e) {
  if (!isDragging) return;
  
  const deltaX = e.clientX - startX;
  const deltaY = e.clientY - startY;
  
  offsetX += deltaX;
  offsetY += deltaY;
  
  startX = e.clientX;
  startY = e.clientY;
  
  if (container.value) {
    container.value.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
  }
}

function handleMouseUp() {
  isDragging = false;
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
}

onMounted(() => {
  if (container.value) {
    container.value.addEventListener('mousedown', handleMouseDown);
  }
});

onUnmounted(() => {
  if (container.value) {
    container.value.removeEventListener('mousedown', handleMouseDown);
  }
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
});
</script>

<style scoped>
.water-ball-container {
  position: fixed;
  z-index: 9999;
  cursor: move;
}

.water-ball {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.water-wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: #29b6f6;
  transition: height 0.3s ease;
}

.water-wave::before,
.water-wave::after {
  content: "";
  position: absolute;
  width: 200%;
  height: 200%;
  top: 0;
  left: -50%;
  border-radius: 40%;
  background: rgba(255, 255, 255, 0.2);
}

.water-wave::before {
  animation: wave 8s linear infinite;
}

.water-wave::after {
  animation: wave 10s linear infinite;
}

.percentage {
  position: relative;
  z-index: 1;
  font-size: calc(100% + 6px);
  font-weight: bold;
  color: #333;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
}

@keyframes wave {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style> 