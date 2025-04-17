const fs = require('fs');
const { createCanvas } = require('canvas');

function createIcon (size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // 绘制圆形背景
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = '#2196F3';
    ctx.fill();

    // 绘制水波效果
    ctx.beginPath();
    ctx.fillStyle = '#29B6F6';
    ctx.arc(size / 2, size / 2, size / 2 * 0.8, 0, Math.PI * 2);
    ctx.fill();

    // 绘制百分比文字
    if (size >= 48) {
        ctx.font = `bold ${size / 4}px Arial`;
        ctx.fillStyle = '#FFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('25%', size / 2, size / 2);
    }

    return canvas.toBuffer('image/png');
}

// 创建不同尺寸的图标
[16, 48, 128].forEach(size => {
    const iconData = createIcon(size);
    if (!fs.existsSync('dist/icons')) {
        fs.mkdirSync('dist/icons', { recursive: true });
    }
    fs.writeFileSync(`dist/icons/icon${size}.png`, iconData);
    console.log(`Created ${size}x${size} icon`);
}); 