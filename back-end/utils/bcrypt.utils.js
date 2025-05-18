const bcrypt = require("bcrypt");
const saltRounds = 10; // This will define the number of rounds of hashing

function hash(password, saltRounds){
      // Pass both password and saltRounds directly to bcrypt.hashSync
      return bcrypt.hashSync(password, saltRounds);
}
function compare(password, hash) {
    return bcrypt.compareSync(password, hash);
}
module.exports = {
    hash,
    compare
}
