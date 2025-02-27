<template>
    <div class="popup">
        <div class="header">
            <h2 class="title">万能宝</h2>
            <button class="close-btn" @click="closePopup" title="关闭">×</button>
        </div>
        <Screenshot />

        <div class="water-ball-toggle">
            <label class="switch">
                <input type="checkbox" v-model="showWaterBall" @change="toggleWaterBall">
                <span class="slider round"></span>
            </label>
            <span class="toggle-label">显示水球挂件</span>
        </div>

        <div v-if="isChromePage" class="warning-message">
            注意：由于浏览器安全限制，水球挂件无法在 chrome:// 页面上显示。
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Screenshot from './components/Screenshot.vue'

// 水球挂件状态，默认为true
const showWaterBall = ref(true)
const isChromePage = ref(false)

// 关闭弹出窗口
const closePopup = () => {
    window.close()
}

// 切换水球挂件显示状态
const toggleWaterBall = async () => {
    console.log('Toggle water ball:', showWaterBall.value);

    try {
        // 通过 background 脚本设置状态
        await chrome.runtime.sendMessage({
            action: 'setWaterBallState',
            show: showWaterBall.value
        });
    } catch (error) {
        console.error('Error toggling water ball:', error);
    }
}

// 检查当前是否在 chrome:// 页面
onMounted(async () => {
    try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tabs[0] && tabs[0].url && tabs[0].url.startsWith('chrome://')) {
            isChromePage.value = true;
        }
    } catch (error) {
        console.error('Error checking page type:', error);
    }

    // 监听ESC键
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closePopup()
        }
    })

    // 从 background 脚本获取当前状态
    chrome.runtime.sendMessage({ action: 'getWaterBallState' }, (response) => {
        if (response && response.show !== undefined) {
            showWaterBall.value = response.show;
        }
    });
})
</script>

<style>
body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
        Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.popup {
    width: 300px;
    min-height: 200px;
    padding: 10px;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.title {
    text-align: center;
    color: #4CAF50;
    margin: 0;
    font-size: 18px;
    flex-grow: 1;
}

.close-btn {
    background: none;
    border: none;
    font-size: 20px;
    color: #999;
    cursor: pointer;
    padding: 0 5px;
    line-height: 1;
    border-radius: 50%;
}

.close-btn:hover {
    color: #666;
    background-color: #f0f0f0;
}

.water-ball-toggle {
    margin-top: 20px;
    display: flex;
    align-items: center;
    padding: 10px;
    background-color: #f0f0f0;
    border-radius: 8px;
}

.toggle-label {
    margin-left: 10px;
    font-size: 14px;
    color: #333;
}

/* 开关样式 */
.switch {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 24px;
}

.switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: .4s;
}

.slider:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: .4s;
}

input:checked+.slider {
    background-color: #2196F3;
}

input:focus+.slider {
    box-shadow: 0 0 1px #2196F3;
}

input:checked+.slider:before {
    transform: translateX(16px);
}

.slider.round {
    border-radius: 24px;
}

.slider.round:before {
    border-radius: 50%;
}

/* 添加警告消息样式 */
.warning-message {
    margin-top: 10px;
    padding: 8px;
    background-color: #FFF3E0;
    border-left: 4px solid #FF9800;
    font-size: 12px;
    color: #E65100;
    border-radius: 2px;
}
</style>