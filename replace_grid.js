const fs = require('fs');
let code = fs.readFileSync('src/components/DegreeChordGrid.tsx', 'utf8');

// 1. Update Interface
code = code.replace(
  /hasHalfDimModifier\?: boolean;/,
  `hasHalfDimModifier?: boolean;\n  slashBassDegree?: number | null;`
);

// 2. Add prop
code = code.replace(
  /hasHalfDimModifier = false,\n  onPlayDegreeStart/,
  `hasHalfDimModifier = false,\n  slashBassDegree = null,\n  onPlayDegreeStart`
);

// 3. Move degMap before renderDegreeCard
code = code.replace(
  /  const renderDegreeCard = \(degree: DegreeInfo\) => \{/,
  `  // Map degrees by number for numpad layout
  const degMap = new Map<number, DegreeInfo>();
  degrees.forEach((d) => degMap.set(d.degreeNumber, d));

  const renderDegreeCard = (degree: DegreeInfo) => {`
);

// 4. Remove old degMap
code = code.replace(
  /  \/\/ Map degrees by number for numpad layout\n  const degMap = new Map<number, DegreeInfo>\(\);\n  degrees\.forEach\(\(d\) => degMap\.set\(d\.degreeNumber, d\)\);\n\n  return \(/,
  `  return (`
);

// 5. Append bass note
code = code.replace(
  /    if \(hasNinthModifier\) \{\n      currentDisplayChord = degree\.ninthChordName;\n    \} else if \(hasSeventhModifier \|\| hasM7Modifier \|\| hasSixthModifier \|\| hasHalfDimModifier\) \{\n      currentDisplayChord = degree\.seventhChordName;\n    \}/,
  `    if (hasNinthModifier) {
      currentDisplayChord = degree.ninthChordName;
    } else if (hasSeventhModifier || hasM7Modifier || hasSixthModifier || hasHalfDimModifier) {
      currentDisplayChord = degree.seventhChordName;
    }

    if (slashBassDegree !== null) {
      const bassDegreeInfo = degMap.get(slashBassDegree);
      if (bassDegreeInfo) {
        currentDisplayChord = \`\${currentDisplayChord}/\${bassDegreeInfo.rootNote}\`;
      }
    }`
);

fs.writeFileSync('src/components/DegreeChordGrid.tsx', code);
