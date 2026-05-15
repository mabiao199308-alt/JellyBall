# Code Wiki - 皮筋弹射球

## 1. 项目简介

这是一个竖屏 H5 小游戏原型：

- 玩家拖拽小球蓄力
- 松手后弹射上升
- 飞行中可挂到新的钉子
- 目标是不断向上，刷新最高米数

当前项目重点是：

- 弹射与挂钩手感
- 小球果冻形变表现
- 死亡炸开特效
- 运行时调参

---

## 2. 当前项目结构

```text
swipe_2/
├── index.html        # 页面结构：游戏画布、米数 HUD、FPS、调试面板
├── style.css         # 页面与调试面板样式
├── game.js           # 核心游戏逻辑、物理、输入、渲染、调参面板
├── ball_visual.js    # 小球视觉与果冻绘制
├── death_fx.js       # 死亡炸开特效默认配置
├── ball.png          # 小球参考素材/资源图
├── .gitignore        # Git 忽略规则
└── Code_Wiki.md      # 本说明文档
```

当前仓库里已经**没有**果冻实验室相关文件。

---

## 3. 运行方式

这是一个纯前端静态页面项目，直接开本地静态服务即可。

可使用任意空闲端口，下面只是示例：

```bash
python3 -m http.server 8000
```

浏览器打开对应端口地址即可，例如：

```text
http://localhost:8000
```

---

## 4. 页面组成

### 游戏区

- 中间是手机比例容器 `#gameShell`
- 内部只有一个 `canvas#gameCanvas`
- 顶部 HUD 只显示一个大号米数：`米数：X.X`
- 左上角有 FPS 显示

### 调试面板

右侧有调试面板，可实时调物理参数：

- 显示全部 / 隐藏高级
- 保存参数
- 恢复默认

这些参数会直接影响手感，不需要重启游戏。

---

## 5. 核心状态与流程

### 运行状态

`world.state` 主要有这些值：

- `aiming`：瞄准 / 拖拽中
- `launched`：发射后自由飞行
- `tethered`：挂到钉子后摆动
- `dying`：死亡特效播放中
- `gameover`：本局结束

### 一局的主要流程

1. 初始时球挂在底部起始钉子下方
2. 玩家按住球拖拽，进入瞄准态
3. 松手后按拖拽反方向发射
4. 飞行中命中新钉子后切到挂绳摆动态
5. 不断往上挂钉子，米数持续上升
6. 掉出底部安全区域后触发死亡特效并结算

---

## 6. 每个脚本 / 文件的作用

## 6.1 `index.html`

职责：页面骨架。

包含：

- 游戏容器 `#gameShell`
- 顶部米数文本 `#meterDisplay`
- FPS 文本 `#fpsDisplay`
- 画布 `#gameCanvas`
- 调试面板及按钮容器
- 引入顺序：
  1. `ball_visual.js`
  2. `death_fx.js`
  3. `game.js`

说明：

- `ball_visual.js` 和 `death_fx.js` 提供默认配置与绘制/配置模块
- `game.js` 依赖它们，因此放在最后加载

## 6.2 `style.css`

职责：页面视觉布局。

主要内容：

- 全屏深色背景
- 中央竖屏手机壳样式
- 顶部米数 HUD 样式
- FPS 浮层样式
- 右侧调试面板样式

特点：

- `#gameCanvas` 占满游戏容器
- HUD 和 FPS 都是绝对定位浮层
- 调试面板固定在右侧，不参与游戏画面渲染

## 6.3 `ball_visual.js`

职责：绘制小球外观。

主要内容：

- `defaultBallVisualCfg`：小球视觉默认参数
- `getVisualRadius()`：按基础半径算视觉半径
- `drawJellyBodyPath()`：果冻球主体路径
- `drawJellyBall()`：完整绘制小球

当前小球绘制包含：

- 主体渐变
- 描边
- 高光与内部斑块
- 气泡
- 眼睛、瞳孔、高光点

和游戏逻辑的关系：

- `game.js` 负责传入位置、角度、速度、眼神方向、形变量
- `ball_visual.js` 只负责把这些参数画出来

## 6.4 `death_fx.js`

职责：提供死亡炸开特效默认配置。

主要内容：

- `defaultDeathFxCfg`：死亡特效参数默认值
- `resolveDeathFxCfg()`：对配置做整理与范围限制

注意：

- 这里不负责真正渲染
- 真正的死亡粒子生成、更新、绘制都在 `game.js`

## 6.5 `game.js`

职责：项目核心入口，负责几乎所有运行时逻辑。

主要模块：

- Canvas 初始化
- 调试面板构建与同步
- 世界状态 `world`
- 锚点生成与回收
- Pointer 输入
- 发射逻辑
- 挂钩逻辑
- 自由飞行物理
- 挂绳摆动物理
- 相机跟随
- 米数统计
- FPS 统计
- 死亡特效
- 全部画面渲染

你改玩法时，最常动的就是这个文件。

## 6.6 `ball.png`

职责：参考素材图。

当前不参与主逻辑执行，但作为资源文件保留在仓库里。

## 6.7 `.gitignore`

职责：避免把缓存和系统垃圾文件提交到仓库。

当前忽略：

- `__pycache__/`
- `*.pyc`
- `.DS_Store`

---

## 7. 关键配置与本地存储

### 游戏参数

`game.js` 中的 `defaultCfg` 是物理和镜头默认配置。

调试面板修改后，点击“保存参数”会写入：

- `swipe_debug_cfg_v2`

### 最高米数

最高记录会写入：

- `swipe_best_meters_v1`

---

## 8. 小球视觉与果冻逻辑

小球外观不是直接在 `game.js` 里画圆，而是：

1. `game.js` 计算：
   - 位置
   - 角度
   - 速度
   - 眼神方向
   - 果冻形变强度
2. 把这些值传给 `window.BallVisual.drawJellyBall(...)`
3. `ball_visual.js` 根据这些值生成最终外观

当前果冻逻辑特点：

- 静止时尽量恢复稳定
- 发射、挂钩、碰撞时会注入形变能量
- 随时间衰减

---

## 9. 死亡特效逻辑

死亡后不是立即结束，而是：

1. 进入 `dying`
2. 生成果汁爆裂粒子和污渍
3. 粒子更新与落地生成污渍
4. 特效播放完后进入 `gameover`

配置来源：

- 默认值在 `death_fx.js`
- 使用逻辑在 `game.js`

---

## 10. 对新开发者最重要的入口

如果你要继续开发，建议按这个顺序看：

1. `index.html`：了解页面结构
2. `game.js` 顶部常量和 `defaultCfg`：了解参数系统
3. `world` 状态对象：了解运行态数据
4. `launchBall()` / `hookToAnchor()` / `applyTetheredPhysics()`：了解核心玩法
5. `drawBall()`、`drawRubberBand()`、`drawDeathFx()`：了解视觉输出
6. `ball_visual.js`：改小球外观
7. `death_fx.js`：改死亡特效默认配置

---

## 11. 当前维护建议

- 想改手感：优先看 `game.js` 的 `defaultCfg`
- 想改小球样子：看 `ball_visual.js`
- 想改死亡炸开表现：看 `death_fx.js` + `game.js`
- 想改界面排版：看 `index.html` + `style.css`

如果后面继续加功能，建议优先补：

- README
- 更完整的游戏结束 UI
- 音效 / 震动反馈
- 关卡或程序化难度曲线
