// 水球挂件内容脚本
(() => {
    // 检查是否已经加载过水球挂件，避免重复加载
    if (window.hasWaterBallExtension) {
        console.log('Water ball extension already loaded');
        // 如果已经加载过，移除之前的水球，确保只有一个实例
        const existingWaterBall = document.querySelector('.water-ball-container');
        if (existingWaterBall) {
            existingWaterBall.remove();
        }
    }

    console.log('Initializing water ball extension...');

    Object.defineProperty(window, 'hasWaterBallExtension', {
        value: true,
        enumerable: false,
        writable: false
    });

    let waterBallContainer = null;
    let isVisible = false;
    let yearProgress = 0;
    let updateInterval = null;
    let observer = null;
    let currentPosition = { right: '20px', bottom: '20px', left: 'auto', top: 'auto' };

    // 计算今年已过去的时间百分比
    function calculateYearProgress () {
        const now = new Date();
        const year = now.getFullYear();
        const startOfYear = new Date(year, 0, 1);
        const endOfYear = new Date(year + 1, 0, 1);

        const totalMilliseconds = endOfYear - startOfYear;
        const elapsedMilliseconds = now - startOfYear;

        return (elapsedMilliseconds / totalMilliseconds) * 100;
    }

    // 计算今天已过去的时间百分比
    function calculateDayProgress () {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

        const totalMilliseconds = endOfDay - startOfDay;
        const elapsedMilliseconds = now - startOfDay;

        return (elapsedMilliseconds / totalMilliseconds) * 100;
    }

    // 创建水球DOM
    function createWaterBall () {
        // 先移除可能存在的旧水球
        const existingWaterBall = document.querySelector('.water-ball-container');
        if (existingWaterBall) {
            existingWaterBall.remove();
        }

        if (waterBallContainer) return;

        console.log('Creating water ball...');

        try {
            // 创建容器
            waterBallContainer = document.createElement('div');

            // 设置容器属性
            waterBallContainer.className = 'water-ball-container';

            // 应用位置
            Object.keys(currentPosition).forEach(key => {
                waterBallContainer.style[key] = currentPosition[key];
            });

            // 创建水球内部结构
            waterBallContainer.innerHTML = `
                <div class="water-balls-wrapper">
                    <div class="water-ball year-ball">
                        <div class="water-wave"></div>
                        <div class="percentage-container">
                            <div class="label">今年已过去</div>
                            <div class="percentage">0%</div>
                        </div>
                    </div>
                    <div class="water-ball day-ball">
                        <div class="water-wave"></div>
                        <div class="percentage-container">
                            <div class="label">今日已过去</div>
                            <div class="percentage">0%</div>
                        </div>
                    </div>
                </div>
            `;

            // 添加拖拽功能
            let isDragging = false;
            let startX = 0;
            let startY = 0;
            let initialX = 0;
            let initialY = 0;

            // 整个容器可拖拽
            waterBallContainer.addEventListener('mousedown', (e) => {
                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;
                const rect = waterBallContainer.getBoundingClientRect();
                initialX = rect.left;
                initialY = rect.top;
                e.preventDefault();
            });

            document.addEventListener('mousemove', (e) => {
                if (!isDragging) return;

                const dx = e.clientX - startX;
                const dy = e.clientY - startY;

                const newLeft = initialX + dx;
                const newTop = initialY + dy;

                // 更新位置
                waterBallContainer.style.left = `${newLeft}px`;
                waterBallContainer.style.top = `${newTop}px`;
                waterBallContainer.style.right = 'auto';
                waterBallContainer.style.bottom = 'auto';

                // 保存新位置到全局变量 - 修复缺少的 left 属性
                currentPosition = {
                    left: `${newLeft}px`,
                    top: `${newTop}px`,
                    right: 'auto',
                    bottom: 'auto'
                };
            });

            document.addEventListener('mouseup', () => {
                if (isDragging) {
                    isDragging = false;

                    // 保存位置到后台
                    try {
                        chrome.runtime.sendMessage({
                            action: 'saveWaterBallPosition',
                            position: currentPosition
                        });
                    } catch (e) {
                        console.error('Failed to save water ball position:', e);
                    }
                }
            });

            // 添加到页面
            try {
                document.body.appendChild(waterBallContainer);
                console.log('Water ball created and added to page');

                // 设置 MutationObserver 来监视 DOM 变化
                setupObserver();
            } catch (e) {
                console.error('Failed to append water ball to body:', e);
            }
        } catch (e) {
            console.error('Error creating water ball:', e);
        }
    }

    // 更新水球位置
    function updateWaterBallPosition (position) {
        if (!waterBallContainer) return;

        // 直接应用位置到容器
        Object.keys(position).forEach(key => {
            waterBallContainer.style[key] = position[key];
        });

        // 更新当前位置
        currentPosition = position;
    }

    // 设置 MutationObserver 来监视 DOM 变化
    function setupObserver () {
        if (observer) {
            observer.disconnect();
        }

        observer = new MutationObserver((mutations) => {
            // 如果水球容器不在文档中，重新添加它
            if (isVisible && waterBallContainer && !document.body.contains(waterBallContainer)) {
                try {
                    document.body.appendChild(waterBallContainer);
                    console.log('Water ball re-added to page after DOM change');
                } catch (e) {
                    console.error('Failed to re-append water ball:', e);
                }
            }
        });

        // 观察整个文档的变化
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }

    // 更新水球显示
    function updateWaterBall () {
        if (!waterBallContainer || !isVisible) return;

        yearProgress = calculateYearProgress();
        const dayProgress = calculateDayProgress();

        const yearWave = waterBallContainer.querySelector('.year-ball .water-wave');
        const yearPercentage = waterBallContainer.querySelector('.year-ball .percentage');

        const dayWave = waterBallContainer.querySelector('.day-ball .water-wave');
        const dayPercentage = waterBallContainer.querySelector('.day-ball .percentage');

        if (yearWave && yearPercentage) {
            // 直接使用年度进度百分比作为填充高度
            yearWave.style.height = `${yearProgress}%`;
            yearWave.style.top = 'auto';
            yearWave.style.bottom = '0';

            // 使用绿色作为年进度颜色
            const yearColor = getColorByPercentage(yearProgress);
            yearWave.style.background = yearColor;

            yearPercentage.textContent = `${yearProgress.toFixed(1)}%`;
        }

        if (dayWave && dayPercentage) {
            // 直接使用日进度百分比作为填充高度
            dayWave.style.height = `${dayProgress}%`;
            dayWave.style.top = 'auto';
            dayWave.style.bottom = '0';

            // 使用蓝色作为日进度颜色
            const dayColor = getDayColorByPercentage(dayProgress);
            dayWave.style.background = dayColor;

            dayPercentage.textContent = `${dayProgress.toFixed(1)}%`;
        }
    }

    // 根据百分比获取颜色
    function getColorByPercentage (percentage) {
        // 修改颜色方案
        return percentage < 50 ? '#4CAF50' : '#4CAF50'; // 年进度使用绿色
    }

    // 根据百分比获取日进度颜色
    function getDayColorByPercentage (percentage) {
        // 日进度使用蓝色
        return percentage < 50 ? '#2196F3' : '#2196F3';
    }

    // 显示水球
    function showWaterBall () {
        console.log('Showing water ball...');
        if (!waterBallContainer) {
            createWaterBall();
        }

        if (waterBallContainer) {
            console.log('Setting water ball display to block');
            waterBallContainer.style.display = 'block';
            waterBallContainer.style.visibility = 'visible'; // 确保可见性
            waterBallContainer.style.opacity = '1'; // 确保不透明
            isVisible = true;
            updateWaterBall();

            if (!updateInterval) {
                updateInterval = setInterval(updateWaterBall, 1000);
            }

            // 确保水球在页面上
            if (!document.body.contains(waterBallContainer)) {
                try {
                    console.log('Appending water ball to body');
                    document.body.appendChild(waterBallContainer);
                } catch (e) {
                    console.error('Failed to append water ball when showing:', e);
                }
            }

            // 调试信息
            console.log('Water ball container:', waterBallContainer);
            console.log('Water ball style:', waterBallContainer.style.cssText);
            console.log('Water ball is in DOM:', document.body.contains(waterBallContainer));
            console.log('Water ball dimensions:', waterBallContainer.getBoundingClientRect());
            console.log('Water ball computed style:', window.getComputedStyle(waterBallContainer));
        } else {
            console.error('Failed to create water ball container');
        }
    }

    // 隐藏水球
    function hideWaterBall () {
        if (waterBallContainer) {
            waterBallContainer.style.display = 'none';
            isVisible = false;

            if (updateInterval) {
                clearInterval(updateInterval);
                updateInterval = null;
            }
        }
    }

    // 监听消息
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        console.log('Received message:', request);

        if (request.action === 'toggleWaterBall') {
            if (request.show) {
                showWaterBall();
            } else {
                hideWaterBall();
            }
            sendResponse({ success: true });
            return true;
        }

        if (request.action === 'updateWaterBall') {
            // 更新水球状态和位置
            if (request.show) {
                showWaterBall();
            } else {
                hideWaterBall();
            }

            if (request.position) {
                updateWaterBallPosition(request.position);
            }

            sendResponse({ success: true });
            return true;
        }
    });

    // 初始化时从后台脚本获取状态
    try {
        chrome.runtime.sendMessage({ action: 'getWaterBallState' }, (response) => {
            console.log('Initial water ball state from background:', response);
            if (response) {
                if (response.position) {
                    currentPosition = response.position;
                }

                if (response.show) {
                    showWaterBall();
                }
            } else {
                // 如果没有收到响应，默认显示
                showWaterBall();
            }
        });
    } catch (e) {
        console.error('Error getting water ball state from background:', e);
        // 默认显示水球
        showWaterBall();
    }

    // 确保在页面完全加载后显示水球
    window.addEventListener('load', () => {
        if (isVisible) {
            showWaterBall();
        }
    });

    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
        .water-ball-container {
            position: fixed;
            width: 210px;
            height: 100px;
            z-index: 2147483647;
            cursor: move;
            user-select: none;
            pointer-events: auto !important;
            display: block; /* 确保可见 */
        }
        .water-balls-wrapper {
            display: flex;
            gap: 10px;
            width: 100%;
            height: 100%;
        }
        .water-ball {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.8);
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
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
            transition: height 0.3s ease;
            overflow: hidden;
        }
        .water-wave::before,
        .water-wave::after {
            content: "";
            position: absolute;
            width: 200%;
            height: 8px;
            top: -4px;
            left: -50%;
            background: transparent;
            border-radius: 40%;
        }
        .water-wave::before {
            animation: wave-x 3s infinite linear, wave-y 2.5s infinite ease-in-out;
            border-top: 2px solid rgba(255, 255, 255, 0.4);
        }
        .water-wave::after {
            animation: wave-x 3s infinite linear reverse, wave-y 3s infinite ease-in-out -1.25s;
            border-top: 2px solid rgba(255, 255, 255, 0.2);
        }
        .percentage-container {
            position: relative;
            z-index: 1;
            text-align: center;
        }
        .label {
            font-size: 12px;
            color: #333;
            margin-bottom: 2px;
            text-shadow: 0 1px 2px rgba(255, 255, 255, 0.6);
        }
        .percentage {
            font-size: 18px;
            font-weight: bold;
            color: #333;
            text-shadow: 0 1px 2px rgba(255, 255, 255, 0.6);
        }
        @keyframes wave-x {
            0% {
                transform: translateX(-50%);
            }
            100% {
                transform: translateX(0);
            }
        }
        @keyframes wave-y {
            0%, 100% {
                transform: translateY(-2px);
            }
            50% {
                transform: translateY(2px);
            }
        }
    `;

    // 确保样式被添加到文档中
    document.head.appendChild(style);
})(); 