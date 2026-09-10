/** 执行实际渲染逻辑，模拟快速转动后的追踪丢失与恢复。 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync('index.html', 'utf8');
function extract(name) {
    const start = html.indexOf(`        function ${name}(`);
    const end = html.indexOf('\n        }', start) + '\n        }'.length;
    return html.slice(start, end);
}
let viewerPose = { emulatedPosition: false };
let anchorPose = { transform: { matrix: [1] } };
let poseUpdates = 0;
const anchor = { visible: true, updateMatrixWorld() {} };
const context = vm.createContext({
    renderer: { xr: { getReferenceSpace: () => ({}), getSession: () => ({}) }, render() {} },
    hitTestSourceRequested: true, hitTestSource: null, arAnchor: anchor,
    xrAnchor: { anchorSpace: {} }, isCreatingArAnchor: false,
    reticle: { visible: true }, stableHitSamples: [1, 2],
    trackingInterrupted: false, instructionsBeforeTrackingLoss: null,
    instructions: { textContent: 'ready' }, scene: {}, camera: {},
    displayMode: 'single', glbMixer: null,
    setObjectPoseFromXRPose() { poseUpdates++; }
});
vm.runInContext(['render', 'updateNativeAnchorPose', 'updateARTrackingStatus'].map(extract).join('\n'), context);
const frame = { getViewerPose: () => viewerPose, getPose: () => anchorPose };
context.render(0, frame);
assert.equal(anchor.visible, true);
assert.equal(poseUpdates, 1);
for (const missing of [null, { emulatedPosition: true }]) {
    viewerPose = missing;
    context.render(16, frame);
    assert.equal(anchor.visible, false);
    assert.equal(poseUpdates, 1);
    assert.equal(context.stableHitSamples.length, 0);
}
viewerPose = { emulatedPosition: false };
anchorPose = null;
context.render(32, frame);
assert.equal(anchor.visible, false);
anchorPose = { transform: { matrix: [1] } };
context.render(48, frame);
assert.equal(anchor.visible, true);
assert.equal(context.instructions.textContent, 'ready');
assert.equal(poseUpdates, 2);
// 无 anchors 扩展：仅用真实 6DoF 姿态，保留放置时的固定变换。
context.xrAnchor = null;
context.render(64, frame);
assert.equal(anchor.visible, true);
assert.equal(poseUpdates, 2);
viewerPose = null;
context.render(80, frame);
assert.equal(anchor.visible, false);
console.log('AR tracking loss/recovery tests passed');
