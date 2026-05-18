# Code Wiki - Swipe2（TS 工程化版）

## 1. 项目简介

这是一个竖屏 H5 弹射原型游戏：

- 拖拽果冻球蓄力，松手发射
- 飞行中挂钉持续上升
- 躲避障碍（轨道/齿轮等）
- 记录最高米数

本次重构目标：**从散文件脚本改为 TypeScript + Vite 工程化结构**，便于后续玩法扩展、资源管理与移动端打包。

当前状态：`src/main.ts / src/ball_visual.ts / src/death_fx.ts / src/jelly_preview.ts / src/map_editor/index.ts` 已全部通过 TS 检查（不再依赖 `@ts-nocheck`）。

---

## 2. 目录总览（当前推荐开发入口）

> 推荐以 `web/` 作为主开发目录。

```text
swipe_2/
├── web/
│   ├── src/
│   │   ├── main.ts            # 游戏主入口（原 game.js）
│   │   ├── ball_visual.ts     # 果冻球视觉模块（原 ball_visual.js）
│   │   ├── death_fx.ts        # 死亡特效默认参数模块（原 death_fx.js）
│   │   ├── config/
│   │   │   ├── hazard_defaults.ts # 游戏与地图编辑器共用障碍默认配置
│   │   │   └── storage_keys.ts # 本地存储键与本地保存接口常量
│   │   ├── systems/
│   │   │   ├── camera.ts       # 相机跟随计算逻辑
│   │   │   ├── death_fx_runtime.ts # 死亡特效粒子/污渍更新与绘制辅助
│   │   │   ├── hazard_loop.ts  # 障碍槽位选择与计数器更新
│   │   │   ├── hooks.ts        # 挂钩判定辅助函数
│   │   │   ├── input.ts        # 屏幕/世界坐标转换
│   │   │   ├── physics.ts      # 基础物理积分/阻尼工具
│   │   │   ├── render.ts       # HUD 文本渲染辅助
│   │   │   ├── render_world.ts # 轨道/锚点/齿轮世界渲染
│   │   │   ├── spawn.ts        # 关卡生成数学/随机工具
│   │   │   ├── storage.ts      # 安全读写 localStorage 工具
│   │   │   └── update_loop.ts  # 主更新循环调度器
│   │   ├── jelly_preview.ts   # 果冻预览页逻辑
│   │   └── map_editor/
│   │       └── index.ts       # 地图预览页逻辑
│   ├── index.html             # 主游戏页
│   ├── jelly_preview.html     # 果冻可视化调参页
│   ├── map_preview.html       # 地图关卡编辑器页
│   ├── template_library.html  # 地图模版库生成与导出页
│   ├── style.css              # 主游戏样式
│   ├── jelly_preview.css      # 果冻预览样式
│   ├── map_preview.css        # 地图预览样式
│   ├── dev_server.py          # 本地保存默认参数到源码的接口服务
│   ├── capacitor.config.json  # Capacitor 配置（webDir=dist）
│   ├── vite.config.ts         # Vite 多页面打包配置
│   ├── tsconfig.json          # TS 编译配置
│   └── package.json           # 工程脚本与依赖
├── android/                   # Android 工程（Capacitor）
└── （根目录历史文件）         # 旧版本散文件，后续建议逐步收敛
```

---

## 3. 开发与构建命令

在 `web/` 目录执行：

```bash
npm install
npm run dev
```

常用命令：

- `npm run dev`：本地开发（Vite）
- `npm run build`：生产构建（输出 `web/dist`）
- `npm run preview`：本地预览构建产物
- `npm run typecheck`：TS 检查
- `npm run cap:copy`：同步前端构建到 Android 资源
- `npm run cap:sync`：完整同步 Capacitor 到 Android

---

## 4. 运行时核心模块说明

### `web/src/main.ts`

游戏主循环与核心系统：

- 输入（pointer down/move/up）
- 发射与挂点逻辑
- 物理推进（自由飞行/挂绳摆动）
- 相机跟随、HUD 米数/FPS
- 关卡内容生成（锚点、轨道、齿轮、红点机制）
- 死亡判定与特效触发
- 调试面板参数读写与本地存储

### `web/src/ball_visual.ts`

果冻球视觉渲染：

- 视觉参数默认值
- 图层开关（主体、发光、眼睛等）
- 果冻形变路径计算
- 最终 `drawJellyBall` 绘制入口

### `web/src/death_fx.ts`

死亡特效配置：

- 默认值
- 配置规范化（范围夹取）

### `web/src/config/storage_keys.ts`

集中管理：

- LocalStorage keys（主配置/果冻/障碍/最高分/引导状态）
- 本地默认值写回接口地址常量

这样可以避免 `main.ts / map_editor/index.ts / jelly_preview.ts` 重复定义同一组键名。

### `web/src/systems/camera.ts`

把主相机跟随算法独立为 `updateCameraState(...)`，`main.ts` 仅传入 world/cfg 与 clamp。

### `web/src/systems/input.ts`

抽离坐标转换：

- `toScreenPointFromEvent`
- `toWorldPointFromEvent`
- `screenToWorldPoint`

