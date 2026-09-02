# WebAR 地下管网 Demo

一个基于 Three.js + 原生 WebXR + GPS 定位的多端兼容 WebAR 地下管网可视化系统。

## 功能特性

- ✅ **多端兼容**：支持 Android/iOS 现代浏览器、微信浏览器、Chrome、Edge、Safari
- ✅ **GPS 定位**：实时获取设备经纬度，自动更新定位信息
- ✅ **3D 管线可视化**：预设多组地下管网数据，自动经纬度转 3D 坐标
- ✅ **WebXR AR 模式**：真实地面检测与对齐，贴地不悬浮不穿地
- ✅ **半透明透视效果**：管线默认地下半透明显示
- ✅ **射线拾取交互**：点击管线弹窗展示详细信息
- ✅ **多类型管线**：给水（蓝）、排水（灰）、燃气（橙）
- ✅ **PLY 模型加载**：支持高斯泼溅 PLY 格式 3D 模型加载，AR/桌面双模式
- ✅ **GLB 模型加载**：支持标准 GLB 格式 3D 模型加载，含纹理、材质和动画支持
- ✅ **移动端适配**：自适应屏幕，禁止双击缩放，竖屏优化

## 技术栈

- **Three.js** (v0.160.0) - 3D 渲染引擎
- **原生 WebXR API** - AR 会话管理
- **原生 Geolocation API** - GPS 定位
- **纯前端** - 无需后端服务

## 快速开始

### 环境要求

- HTTPS 环境（WebXR 和定位 API 要求）
- 支持 ARCore/ARKit 的移动设备
- 支持 WebXR 的现代浏览器

### 本地开发

由于 WebXR 和定位 API 需要 HTTPS 环境，建议使用以下方式之一：

#### 方式一：使用 Vite 或其他支持 HTTPS 的开发服务器

```bash
# 简单的 HTTP 服务器（仅用于预览，AR 功能可能受限）
npx serve .
```

#### 方式二：使用自签名证书（推荐用于本地测试）

```bash
# 1. 生成自签名证书（需要 OpenSSL）
openssl req -x509 -newkey rsa:4096 -keyout localhost-key.pem -out localhost.pem -days 365 -nodes

# 2. 修改 package.json 中的 dev 脚本，添加 SSL 配置

# 3. 启动 HTTPS 服务器
npm run dev
```

### 项目结构

```
WebXR2/
├── index.html              # 主应用文件（包含所有 HTML/CSS/JS）
├── package.json            # 项目配置
├── vite.config.js          # Vite 构建配置
├── README.md               # 项目文档
├── tests/
│   ├── glb-loader.test.js      # GLB 模型加载器单元测试
│   └── glb-integration.test.js # GLB 模型加载集成测试
├── models/
│   ├── oblique.glb             # GLB 倾斜摄影模型
│   ├── Merged_modified.glb              # GLB 合并模型
│   ├── splat.ply               # PLY 高斯泼溅模型
│   ├── splat2.ply              # PLY 高斯泼溅模型
│   ├── living-room.ply         # PLY 室内场景模型
│   └── flowerpat.ply           # PLY 花园场景模型
├── libs/
│   └── gaussian-splats-3d.umd.cjs  # 高斯泼溅库
└── dist/                      # 构建输出目录
```

## 代码逻辑说明

### 1. GPS 定位模块 (`initGPS`, `handleLocationSuccess`)

- 使用 `navigator.geolocation` API 获取实时位置
- `getCurrentPosition` 获取初始位置
- `watchPosition` 持续监听位置更新
- 定位成功后自动生成以当前位置为原点的管网数据

### 2. 坐标转换模块 (`geoToWorld`)

- 简化的平面投影算法（适合小范围区域）
- 将经纬度坐标转换为 Three.js 世界坐标（米制）
- 公式基于地球半径和当前位置的纬度计算

### 3. Three.js 初始化模块 (`initThreeJS`)

