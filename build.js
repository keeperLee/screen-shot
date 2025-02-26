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
  
  // 创建更简单、更明显的火箭图标SVG
  const rocketIconContent = `<svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="128" height="128" rx="24" fill="#1E88E5"/>
  <path d="M64 16C64 16 40 32 40 72V96L52 84V72C52 44 64 32 64 32V16Z" fill="white"/>
  <path d="M64 16C64 16 88 32 88 72V96L76 84V72C76 44 64 32 64 32V16Z" fill="#FFC107"/>
  <path d="M64 32C64 32 52 44 52 72V84L64 96L76 84V72C76 44 64 32 64 32Z" fill="#F44336"/>
  <path d="M52 96L40 108H64H88L76 96H52Z" fill="#E64A19"/>
  <path d="M58 104H70L64 120L58 104Z" fill="#FF9800"/>
  <circle cx="64" cy="56" r="8" fill="white" fill-opacity="0.5"/>
</svg>`
  
  // 写入SVG图标
  const svgPath = path.join(srcIconsDir, 'icon.svg')
  await fs.writeFile(svgPath, rocketIconContent)
  console.log(`Created rocket icon at ${svgPath}`)
  
  // 创建简单的PNG图标文件 (16x16 和 48x48)
  // 这里我们只是创建一个简单的占位符，实际应用中应该使用适当的图像转换工具
  const icon16Content = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="16" height="16" rx="3" fill="#1E88E5"/>
  <path d="M8 2C8 2 5 4 5 9V12L6.5 10.5V9C6.5 5.5 8 4 8 4V2Z" fill="white"/>
  <path d="M8 2C8 2 11 4 11 9V12L9.5 10.5V9C9.5 5.5 8 4 8 4V2Z" fill="#FFC107"/>
  <path d="M8 4C8 4 6.5 5.5 6.5 9V10.5L8 12L9.5 10.5V9C9.5 5.5 8 4 8 4Z" fill="#F44336"/>
  <path d="M6.5 12L5 13.5H8H11L9.5 12H6.5Z" fill="#E64A19"/>
  <path d="M7.25 13H8.75L8 15L7.25 13Z" fill="#FF9800"/>
</svg>`
  
  const icon48Content = `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="48" height="48" rx="9" fill="#1E88E5"/>
  <path d="M24 6C24 6 15 12 15 27V36L19.5 31.5V27C19.5 16.5 24 12 24 12V6Z" fill="white"/>
  <path d="M24 6C24 6 33 12 33 27V36L28.5 31.5V27C28.5 16.5 24 12 24 12V6Z" fill="#FFC107"/>
  <path d="M24 12C24 12 19.5 16.5 19.5 27V31.5L24 36L28.5 31.5V27C28.5 16.5 24 12 24 12Z" fill="#F44336"/>
  <path d="M19.5 36L15 40.5H24H33L28.5 36H19.5Z" fill="#E64A19"/>
  <path d="M21.75 39H26.25L24 45L21.75 39Z" fill="#FF9800"/>
  <circle cx="24" cy="21" r="3" fill="white" fill-opacity="0.5"/>
</svg>`
  
  const icon16Path = path.join(srcIconsDir, 'icon16.png')
  const icon48Path = path.join(srcIconsDir, 'icon48.png')
  
  // 写入SVG格式的小图标（Chrome会自动处理）
  await fs.writeFile(path.join(srcIconsDir, 'icon16.svg'), icon16Content)
  await fs.writeFile(path.join(srcIconsDir, 'icon48.svg'), icon48Content)
  
  // 复制图标目录
  if (await fs.pathExists(srcIconsDir)) {
    await fs.copy(srcIconsDir, destIconsDir)
  }
  
  console.log('图标文件已创建并复制到目标目录')
}

copyFiles().catch(console.error) 