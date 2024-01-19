const compMap = {
  '0':   ['0', '101010'], '1':   ['0', '111111'],
  '-1':  ['0', '111010'], 'D':   ['0', '001100'],
  'A':   ['0', '110000'], '!D':  ['0', '001101'],
  '!A':  ['0', '110001'], '-D':  ['0', '001111'],
  '-A':  ['0', '110011'], 'D+1': ['0', '011111'],
  'A+1': ['0', '110111'], 'D-1': ['0', '001110'],
  'A-1': ['0', '110010'], 'D+A': ['0', '000010'],
  'D-A': ['0', '010011'], 'A-D': ['0', '000111'],
  'D&A': ['0', '000000'], 'D|A': ['0', '010101'],
  'M':   ['1', '110000'], '!M':  ['1', '110001'],
  '-M':  ['1', '110011'], 'M+1': ['1', '110111'],
  'M-1': ['1', '110010'], 'D+M': ['1', '000010'],
  'D-M': ['1', '010011'], 'M-D': ['1', '000111'],
  'D&M': ['1', '000000'], 'D|M': ['1', '010101'],
}

const jumpMap = {
  '':    '000',
  'JGT': '001',
  'JEQ': '010',
  'JGE': '011',
  'JLT': '100',
  'JNE': '101',
  'JLE': '110',
  'JMP': '111',
};

const destMap = {
  '':    '000',
  'M':   '001',
  'D':   '010',
  'MD':  '011',
  'A':   '100',
  'AM':  '101',
  'AD':  '110',
  'AMD': '111',
};

module.exports = (lines, symbols) => {
  const parseLine = (line) => {
    if (line.startsWith('@')) { // A-instruction
      const value = line.slice(1);
      const isNumber = !Number.isNaN(Number(value));
      return (
        isNumber
          ? `${Number(value).toString(2)}`
          : `${symbols.getAddress(value).toString(2)}`
        )
        .toString(2)
        .padStart(16, '0');
    } else if (line.startsWith('(')) { // label
      return false; // filtered out later
    } else { // C-instruction
      const { comp, dest, jmp } = (() => {
        if (line.includes('=')) { // dest=comp
          const [destStr, compStr] = line.split('=');
          return {
            comp: compMap[compStr],
            dest: destMap[destStr],
            jmp: '000',
          };
        } else if (line.includes(';')) { // comp;jmp
          const [compStr, jmpStr] = line.split(';');
          return {
            comp: compMap[compStr],
            jmp: jumpMap[jmpStr],
            dest: '000',
          };
        } else {
          console.error(line);
          throw new Error('Invalid line');
        }
      })();

      if (!comp || !dest || !jmp) {
        throw new Error(`Invalid line: ${line}`);
      }

      const [a, c] = comp;
      return `111${a}${c}${dest}${jmp}`;
    }
  };

  return lines
    .map(parseLine)
    .filter((line) => line !== false) // filter out labels
    .join('\n')
}
