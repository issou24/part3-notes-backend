const mongoose = require("mongoose");

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    required: true,
  },
  number: {
    type: String,
  },
});

module.exports = mongoose.model("Person", personSchema);
