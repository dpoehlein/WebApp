// index.js
import binary from "./digital_electronics/number_systems/binary";
import octal from "./digital_electronics/number_systems/octal";
import hexadecimal from "./digital_electronics/number_systems/hexadecimal";
// ...etc

const practicePriorities = {
  digital_electronics: {
    number_systems: {
      binary,
      octal,
      hexadecimal,
      // ...
    },
  },
  // Other topics...
};

export default practicePriorities;
