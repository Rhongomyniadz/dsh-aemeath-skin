# dsh-aimesi-skin · 爱弥斯

DeepSeek Harness Web GUI 的粉丝向皮肤：**爱弥斯（鸣潮）粉色机娘主题**。

- 对话区背景：`assets/chat.webp`（来自用户指定的 JPG）
- 侧栏背景：`assets/sidebar.webp`（来自用户指定的 PNG）
- 输入框上方与侧栏底部的蝴蝶结位置 → 爱心形声痕（呼吸发光）
- 粉色主色 + 深莓紫玻璃面板 + 电光粉信号线 + HUD 角标（隧者机兵风）

## 安装

```sh
cd <harness>
dsh plugin --profile web add /path/to/dsh-aimesi-skin
```

重启 `dsh web` 后，在 profile 与 home 两个 patch 层中：

```yaml
- id: ui-skin-aimesi
  disabled: false
- id: ui-skin-maid-atelier
  disabled: true   # 若同时装了女仆皮肤，保持同一时间只启用一套
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
