// src/data/ai/learningObjectives.js

const learningObjectives = {
  binary: [
    "Understand that binary is a base-2 number system using only 0 and 1.",
    "Convert decimal numbers to 4-bit and 8-bit binary values.",
    "Convert binary numbers back to decimal form.",
    "Explain the significance of the least significant bit (LSB) and most significant bit (MSB).",
    "Identify how 4-bit binary forms a nibble and 8-bit binary forms a byte.",
    "Use binary place values (1, 2, 4, 8...) to compute decimal equivalents."
  ],

  octal: [
    "Understand that octal is a base-8 number system using digits 0 through 7.",
    "Group binary digits into sets of 3 to convert binary to octal.",
    "Convert octal numbers to binary and decimal values.",
    "Recognize the role of octal in simplifying binary code for programming and memory."
  ],

  hexadecimal: [
    "Understand that hexadecimal is a base-16 number system using 0–9 and A–F.",
    "Convert binary numbers to hexadecimal by grouping bits in sets of 4.",
    "Convert between hexadecimal, binary, and decimal formats.",
    "Explain how hexadecimal is used in memory addresses, color codes, and debugging."
  ],

  gray_code: [
    "Understand that Gray code is a binary system where only one bit changes at a time.",
    "Convert binary numbers to Gray code and vice versa.",
    "Explain the advantage of Gray code in minimizing transition errors in digital circuits."
  ],

  bcd: [
    "Understand that BCD (Binary-Coded Decimal) represents each decimal digit with a 4-bit binary equivalent.",
    "Convert decimal numbers to BCD and vice versa.",
    "Identify valid and invalid BCD combinations.",
    "Understand BCD's use in calculators and digital displays."
  ]
};

export default learningObjectives;
