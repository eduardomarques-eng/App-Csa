import fs from 'fs';
const files = [
  'src/App.tsx',
  'src/components/MapaIsopletas.tsx',
  'src/components/SmartSelectGroup.tsx',
  'src/components/UIComponents.tsx',
  'src/components/DetailedDiagrams.tsx',
  'src/components/SmartInputGroup.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/#141414/g, '#006874');
  fs.writeFileSync(file, content);
});
console.log('Done');
