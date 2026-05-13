# Code Wiki - 皮筋弹射球（Web 版）

## 1. 项目简介

这是一个竖屏 H5 小游戏原型，核心玩法是：

- 玩家拖拽小球蓄力
- 松手后断绳弹射
- 小球飞行中可挂到新的锚点（钉子）
- 挂上后受弹簧力 + 重力影响，形成摆动

项目目标是快速验证“弹射 + 挂点摆动”手感，便于后续扩展打靶、得分、关卡等玩法。

---

## 2. 项目结构

当前项目非常轻量，由 3 个核心文件组成：

```text
swipe/
├── index.html     # 页面结构、HUD、调试面板容器
├── style.css      # 页面与调试面板样式
└── game.js        # 核心游戏逻辑（物理、输入、渲染、参数调试）
```

---

## 3. 运行方式

在项目目录启动本地静态服务：

```bash
python3 -m http.server 8000
```

浏览器打开：

```text
http://localhost:8000
```

> 注意：命令前不要加 `-`，否则 shell 可能报 `cd: too many arguments`。

---

## 4. 核心逻辑说明（game.js）

### 4.1 游戏状态

`world.state` 有 3 种：

- `aiming`：瞄准/拖拽蓄力中
- `launched`：断绳自由飞行
- `tethered`：挂在某锚点上，受弹簧力摆动

### 4.2 关键对象

- `cfg`：所有可调参数（重力、弹簧、碰撞、冷却等）
- `world`：运行时状态（球位置速度、锚点、拖拽状态、轨迹等）
- `anchors[]`：锚点数组，`activeAnchorIndex` 表示当前挂点

### 4.3 主要流程

1. 玩家按下并拖拽球（`onPointerDown/Move`）
2. 松手触发 `launchBall()`，进入 `launched`
3. 飞行中 `checkAnchorHook()` 检测是否命中新锚点
4. 命中则 `hookToAnchor()`，进入 `tethered`
5. `applyTetheredPhysics()` 用弹簧力 + 阻尼 + 重力更新
6. 继续可再次拖拽发射，形成连锁挂点弹射

---

## 5. 每个脚本/文件的作用

## 5.1 `index.html`

- 顶部 HUD（标题、提示文案、重置按钮）
- `canvas#gameCanvas` 游戏画布
- 右侧调试面板容器（参数滑杆、保存/恢复按钮、状态提示）
- 引入 `style.css` 与 `game.js`

## 5.2 `style.css`

- 基础全屏布局与字体
- HUD 样式
- 右侧 Debug Panel 样式：
  - 面板定位、滚动、按钮、滑杆行布局
  - 半透明 + 背景模糊视觉风格

## 5.3 `game.js`

- 初始化 Canvas 与世界数据
- 动态创建锚点布局（`createAnchors`）
- 拖拽输入处理（Pointer Events）
- 两套物理更新：
  - 自由飞行（重力+阻力）
  - 挂绳摆动（弹簧力+阻尼+重力）
- 锚点挂载判定与切点冷却
- 边界碰撞处理
- 轨迹、锚点、绳子、闪光效果绘制
- 调试面板构建、参数实时生效、本地存储读写

---

## 6. 参数调试系统

调试面板支持：

- 滑杆实时调参（运行中立即生效）
- “保存参数”写入 `localStorage`
- “恢复默认”回到代码默认配置

本地存储 key：

- `swipe_debug_cfg_v1`

当前暴露参数（全部可调）：

- `gravity`
- `airDrag`
- `restitution`
- `wallFriction`
- `ballRadius`
- `maxStretch`
- `restLength`
- `launchPower`
- `hookRadius`
- `springK`
- `springDamping`
- `stopSpeed`
- `autoResetDelay`
- `breakFlashDuration`
- `rehookCooldown`

---

## 7. 手感调参建议（经验值）

- 想“更重”：增大 `gravity`
- 想“摆更久”：减小 `springDamping`，并把 `airDrag` 调近 `1`
- 想“拉得更远”：增大 `maxStretch`
- 想“发射更猛”：增大 `launchPower`
- 想“更容易挂点”：增大 `hookRadius`

---

## 8. 已知机制与注意点

- 当前锚点是“范围挂载”判定，不是实体碰撞体（不会把球物理顶开）
- 发射后允许再次挂回同一锚点（受 `rehookCooldown` 控制）
- `resize()` 时会重建锚点位置，`aiming` 且未拖拽时会重置球

---

## 9. 推荐后续迭代

1. 加入目标物与得分系统
2. 加入关卡与锚点生成规则
3. 提供参数导入/导出 JSON
4. 增加音效/震动反馈和命中特效
5. 把“挂点判定”和“实体碰撞”做成可切换模式
