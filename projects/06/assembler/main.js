// nand2Tetris Hack assembler written in node.js
// Author: @WhiskeyTuesday (github, twitter, etc.)

// takes the path to the asm file as the first argument

// takes an optional second argument to specify the output file path
// if no second argument is provided, the output file will be named
// the same as the input file, but with a .hack extension instead of .asm
// if the second argument is a directory, the output file will be named
// the same as the input file, but with a .hack extension instead of .asm
// and will be placed in the specified directory. If the second argument
// has an extension, the output file will be named the same as the second
// argument.

// if the input file is a directory, the assembler will attempt to
// assemble all .asm files in the directory and output them to .hack
// files in the same directory

// also takes a third optional argument (a flag -s) to enable
// the creation of a symbol table file (named the same as the output
// file, but with a .sym extension instead of .hack), containing
// the symbol table used to translate the assembly file.

// NOTE: I have ignored the advice of the nand2Tetris course and book
// and have not built separate parse and code translation steps. The
// assembly language is so simple that it's just not really necessary
// and I'm not enough of a beginner to get a lot of value out of
// building it that way as an exercise. The many suggested methods on
// the parser seem pretty unnessecary to me, so I've just built a simple
// straight-through parser that does the translation as it goes and does
// the whole file in one pass. The symbol table init function does its
// own pass through the file to build the symbol table, so it's still a
// two-pass assembler, but the structure is a little diffenet than the
// one suggested in the book. I also added the features mentioned above,
// for no particular reason.

const fs = require('fs');
const path = require('path');

const parse = require('./parse');
const symbolTable = require('./symbolTable');

const args = process.argv.slice(2);

if (args.length < 1) { throw new Error('No input file specified'); }
if (args.length > 3) { throw new Error('Too many arguments'); }

const parseArgs = (args) => {
  const inPath = path.resolve(args[0]);
  const isDir = fs.lstatSync(inPath).isDirectory();
  const files = isDir ? asms(fs.readdirSync(inPath)) : [inPath];
  const asms = files.filter((file) => path.extname(file) === '.asm');
  if (asms.length === 0) { throw new Error('No .asm files found'); }

  const outPath = (() => {
    if (!args[1]) {
      return `${path.dirname(inPath)}/${path.basename(inPath, '.asm')}.hack`;
    }

    const ext = path.extname(args[1]) || '.hack';
    const isDir = fs.lstatSync(args[1]).isDirectory();
    const exists = isDir && fs.existsSync(args[1]);
    if (isDir && !exists) { throw new Error('Output directory does not exist'); }

    return path.resolve(path.dirname(args[1]), path.basename(args[1], '.asm'), ext);
  })();

  return {
    inPath,
    outPath,
    writeSymbols: args[2] === '-s',
    files: asms,
  };
};

const { inPath, outPath, writeSymbols, files } = parseArgs(args);

const assemble = (filePath) => {
  const asmStr = fs.readFileSync(filePath, 'utf8');
  const asm = asmStr.split('\n')
    .map((line) => line.replace(/\/\/.*/, '')) // remove comments
    .map((line) => line.trim()) // remove whitespace
    .filter((line) => line !== ''); // remove empty lines

  symbolTable.init(asm);
  const parsed = parse(asm, symbolTable);
  const symPath = `${outPath}.sym`;
  if (writeSymbols) fs.writeFileSync(symPath, symbolTable.print());
  const outName = `${outPath}/${path.basename(filePath, '.asm')}.hack`;
  fs.writeFileSync(outPath, parsed);
};

files.forEach((file) => assemble(file));
