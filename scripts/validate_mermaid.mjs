import fs from 'fs';
import path from 'path';

const dp = await import('dompurify');
dp.default.sanitize = (s) => s;
const mermaid = (await import('mermaid')).default;

mermaid.initialize({
  startOnLoad: false,
  securityLevel: 'loose',
});

const sanitizeMermaidChart = (chartText) => {
  if (!chartText) return '';
  return chartText.replace(/\|([^|\n]+)\|/g, (_, label) => {
    const sanitized = label.replace(/\(/g, '#40;').replace(/\)/g, '#41;');
    return `|${sanitized}|`;
  });
};

const directories = [
  './public/content/Projects/EMPLO/frontend',
  './public/content/Projects/EMPLO/backend',
  './public/content/Projects/Plannify/frontend',
  './public/content/Projects/Plannify/backend',
  './public/content/Projects/FluxDrop',
];

async function testDiagrams() {
  let totalDiagrams = 0;
  let failedDiagrams = 0;

  for (const dir of directories) {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
    for (const file of files) {
      const filePath = path.join(dir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      const regex = /```mermaid([\s\S]*?)```/g;
      let match;
      let diagramIndex = 0;

      while ((match = regex.exec(content)) !== null) {
        diagramIndex++;
        totalDiagrams++;
        const chart = match[1].trim();
        const sanitized = sanitizeMermaidChart(chart);

        try {
          await mermaid.parse(sanitized);
          console.log(`[PASS] ${file} - diagram #${diagramIndex}`);
        } catch (err) {
          failedDiagrams++;
          console.error(`\n[FAIL] ${file} - diagram #${diagramIndex}:`);
          console.error(`Error: ${err.message || err}`);
          console.error('--- Diagram content ---');
          console.error(chart);
          console.error('-----------------------\n');
        }
      }
    }
  }

  console.log(`\nValidation complete: ${totalDiagrams - failedDiagrams}/${totalDiagrams} passed. ${failedDiagrams} failed.`);
}

testDiagrams();
