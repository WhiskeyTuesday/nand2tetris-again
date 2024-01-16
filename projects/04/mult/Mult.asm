// R2 = R1 * R0

@R2 // Load R2 address into A register
M=0 // Set R2 to 0

// Check if R1 is less than 1
@R1 // Load R1 address into A register
D=M // Load R1 value into D register
@END // Load END address into A register
D;JLE // If D register is less than or equal to 0, jump to END

// Check if R0 is less than 1
// NOTE: this is not strictly necessary, as if R0 is 0
// the loop will just add 0 to R2 over and over again
// until R1 is 0, at which point the program will end
// but this is more efficient
@R0 // Load R0 address into A register
D=M // Load R0 value into D register
@END // Load END address into A register
D;JLE // If D register is less than or equal to 0, jump to END

// Otherwise, add R0 to R2, R1 times
(LOOP)
// Add R0 to R2
@R0 // Load R0 address into A register
D=M // Load R0 value into D register
@R2 // Load R2 address into A register
M=M+D // Add R0 value to R2 value and store in R2

// Decrement R1
@R1 // Load R1 address into A register
M=M-1 // Decrement R1 value
D=M // Load R1 value into D register

@LOOP // Load LOOP address into A register
D;JGT // If D register is greater than 0, jump to LOOP

(END) // End program (infinite loop)
@END // Load END address into A register
0;JMP
