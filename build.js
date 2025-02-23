const fs = require('fs-extra')
const path = require('path')

// 构建后的清理和复制任务
async function copyFiles() {
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
  
  // 如果图标文件不存在，创建默认图标
  const iconSizes = [16, 48, 128]
  const defaultIconContent = `
    <svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="128" rx="24" fill="#4CAF50"/>
      <path d="M32 32h64v64H32z" stroke="white" stroke-width="8"/>
      <path d="M48 48h32v32H48z" fill="white"/>
    </svg>
  `
  
  for (const size of iconSizes) {
    const iconPath = path.join(srcIconsDir, `icon${size}.png`)
    if (!await fs.pathExists(iconPath)) {
      // 写入默认SVG图标
      await fs.writeFile(
        path.join(srcIconsDir, 'icon.svg'),
        defaultIconContent
      )
      console.log(`Created default icon at ${iconPath}`)
    }
  }
  
  // 复制图标目录
  if (await fs.pathExists(srcIconsDir)) {
    await fs.copy(srcIconsDir, destIconsDir)
  }
}

copyFiles().catch(console.error) 