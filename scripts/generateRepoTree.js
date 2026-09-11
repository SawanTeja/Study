import fs from 'fs';
import path from 'path';

function buildTree(dir, basePath = '') {
  const stats = fs.statSync(dir);
  if (stats.isDirectory()) {
    const children = fs.readdirSync(dir)
      .filter(name => !['node_modules', '.git', 'dist', '.env', '.DS_Store'].includes(name))
      .map(child => {
        return buildTree(path.join(dir, child), path.join(basePath, child));
      });
    return {
      name: path.basename(dir),
      type: 'directory',
      path: basePath,
      children: children.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'directory' ? -1 : 1;
      })
    };
  } else {
    return {
      name: path.basename(dir),
      type: 'file',
      path: basePath
    };
  }
}

const targetDir = path.resolve('public/repos/Forever');
const outputPath = path.resolve('public/repos/Forever/tree.json');

const tree = buildTree(targetDir, '');
fs.writeFileSync(outputPath, JSON.stringify(tree, null, 2));
console.log('Tree generated successfully at', outputPath);
