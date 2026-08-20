# dsh-aemeath-skin · 爱弥斯

DeepSeek Harness Web GUI 皮肤：**爱弥斯主题**。

- 对话区背景：`assets/chat.webp`
- 侧栏背景：`assets/sidebar.webp`
- 对话右上角角色立绘：`assets/chat-companion.webp`（源图 `chat-companion.png`，
  构建脚本内嵌的是 webp；替换后重新 build 即可）
- 粉色主色 + 深莓紫玻璃面板 + 电光粉信号线 + HUD 角标

## 安装

```sh
cd <harness>
dsh plugin --profile web add /path/to/dsh-aemeath-skin
```

重启 `dsh web` 后，在 profile 与 home 两个 patch 层中：

```yaml
- id: ui-skin-aemeath
  disabled: false
```

## 素材与构建

`lib/` 是提交的分发产物，由 `scripts/build.mjs` 从 `src/` 与 `assets/`
确定性重组（无外部依赖、无远程资源）：

```sh
npm run build
```

替换 `assets/chat.webp` / `assets/sidebar.webp` 后重新 build 即可换背景图。
爱心声痕 SVG 在 `src/client/art.js` 中，可按需调整。

## 许可

CC BY-NC-SA 4.0（仅个人/非商业使用；署名链见 `NOTICE`）。
