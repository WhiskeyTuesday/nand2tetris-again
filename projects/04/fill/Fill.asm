// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/04/Fill.asm

// Runs an infinite loop that listens to the keyboard input.
// When a key is pressed (any key), the program blackens the screen
// by writing 'black' in every pixel;
// the screen should remain fully black as long as the key is pressed. 
// When no key is pressed, the program clears the screen by writing
// 'white' in every pixel;
// the screen should remain fully clear as long as no key is pressed.

// initialize lastKeyboard to zero
@lastKeyboard // load the address of lastKeyboard
M=0 // store zero in lastKeyboard

@SCREEN // load the address of SCREEN
D=A // store the value of SCREEN in D
@8191 // load the value 8191
D=D+A // add 8191 to D (D now contains SCREEN+8191)
@lastPixelAddress // load the address of lastPixel
M=D // store SCREEN+8191 in lastPixelAddress

(LOOP)
  // determine if any key is pressed (@keyboard is non-zero)
  @KBD// load the address of keyboard
  D=M // store the value of keyboard in D
  // determine if the last time we checked it was the same
  @lastKeyboard // load the address of lastKeyboard
  D=M-D // if it was the same, D will be zero
  @LOOP // load the address of the label LOOP
  D;JEQ // if D is zero, jump to loop
  // otherwise, store the current value of keyboard in lastKeyboard
  @KBD// load the address of keyboard
  D=M // store the value of keyboard in D
  @lastKeyboard // load the address of lastKeyboard
  M=D // store the value of keyboard in lastKeyboard
  // fall through to DIFFERENT

(DIFFERENT)
  @BLACK // load the address of the label BLACK
  D;JGT // if keyboard is non-zero, jmp to black
  // otherwise fall through to white
  // (we could explicitly jmp to white, but it's not necessary)
  // @WHITE // load the address of the label WHITE
  // 0;JMP // jmp to white

(WHITE)
  @color
  M=0 // store zero in color
  @FILL // load the address of the label FILL
  0;JMP // jmp to fill

(BLACK)
  @color
  M=-1 // store -1 in color
  @FILL // load the address of the label FILL
  0;JMP // jmp to fill

(FILL)
  // fill the screen with the color stored in color
  @i // load the address of i
  M=0 // store zero in i
  (FILLLOOP)
    @SCREEN // load the address of SCREEN
    D=A // store the value of SCREEN in D
    @i // load the address of i
    D=D+M // add i to D (D now contains SCREEN+i)
    @address // create a temporary variable for screen+i
    M=D // store SCREEN+i in address
    @color // load the address of color
    D=M // store the value of color in D
    @address // load the address of the current pixel variable
    A=M // store the value of the current pixel in A (load the actual address)
    M=D // store color in the current pixel
    @i // load the address of i
    M=M+1 // increment i
    // jump to loop if address is greater than lastPixelAddress
    @lastPixelAddress // load the address of lastPixelAddress
    D=M // store the value of lastPixelAddress in D
    @address // load the address of the current pixel variable
    D=D-M // subtract address from D
    @FILLLOOP // load the address of the label FILLLOOP
    D;JGT // if D is greater than zero, jump to FILLLOOP
    // otherwise, jump to LOOP
    @LOOP // load the address of the label LOOP
    0;JMP // jump back to loop