- 创建场景、相机、渲染器
- 配置 WebXR 支持
- 添加光照系统（环境光 + 方向光）
- 初始化地面检测标记（reticle）

### 4. 管线模型生成 (`createPipelines`)

- 使用 `CatmullRomCurve3` 创建平滑曲线
- 使用 `TubeGeometry` 生成管状几何体
- 半透明 Phong 材质实现透视效果
- 添加球形连接节点增强可视化

### 5. WebXR AR 模块 (`initWebXR`, `startAR`)

- 检测 WebXR 和 AR 模式支持
- 请求 `immersive-ar` 会话
- 配置必要功能：`hit-test`（地面检测）、`local-floor`（地板参考系）
- 配置可选功能：`dom-overlay`（DOM 覆盖层）

### 6. 地面检测与锚点 (`render`, `createARAnchor`)

- 在渲染循环中持续执行 hit test
- 检测到地面时显示环形标记
- 自动创建 AR 锚点，将管网模型锚定到真实地面
- 锚点确保模型在设备移动时保持位置稳定

### 7. 射线拾取交互 (`onPointerDown`, `showPipelineDetail`)

- `Raycaster` 检测点击/触摸位置与管线的相交
- 点击后弹出详情模态框
- 显示管线类型、管径、材质、埋深、权属、起止坐标等

### 8. GLB 模型加载模块

#### 功能概述
GLB 模型加载模块支持标准 GLB（GLTF Binary）格式文件的完整加载，与 PLY 模块共享统一的模型选择、加载状态反馈和变换控制界面。

#### 核心函数

| 函数 | 说明 |
|------|------|
| `loadGlbModel(modelPath, parentGroup, options)` | 异步加载 GLB 模型，支持进度回调 |
| `cleanupGlbModel()` | 释放模型几何体、材质、纹理等 GPU 资源 |
| `setupGlbAnimations(animations, root)` | 初始化动画混合器并播放首个动画 |
| `toggleGlbAnimation()` | 切换动画播放/暂停状态 |
| `disposeMaterial(material)` | 递归释放材质关联的所有纹理贴图 |

#### 加载状态管理
- **加载中**：显示旋转动画 + 进度条（基于 GLTFLoader 的 onProgress 回调）
- **加载完成**：自动居中模型、显示变换面板、如有动画则显示动画面板
- **加载失败**：显示错误提示信息，保持页面可交互

#### 动画支持
- 使用 `THREE.AnimationMixer` 管理骨骼动画/顶点动画
- 底部浮动控制面板提供播放/暂停切换
- 实时显示当前动画时间和名称
- 在渲染循环中通过 `glbClock.getDelta()` 驱动动画更新

#### 资源清理
- `cleanupGlbModel()` 遍历模型树，释放所有 `BufferGeometry` 和 `Material`
- 支持释放所有常见纹理贴图类型（map, normalMap, roughnessMap, metalnessMap, aoMap, emissiveMap, alphaMap, bumpMap, displacementMap, envMap, lightMap）
- 停止并释放动画混合器 `AnimationMixer`
- 从场景或 AR 锚点中移除模型组

#### 性能优化
- 模型异步加载，不阻塞主线程渲染
- 纹理渲染优化：设置 `envMap=null`，使用场景光照而非环境贴图
- 模型自动居中，保证初始位置合理
- 加载完成后通过 `needsUpdate=true` 刷新材质

#### 使用方式
1. 在主界面选择「GLB模型加载」模块
2. 选择「桌面测试模式」或「AR模型加载」
3. 从模型列表中选择 GLB 文件
4. 点击「加载模型」按钮
5. 加载完成后可通过变换面板调整位置/旋转/缩放
6. 如模型包含动画，底部动画面板将自动出现

#### 注意事项
- 确保 GLB 文件路径正确，支持本地和远程 URL
- 大尺寸模型建议使用 Draco 压缩的 GLB 格式
- AR 模式下需先检测到地面才能放置模型
- 切换模型时会自动清理前一个模型的所有资源

