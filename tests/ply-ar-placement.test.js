/**
 * PLY AR 放置回归检查：局部坐标的 PLY 必须放在命中平面，
 * 不能因缺少远端元数据而应用 GPS 偏移并离开相机视野。
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync('index.html', 'utf8');
const config = fs.readFileSync('vite.config.js', 'utf8');
const ignoredModelFiles = new Set(
    fs.readFileSync('.gitignore', 'utf8')
        .split(/\r?\n/)
        .filter(line => line.startsWith('models/'))
        .map(line => path.basename(line))
);
const localModels = fs.readdirSync('models')
    .filter(file => /\.(ply|glb)$/i.test(file) && !ignoredModelFiles.has(file))
    .map(file => `models/${file}`)
    .sort();
const anchorStart = html.indexOf('async function createARAnchor');
const anchorEnd = html.indexOf('// ==================== 自定义轨道控制', anchorStart);
const anchorCode = html.slice(anchorStart, anchorEnd);

assert(anchorStart >= 0 && anchorEnd > anchorStart, '应能定位 AR 锚点创建逻辑');
assert(!anchorCode.includes('getModelLatLng('), 'PLY AR 放置不得依赖远端模型经纬度');
assert(!anchorCode.includes('geoToWorld('), 'PLY AR 放置不得应用 GPS 世界坐标偏移');
assert(anchorCode.includes('modelBasePosition = { x: 0, y: 0, z: 0 }'), 'PLY 应放在命中平面原点');
assert(!html.includes('models.wuzhizhii.com'), '模型列表不得依赖外域 PLY 资源');
assert(!html.includes('/api/model/metadata'), 'PLY 加载不得读取远端模型元数据');

const listedModels = [...html.matchAll(/data-model="(models\/[^"]+)"/g)]
    .map(match => match[1]);
assert.deepStrictEqual(
    [...new Set(listedModels)].sort(),
    localModels,
    '模型列表只能展示 models/ 中未被 .gitignore 忽略的本地模型'
);

for (const modelPath of localModels) {
    assert(config.includes(`fileName: '${modelPath}'`), `${modelPath} 应随生产构建发布`);
}

console.log('PLY AR 放置回归检查通过');
