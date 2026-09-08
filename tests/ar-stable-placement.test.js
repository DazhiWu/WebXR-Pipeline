/** 稳定水平地面与原生锚点的静态回归检查。 */
const assert = require('assert');
const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

assert(html.includes("optionalFeatures: ['dom-overlay', 'anchors']"), 'AR 会话应请求可选 anchors 能力');
assert(html.includes('function updateStableGroundHit(hitPose, timestamp)'), '应在创建前采样稳定地面');
assert(html.includes('Math.abs(normal.y) < Math.cos(GROUND_MAX_TILT_RADIANS)'), '应拒绝非水平命中面');
assert(html.includes('STABLE_HIT_MIN_DURATION_MS'), '不应首帧自动放置');
assert(html.includes('async function createNativeAnchor(hit, hitPose, referenceSpace, frame)'), '应尝试创建原生锚点');
assert(html.includes('frame.getPose(xrAnchor.anchorSpace, referenceSpace)'), '应逐帧使用原生锚点姿态');
assert(html.includes('xrAnchor.delete();'), '会话结束时应释放原生锚点');

console.log('稳定 AR 放置回归检查通过');
