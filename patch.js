const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const replacement = `    const handleBlur = () => {
      setSlashBassDegree(null);
      stateRef.current.slashBassDegree = null;
      activeKeysSet.clear();
      
      setHasSeventhModifier(false);
      setHasNinthModifier(false);
      setHasSwapModifier(false);
      setHasDimModifier(false);
      setHasSus4Modifier(false);
      setHasM7Modifier(false);
      setHasAugModifier(false);
      setHasFlatModifier(false);
      setHasSixthModifier(false);
      setHasHalfDimModifier(false);
      
      triggerStopChord();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };`;

code = code.replace(/    window\.addEventListener\('keydown', handleKeyDown\);\n    window\.addEventListener\('keyup', handleKeyUp\);\n\n    return \(\) => \{\n      window\.removeEventListener\('keydown', handleKeyDown\);\n      window\.removeEventListener\('keyup', handleKeyUp\);\n    \};/, replacement);

fs.writeFileSync('src/App.tsx', code);