减少主入口中对事件坐标计算的重复代码。

### `web/src/systems/storage.ts`

抽离 LocalStorage 安全工具：

- `safeGetJSON / safeSetJSON`
- `safeGetNumber / safeGetString`
- `safeSetString / safeRemoveKeys`

便于后续替换存档策略（如版本迁移、云存档桥接）。

### `web/src/systems/render.ts`

抽离 HUD 文本更新：

- `renderMeterHud`
- `renderFpsHud`

### `web/src/systems/spawn.ts`

抽离生成相关纯函数：

- 锚点列位置与随机扰动
- 动态间距曲线
- 红点概率曲线
- 最大横向步进计算

主循环与状态仍在 `main.ts`，但生成数学已可复用、可单测。

### `web/src/systems/hazard_loop.ts`

抽离“生成槽位循环”的选择与计数逻辑：

- `pickGeneratedSlot`
- `applyGeneratedSlotCounters`

主文件只负责执行具体生成动作（生成轨道/齿轮/锚点）。

### `web/src/systems/death_fx_runtime.ts`

抽离死亡特效运行时逻辑：

- 调色板构建
- 粒子/污渍创建
- 粒子更新与落地转污渍
- 死亡特效绘制

`main.ts` 负责触发时机与状态切换（dying/gameover），模块负责特效细节更新与渲染。

### `web/src/systems/render_world.ts`

抽离世界对象渲染：

- `drawMovingTrackWorld`
- `drawAnchorsWorld`
- `drawGearHazardsWorld`

这样 `main.ts` 的 draw 阶段只保留调度，具体对象渲染逻辑集中管理。

### `web/src/systems/physics.ts`

基础物理 helper：

- `applyGravity`
- `applyAirDrag`
- `integrateBody`

供 `applyFreeFlightPhysics` / `applyTetheredPhysics` 复用。

### `web/src/systems/hooks.ts`

挂钩判定 helper：

- `canTryAnchorHook`
- `getAnchorHookHitRadius`
- `canHookCandidate`

减少 `main.ts` 中挂钩规则散落。

### `web/src/systems/update_loop.ts`

把主 `update(dt)` 的流程调度提炼成 `runMainUpdateStep(...)`：

- pre-update（动画/轨道/特效）
- 状态推进（drag/launch/tether）
- 碰撞与死亡检查
- 相机与生成覆盖

`main.ts` 现在主要负责传入 world/cfg 与回调。

### `web/src/systems/ui.ts`

抽离 UI 细节：

- `setTextStatus`
- `syncPanelVisibility`

减少主入口文件的重复 DOM 操作代码。

### `web/src/jelly_preview.ts`

用于独立调果冻视觉与图层显示，便于美术/程序快速验证观感。

### `web/src/map_editor/index.ts`

用于独立预览地图/障碍生成分布，快速查看不同米数区间下的密度与可达性。

同时支持“地图模版库”导出：

- 以 `50m` 为单位批量生成随机模版
- 按当前地图编辑器难度配置生成锚点与障碍
- 在编辑器内一键保存为 JSON 文件，便于版本化与后续关卡复用

对应页面已拆分为两个入口：

- `map_preview.html`：地图关卡编辑器
- `template_library.html`：地图模版库（50m 单位）生成与导出

模板库页为精简模式，仅保留：难度配置、难度选择、随机生成、保存 JSON 四项操作。

### `web/dev_server.py`

本地调参落盘服务：

- 接口：`POST /__save_code_defaults`
- 可将调参结果写回 `web/src/main.ts` 的 `defaultCfg` / `defaultHazardCfg`
- 仅允许本机请求

---

## 5. 关键配置与存储键

主要 LocalStorage 键：

- `swipe_debug_cfg_v2`：主物理调参
- `swipe_debug_default_cfg_v1`：主物理默认覆盖
- `swipe_hazard_cfg_v1`：障碍调参
- `swipe_hazard_default_cfg_v1`：障碍默认覆盖
- `swipe_jelly_cfg_v1`：果冻调参
- `swipe_jelly_layer_visibility_v1`：果冻图层可见性
- `swipe_best_meters_v1`：最高米数
- `swipe_tutorial_seen_v1`：新手引导状态

---

## 6. 扩展开发建议（正式开发向）

1. 继续拆分 `main.ts`
   - 建议拆到 `src/systems/*`（physics、camera、spawn、render、audio、ui）
2. 引入统一配置层
   - `src/config/defaults/*`，避免默认参数散落
3. 资源目录统一
   - `assets/audio`、`assets/images`、`assets/fx`，并建立资源清单
4. 逐步去掉 `// @ts-nocheck`
   - 先从低耦合模块开始补类型，最后回收到严格模式

---

## 7. 新同学快速上手路径

1. 先看 `web/index.html` + `web/src/main.ts`
2. 再看 `web/src/ball_visual.ts`（视觉）
3. 用 `jelly_preview` / `map_preview` 两个页面调参数
4. 确认参数后可通过 `dev_server.py` 回写默认值

这样可以在最短路径内理解玩法、渲染和调参流程，并开始功能迭代。
