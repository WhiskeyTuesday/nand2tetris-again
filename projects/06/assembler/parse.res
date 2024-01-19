let compDict = Dict.fromArray([
  ('0',   '0101010'), ('1',   '0111111'),
  ('-1',  '0111010'), ('D',   '0001100'),
  ('A',   '0110000'), ('!D',  '0001101'),
  ('!A',  '0110001'), ('-D',  '0001111'),
  ('-A',  '0110011'), ('D+1', '0011111'),
  ('A+1', '0110111'), ('D-1', '0001110'),
  ('A-1', '0110010'), ('D+A', '0000010'),
  ('D-A', '0010011'), ('A-D', '0000111'),
  ('D&A', '0000000'), ('D|A', '0010101'),
  ('M',   '1110000'), ('!M',  '1110001'),
  ('-M',  '1110011'), ('M+1', '1110111'),
  ('M-1', '1110010'), ('D+M', '1000010'),
  ('D-M', '1010011'), ('M-D', '1000111'),
  ('D&M', '1000000'), ('D|M', '1010101'),
]);

let jumpDict = Dict.fromArray([
  ('JGT', '001'), ('JEQ', '010'), ('JGE', '011'),
  ('JLT', '100'), ('JNE', '101'), ('JLE', '110'),
  ('JMP', '111'),
]);

let destDict = Dict.fromArray([
  ('M', '001'),   ('D', '010'),  ('MD', '011'),
  ('A', '100'),   ('AM', '101'), ('AD', '110'),
  ('AMD', '111'), ('DM', '011'),
  // DM is not in the spec, but it's used in some of the
  // test files (some versions anyway), accidentally I
  // suppose.
]);

// An alternative approach which doesn't have that problem
// would look like this (one of many ways to do it)
let getDest = (line) => {
  switch (line.includes('A'), line.includes('D'), line.includes('M')) {
    | (true, true, true) => '111'
    | (true, true, false) => '110'
    | (true, false, true) => '101'
    | (true, false, false) => '100'
    | (false, true, true) => '011'
    | (false, true, false) => '010'
    | (false, false, true) => '001'
    | _ => exn InvalidDestination
  }
}

// ...or this (which I think is uglier)
let getDest2 = (line) => {
  let dest = 0;
  if (line.includes('A')) {
    dest += 4;
  }
  if (line.includes('D')) {
    dest += 2;
  }
  if (line.includes('M')) {
    dest += 1;
  }
  dest.toString(2);
}

// anyway, I'm going to use the dictionary version but I
// thought I might as well show you some other ways to do
// it.

let AInstruction = (line) => {
  let value = line.slice(1);
  let isSymbol = isNaN(value);

  switch isSymbol {
    | true => `${symbols.getAddress(value)address.toString(2)}`;
    | false => `${parseInt(value).toString(2)}`;
  }
}

let CInstruction = (line) => {
  let hasJump = line.includes(';');
  let hasDest = line.includes('=');
  let {a, comp, dest, jump} = switch (hasJump, hasDest) {
    | (true, true) => exn InvalidInstruction;
    | (false, false) => exn InvalidInstruction;
    | (true, false) => {
      let [compStr, jumpStr] = line.split(';');
      let comp = compDict.get(compStr);
      let jump = jumpDict.get(jumpStr);
      let a = comp.includes('M');
      { a, comp, dest: '000', jump };
    }
    | (false, true) => {
      let [destStr, compStr] = line.split('=');
      let comp = compDict.get(compStr);
      let dest = destDict.get(destStr);
      let a = comp.includes('M');
      { a, comp, dest, jump: '000' };
    }
  }

  `111${a ? '1' : '0'}${comp}${dest}${jump}`;
};

let parseLine = (line) => {
  let fc = line.charAt(0);
  switch fc {
    | '(' => false
    | '@' => AInstruction(line)
    | _ => CInstruction(line)
  }
};

let parse = (lines) => {
  let parsedLines = lines
    |> List.filter((line) => line !== '')
    |> List.filter((line) => line !== false)
    |> List.map(parseLine)
    |> List.join('\n');
};
