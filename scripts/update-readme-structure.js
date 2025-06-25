#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

const excludePattern = 'test|cypress|node_modules'

// Generate directory structure
const structure = execSync(`tree -d --gitignore -I "${excludePattern}"`, { encoding: 'utf8' });

// Read current README
const readme = fs.readFileSync('README.md', 'utf8');

// Find the project structure section and replace it
const startMarker = '## Project Structure';
const endMarker = '## Getting Started';

const startIndex = readme.indexOf(startMarker);
const endIndex = readme.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error('Could not find project structure section markers');
  process.exit(1);
}

const newStructureSection = `## Project Structure

\`\`\`
${structure.trim()}
\`\`\`

`;

const updatedReadme = 
  readme.substring(0, startIndex) + 
  newStructureSection + 
  readme.substring(endIndex);

fs.writeFileSync('README.md', updatedReadme);
console.log('README.md project structure updated');