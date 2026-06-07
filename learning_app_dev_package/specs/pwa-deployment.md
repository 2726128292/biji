# PWA 与 GitHub Pages 部署建议

## 构建

```bash
npm install
npm run build
```

## GitHub Pages

建议使用 GitHub Actions 自动发布 `dist`，不要每次手动复制文件。

当项目部署在仓库子路径时，Vite 配置示例：

```ts
export default defineConfig({
  base: '/repository-name/'
})
```

## Service Worker 更新策略

- 后台下载新版。
- 已打开的编辑页面不强制刷新。
- 显示“新版本已准备好”，允许用户立即重启或稍后应用。

## 离线范围

必须缓存：HTML、JS、CSS、图标、本地字体、编辑器资源。  
业务数据始终来自 IndexedDB。  
不要依赖 CDN 字体、远程图标和远程脚本。
