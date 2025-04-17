const fs = require('fs-extra')
const path = require('path')

// 构建后的清理和复制任务
async function copyFiles () {
    const srcDir = path.join(__dirname, 'public')
    const destDir = path.join(__dirname, 'dist')

    // 确保目标目录存在
    await fs.ensureDir(destDir)

    // 复制 manifest.json
    await fs.copy(
        path.join(srcDir, 'manifest.json'),
        path.join(destDir, 'manifest.json')
    )

    // 确保图标目录存在
    const srcIconsDir = path.join(srcDir, 'icons')
    const destIconsDir = path.join(destDir, 'icons')

    await fs.ensureDir(srcIconsDir)
    await fs.ensureDir(destIconsDir)

    // 复制已有的PNG图标
    try {
        await fs.copy(path.join(srcIconsDir, 'icon16.png'), path.join(destIconsDir, 'icon16.png'))
        await fs.copy(path.join(srcIconsDir, 'icon48.png'), path.join(destIconsDir, 'icon48.png'))
        await fs.copy(path.join(srcIconsDir, 'icon128.png'), path.join(destIconsDir, 'icon128.png'))
        console.log('图标文件已复制')
    } catch (err) {
        console.error('复制图标文件失败:', err)
    }
}

copyFiles().catch(console.error) 