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
├── index.html          # 主应用文件（包含所有 HTML/CSS/JS）
├── package.json        # 项目配置
└── README.md           # 项目文档
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