## PLY 移动端优化示例

`models/test_model.ply` 原始文件包含 4,910,038 个 Gaussian、大小约 79.9 MB。项目保留原文件作为高清源，并生成了移动端版本：

| 文件 | Gaussian 数量 | 文件大小 | 用途 |
|------|---------------:|---------:|------|
| `models/test_model.ply` | 4,910,038 | 79.9 MB | 原始高清源，不直接提供给手机加载 |
| `models/test_model.mobile.compressed.ply` | 500,000 | 约 7.8 MB | 手机 AR 推荐加载 |

移动端版本使用自适应误差降点，并按 Morton 空间顺序重新排列后输出为 packed PLY。可通过以下命令复现：

```bash
npx --yes @playcanvas/splat-transform@3.3.3 -w \
  models/test_model.ply \
  --filter-nan \
  --decimate-adaptive 500000 \
  /tmp/test_model.mobile.ply \
  --memory --no-tty

npx --yes @playcanvas/splat-transform@3.3.3 -w \
  /tmp/test_model.mobile.ply \
  --morton-order \
  models/test_model.mobile.compressed.ply \
  --memory --no-tty
```

加载器对 PLY 启用了渐进显示、整数排序、半精度协方差纹理和中间数据释放。移动设备还会限制像素比和 XR framebuffer scale。新的大模型应先制作类似的移动端 LOD，不要只依赖运行时压缩。

## 部署步骤

### 1. 准备 HTTPS 服务器

WebXR 和定位 API 必须在 HTTPS 环境下运行（localhost 除外）。

### 2. 部署文件

只需部署 `index.html` 到服务器即可，无需构建打包。

### 3. 验证部署

使用支持 WebXR 的移动设备访问部署后的 HTTPS 地址。

## 支持的浏览器与设备

### Android
- Chrome 81+
- Edge 81+
- 微信浏览器（需设备支持 ARCore）

### iOS
- Safari 16.4+
- Chrome iOS 16.4+
- 需要 iOS 16.4+ 且设备支持 ARKit

## AR 使用注意事项

### 使用前准备
1. **确保设备支持**：确认手机支持 ARCore (Android) 或 ARKit (iOS)
2. **良好的光线**：在光线充足的环境下使用，避免过暗或强光直射
3. **纹理丰富的地面**：选择有明显纹理的地面（如地砖、地毯）便于检测
4. **授予权限**：允许相机和定位权限

### 使用流程
1. 打开页面，等待 GPS 定位成功
2. 点击「启动AR」按钮
3. 移动手机缓慢扫描周围地面
4. 检测到地面后自动放置管网模型
5. 点击任意管线查看详情信息

### 常见问题
- **定位失败**：确保在室外或窗边，GPS 信号良好
- **AR 无法启动**：检查浏览器是否支持 WebXR，是否在 HTTPS 环境
- **模型漂移**：确保地面纹理丰富，重新扫描地面
- **看不到管线**：管线在地下，从上方往下看可能更清晰

## 自定义配置

### 修改预设管线数据

编辑 `index.html` 中的 `PIPELINE_DATA` 数组：

```javascript
const PIPELINE_DATA = [
    {
        id: 1,
        type: '给水',        // 管线类型
        color: '#3b82f6',    // 颜色
        diameter: 300,       // 管径（mm）
        material: 'PE管',    // 材质
        depth: 1.5,          // 埋深（米）
        owner: '市水务集团', // 权属单位
        points: [            // 经纬度坐标点（相对偏移）
            { lat: 0, lng: 0 },
            { lat: 0.0001, lng: 0.00015 },
            // ... 更多点
        ]
    },
    // ... 更多管线
];
```

### 修改视觉效果

- 管线透明度：修改 `opacity` 属性（0-1）
- 管线粗细：调整 `diameter` 参数或缩放比例
- 管线颜色：修改 `color` 属性

## 许可证

MIT
