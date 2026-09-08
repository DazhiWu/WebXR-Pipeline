/** RTK 优先、手机定位回退的静态回归检查。 */
const assert = require('assert');
const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const config = fs.readFileSync('rtk-config.js', 'utf8');
const viteConfig = fs.readFileSync('vite.config.js', 'utf8');

assert(html.includes('<script src="rtk-config.js"></script>'), '页面应在主逻辑前加载 RTK 配置');
assert(html.includes('async function requestPreferredLocation()'), '应存在 RTK 优先定位入口');
assert(html.includes('const fix = await requestRtkFix();'), '应先请求 RTK 定位');
assert(html.includes("startPhoneLocation(`RTK不可用：${error.message}`)"), 'RTK 不可用时应回退手机定位');
assert(html.includes("config.requireFixedSolution && !isFixed"), '默认不得接受非固定 RTK 解');
assert(html.includes('accuracy > config.maxAccuracyMeters'), '应拒绝精度不达标的 RTK 解');
assert(html.includes("applyLocationFix(fix, 'rtk'"), 'RTK 成功结果应标识为 RTK 来源');
assert(html.includes("applyLocationFix(fix, 'phone'"), '手机结果应标识为手机来源');
assert(config.includes("endpoint: ''"), '默认 RTK 端点必须保持未配置，避免误请求');
assert(viteConfig.includes("fileName: 'rtk-config.js'"), '生产构建应发布 RTK 配置文件');

console.log('RTK 优先定位回归检查通过');
