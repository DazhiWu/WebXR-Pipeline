/** Exercise the actual AR split renderer without requiring an XR device. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const THREE = require('three');
const html = fs.readFileSync('index.html', 'utf8');
const start = html.indexOf('        function renderARSplitView()');
const end = html.indexOf('        function updateSplitView()', start);
const source = html.slice(start, end);

for (const ratio of [1, 2, 3]) {
    for (const split of [0.1, 0.5, 0.9]) {
        for (const fail of [false, true]) {
            let scissor = new THREE.Vector4(1, 2, 3, 4);
            let scissorTest = false;
            const draws = [];
            let clears = 0;
            const a = { visible: true };
            const b = { visible: true };
            const renderer = {
                autoClear: true,
                xr: { getCamera: () => ({ cameras: [{ viewport: new THREE.Vector4(12, 24, 1080, 1920) }] }) },
                getPixelRatio: () => ratio,
                getScissor: out => out.copy(scissor),
                getScissorTest: () => scissorTest,
                setScissorTest: value => { scissorTest = value; },
                setScissor: (...args) => { scissor = args[0]?.isVector4 ? args[0].clone() : new THREE.Vector4(...args); },
                clear: () => { assert.equal(scissorTest, false); clears++; },
                render: () => {
                    assert.equal(renderer.autoClear, false);
                    assert.equal(scissorTest, true);
                    draws.push({ a: a.visible, b: b.visible, rect: scissor.clone().multiplyScalar(ratio).toArray() });
                    if (fail) throw new Error('GPU failure');
                }
            };
            const ctx = vm.createContext({ THREE, renderer, dropInViewerA: a, dropInViewerB: b, splitPosition: split, scene: {}, camera: {} });
            vm.runInContext(source, ctx);
            if (fail) assert.throws(() => ctx.renderARSplitView(), /GPU failure/);
            else {
                ctx.renderARSplitView();
                const left = Math.round(1080 * split);
                assert.deepEqual(draws, [
                    { a: true, b: false, rect: [12, 24, left, 1920] },
                    { a: false, b: true, rect: [12 + left, 24, 1080 - left, 1920] }
                ]);
            }
            assert.equal(clears, 1);
            assert.equal(renderer.autoClear, true);
            assert.equal(scissorTest, false);
            assert.deepEqual(scissor.toArray(), [1, 2, 3, 4]);
            assert.equal(a.visible, true);
            assert.equal(b.visible, true);
        }
    }
}
// A stale single-model selection must not trigger a third load in comparison mode.
const anchorCode = html.slice(html.indexOf('async function createARAnchor'), html.indexOf('// ==================== 自定义轨道控制'));
assert.match(anchorCode, /if \(displayMode === 'single' && selectedModelPath\)/);
assert(!html.includes('function createSplitCanvasOverlay'));
console.log('PLY AR split rendering passed: clipping, pixel ratios, drag positions and failure recovery');

(async () => {
    const events = [];
    class Viewer extends THREE.Group {
        async addSplatScene(path, options) {
            events.push(path);
            options.onProgress(100);
            await Promise.resolve();
        }
    }
    const oldGroup = new THREE.Group();
    oldGroup.add(Object.assign(new THREE.Group(), {
        async dispose() {
            await Promise.resolve();
            events.push('disposed');
        }
    }));
    const scene = new THREE.Scene();
    scene.add(oldGroup);
    const context = vm.createContext({
        THREE: { ...THREE, WebGLRenderTarget: class { constructor() { throw new Error('AR must not allocate render targets'); } } },
        window: { 'Gaussian Splats 3D': { DropInViewer: Viewer, SceneRevealMode: { Instant: 0 } } },
        console,
        scene, arAnchor: null, dropInViewerA: oldGroup, dropInViewerB: null, dropInViewer: null,
        isARActive: true, splatLoaded: false,
        showGlbLoading() {}, hideGlbLoading() { events.push('hidden'); },
        cleanupSplitResources() {}, isMobileDevice: () => true,
        updateGlbProgress() {}, showTemporaryMessage() {},
        document: { getElementById: () => ({ textContent: '' }) }
    });
    const loadStart = html.indexOf('        async function loadDualModels(');
    const loadEnd = html.indexOf('        function createSplitLine()', loadStart);
    vm.runInContext(html.slice(loadStart, loadEnd), context);
    await context.loadDualModels('models/splat.ply', 'models/splat2.ply', scene);
    assert.deepEqual(events, ['disposed', 'models/splat.ply', 'models/splat2.ply', 'hidden']);
    assert.equal(context.splatLoaded, true);
    assert.equal(scene.children.length, 2);
    console.log('PLY pair loading passed: disposal before load, A/B sequence, no AR render targets');
})().catch(error => { console.error(error); process.exitCode = 1; });
