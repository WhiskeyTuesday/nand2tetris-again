const labels = [];

const table = new Map([
  ['SP', 0],   ['LCL', 1],  ['ARG', 2],  ['THIS', 3],
  ['THAT', 4],

  ['R0', 0],   ['R1', 1],   ['R2', 2],   ['R3', 3],
  ['R4', 4],   ['R5', 5],   ['R6', 6],   ['R7', 7],
  ['R8', 8],   ['R9', 9],   ['R10', 10], ['R11', 11],
  ['R12', 12], ['R13', 13], ['R14', 14], ['R15', 15],
]);

let pointer = 16;

const set = (str) => {
  table.set(str, pointer);
  pointer += 1;
}

module.exports = {
  init: (lines) => {
    lines.forEach((line, idx) => {
      if (line.startsWith('(')) {
        const label = line.slice(1, -1);
        labels.push(label);
        const address = idx + 1 - labels.length;
        table.set(label, address);
      }
    });
  },

  getAddress: (symbolString) => {
    if (table.has(symbolString)) {
      return table.get(symbolString);
    } else {
      set(symbolString);
      return table.get(symbolString);
    }
  },

  print: () => JSON.stringify(table, null, 2),
};
