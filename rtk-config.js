/*
 * 现场 RTK 配置（会原样发布到浏览器，严禁填写 NTRIP 密码、服务端密钥等凭据）。
 *
 * RTK 网关应返回下列 JSON 之一：
 * { "latitude": 27.967431, "longitude": 120.667297,
 *   "horizontalAccuracy": 0.02, "fixQuality": "fixed", "altitude": 12.34 }
 * 或 { "position": { "lat": 27.967431, "lng": 120.667297,
 *                     "accuracy": 0.02, "fixType": "RTK_FIXED" } }
 *
 * 网关必须允许本页面来源的 CORS 请求，并在服务端完成设备认证。
 */
window.RTK_CONFIG = {
    // 例如: 'https://rtk-gateway.example.com/api/position'
    endpoint: '',
    timeoutMs: 5000,
    pollIntervalMs: 5000,
    maxAccuracyMeters: 0.1,
    requireFixedSolution: true,
    headers: {}
};

// 如 RTK 接收机经 Web Bluetooth/原生壳接入，可改为实现此异步函数。
// window.getRtkPosition = async () => ({
//     latitude: 27.967431,
//     longitude: 120.667297,
//     horizontalAccuracy: 0.02,
//     fixQuality: 'fixed'
// });
