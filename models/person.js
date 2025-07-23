const mongoose = require("mongoose");

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    required: true,
  },
  number: {
    type: String,
    minlength: 8,
    required: true,
    match: [
      /^\d{2,3}-\d+$/,
      'Le numéro doit être formé de deux parties séparées par un "-", la première partie contient 2 ou 3 chiffres, la deuxième partie contient des chiffres.',
    ],
  },
});

module.exports = mongoose.model("Person", personSchema);
