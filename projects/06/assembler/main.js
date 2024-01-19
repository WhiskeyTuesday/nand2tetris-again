// nand2Tetris Hack assembler written in node.js
// Author: @WhiskeyTuesday (github, twitter, etc.)

// takes the path to the asm file as the first argument

// takes an optional second argument to specify the output
// file path if no second argument is provided, the output
// file will be named the same as the input file, but with a
// .hack extension instead of .asm if the second argument is
// a directory, the output file will be named the same as
// the input file, but with a .hack extension instead of
// .asm and will be placed in the specified directory. If
// the second argument has an extension, the output file
// will be named the same as the second argument. More
// details are to be founf in comments in the relevant
// section of the code.

// if the input file is a directory, the assembler will
// attempt to assemble all .asm files in the directory and
// output them to .hack files in the same directory

// also takes a third optional argument (a flag -s) to
// enable the creation of a symbol table file (named the
// same as the output file, but with a .sym extension
// instead of .hack), containing the symbol table used to
// translate the assembly file.

// NOTE: I have ignored the advice of the nand2Tetris course
// and book and have not built separate parse and code
// translation steps. The assembly language is so simple
// that it's just not really necessary and I'm not enough of
// a beginner to get a lot of value out of building it that
// way as an exercise. The many suggested methods on the
// parser seem pretty unnessecary to me, so I've just built
// a simple straight-through parser that does the
// translation as it goes and does the whole file in one
// pass. The symbol table init function does its own pass
// through the file to build the symbol table, so it's still
// a two-pass assembler, but the structure is a little
// diffenet than the one suggested in the book. I also added
// the features mentioned above, for no particular reason.

const fs = require('fs');
const path = require('path');

const parse = require('./parse');
const symbolTable = require('./symbolTable');

const args = process.argv.slice(2);

if (args.length < 1) { throw new Error('No input file specified'); }
if (args.length > 3) { throw new Error('Too many arguments'); }

const parseArgs = (args) => {
  const inPath = path.resolve(args[0]);
  const exists = fs.existsSync(inPath);
  if (!exists) { throw new Error('Input file does not exist'); }
  const isDir = fs.lstatSync(inPath).isDirectory();
  const files = isDir ? asms(fs.readdirSync(inPath)) : [inPath];
  const asms = files.filter((file) => path.extname(file) === '.asm');
  if (asms.length === 0) { throw new Error('No .asm files found'); }

  const outPath = (() => {
    if (!args[1] || args[1].startsWith('-')) {
      const dirname = path.dirname(inPath);
      const basename = path.basename(inPath, '.asm');
      return path.resolve(`${dirname}/${basename}.hack`);
    }

    const ext = path.extname(args[1]) || '.hack';
    const dirname = path.dirname(args[1]);
    const basename = path.basename(args[1], ext);
    const exists = fs.existsSync(args[1]);
    const isDir = exists && fs.lstatSync(args[1]).isDirectory();
    if (exists && !isDir) {
      // if it's an existing file, overwrite it
      return path.resolve(`${dirname}/${basename}${ext}`);
    } else if (exists && isDir) {
      // if the arg specifies a directory, create the file
      // in that directory with the same name as the input
      // file and .hack extension.
      const inName = path.basename(inPath, '.asm');
      return path.resolve(`./${basename}/${inName}${ext}`);
    } else if (!exists && args[1].includes('.')){
      // if the arg specifies a file that doesn't exist and
      // it contains a '.' create the file in the current
      // directory with the specified name and extension.
      return path.resolve(`${dirname}/${basename}${ext}`);
    } else {
      // if the arg points to a dir (no '.') that doesn't
      // exist we should create it but since I happen to
      // know (or think I know anyway) that node doesn't
      // have a convenient equivalent to mkdir -p... so I'm
      // going to interpret it as a file name and create the
      // file in the input file's directory, with the
      // specified name, and .hack extension
      const inDir = path.dirname(inPath);
      return path.resolve(`${inDir}/${basename}.hack`);
    }
  })();

  return {
    inPath,
    outPath,
    writeSymbols: args[2] === '-s' || args[1] === '-s',
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
  fs.writeFileSync(outPath, parsed);
};

files.forEach((file) => assemble(file));
