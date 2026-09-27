# FACT 交互原型 · MVP版

## 打开原型

最简单的方式：双击项目根目录的 `preview.cmd`。它会启动本地服务并打开固定预览地址：

`http://127.0.0.1:5174/`

也可以手动运行：

开发模式：

```powershell
npm.cmd run dev
```

浏览器打开命令输出的本地地址。生产构建：

```powershell
npm.cmd run build
```

构建结果在 `dist`。

## 常用修改位置

- 所有界面文案、双语样例数据、状态、功能 ID：`src/constants/copy.ts`
- 所有颜色、间距、尺寸、字号：`src/styles/vars.css`
- 页面布局与交互：`src/pages/MvpApp.tsx`
- 全局导航和弹层：`src/components/`
- MVP 样式：`src/styles/mvp.css`

更完整的维护说明：

- 文案与版本：`docs/CONTENT_AND_VERSIONING.md`
- 交互地图：`docs/INTERACTION_MAP.md`

修改后运行 `npm.cmd run build`，确认 TypeScript 和生产构建通过。

## 当前范围

当前 MVP 原型覆盖已确认的 58 项 M0/M1 功能，形成“导入与处理 → 文档与搜索 → 审阅 → 分析 → 交付 → 任务与配置”的闭环。UI 沿用原版的导航、顶部工具区、页面画布、卡片、表格和抽屉体系，只删减功能入口。功能清单使用 FACT-* 作为我方产品编号，REL-* 与 SUP-* 仅用于来源追溯。

这是前端演示状态，没有连接真实后端，也没有在真实 RelativityOne 租户中验证精确按钮位置和权限组合。

## 预览与协作

- 本地预览链接只在启动服务的电脑上有效。
- GitHub 仓库：`https://github.com/lynnzheng113-collab/FACT-MVP`
- GitHub Pages：推送到 `main` 后由 `.github/workflows/deploy-pages.yml` 自动构建和部署。
- 公开访问地址：`https://lynnzheng113-collab.github.io/FACT-MVP/`

## 撤回

本目录是 FACT 原型的 Git 仓库。若需要撤回某一轮改动，优先使用该轮提交的 `git revert <commit>`；未提交的修改可用 `git diff` 检查后再处理。按项目约定，只有你明确说“提交”时才创建 Git commit。

## 双版本隔离（2026-09-27）

- 本目录：`D:\Relativity\工作成果\04_交互原型\MVP版`，用途：从完整原型复制的独立 MVP 工程。本版本入口按已确认的 58 项 M0/M1 功能收敛，M2 与单列“条件必要”功能暂不进入当前入口。
- 两份均从 `965afa35dbf2dc639cdb38fca21461bfd95e187d` 开始，各自拥有完整 `.git`、源码、依赖与构建目录；没有共享 worktree、目录链接或硬链接。
- 双击本目录 `preview.cmd` 打开开发预览；也可执行 `npm.cmd run dev`。端口固定为 `5174`，占用时不会自动切换到另一版。
- 构建后运行 `npm.cmd run preview` 使用 `4174`；只运行 `npm.cmd run build` 不会启动预览。
- `preview.ps1` 会核对服务的版本和工程路径，只复用当前目录的实例。两套 URL 使用不同端口，浏览器本地存储也按来源分开。
- 当前远程仅指向 MVP 专用仓库 `FACT-MVP`，不连接原版远程分支。
- 修改、安装依赖、构建、提交只在本目录执行，不自动同步另一份。本地“更新互不干扰”不代表将来接入同一后端后仍自动隔离；届时须分别配置数据/环境。
- 本版本通过独立 GitHub 仓库发布；原版工程仍不参与提交、推送或 Pages 部署。
