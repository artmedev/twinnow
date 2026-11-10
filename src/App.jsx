import { useState, useEffect } from 'react';

const api = window.api;
const byName = (a, b) => a[0].localeCompare(b[0], undefined, { numeric: true });

function buildTree(root, dirs) {
  const t = { kids: {}, dir: root, n: 0 };
  for (const { dir, n } of dirs) {
    let node = t, p = root.replace(/[\\/]$/, '');
    for (const part of dir.slice(root.length).split(/[\\/]/).filter(Boolean)) {
      p += '\\' + part;
      node = node.kids[part] ||= { kids: {}, dir: p, n: 0 };
    }
    node.n = n;
  }
  return t;
}

function TreeNode({ name, node, curDir, open }) {
  const kids = Object.entries(node.kids).sort(byName);
  const label = (
    <div className={'node' + (node.dir === curDir ? ' sel' : '')}
      onClick={e => { if (node.n) { e.preventDefault(); open(node.dir); } }}>
      {name}{node.n ? ` (${node.n})` : ''}
    </div>
  );
  if (!kids.length) return label;
  return (
    <details open>
      <summary>{label}</summary>
      {kids.map(([k, v]) => <TreeNode key={k} name={k} node={v} curDir={curDir} open={open} />)}
    </details>
  );
}

export default function App() {
  const [root, setRoot] = useState(null);
  const [tree, setTree] = useState(null);
  const [status, setStatus] = useState('');
  const [curDir, setCurDir] = useState(null);

  useEffect(() => { api.onScan(n => setStatus(`Сканирование… папок с фото: ${n}`)); }, []);

  const pick = async () => {
    const d = await api.pickDir(); if (!d) return;
    setRoot(d); setTree(null); setCurDir(null);
    const dirs = await api.scan(d);
    setStatus(`Папок с фото: ${dirs.length}`);
    setTree(buildTree(d, dirs));
  };

  return (
    <div id="app">
      <div id="bar">
        <button onClick={pick}>Выбрать папку / диск…</button>
        <span>{status}</span>
      </div>
      <div id="main">
        <div id="tree">{tree && <TreeNode name={root} node={tree} curDir={curDir} open={setCurDir} />}</div>
        <div id="right"></div>
      </div>
    </div>
  );
}
