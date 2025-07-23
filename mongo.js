const mongoose = require("mongoose");

// Vérifie les arguments
if (process.argv.length < 5) {
  console.log("Usage: node mongo.js <password> <name> <number>");
  process.exit(1);
}

const password = process.argv[2];
const name = process.argv[3];
const number = process.argv[4];

const url = `mongodb+srv://lio3:${password}@cluster0.azarczm.mongodb.net/phonebookApp?retryWrites=true&w=majority`;

mongoose.set("strictQuery", false);
mongoose.connect(url);

// Schéma Mongoose
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

const Person = mongoose.model("Person", personSchema);

// Nouvelle personne à ajouter
const person = new Person({
  name,
  number,
});

// Sauvegarde dans la base
person
  .save()
  .then(() => {
    console.log(`added ${name} number ${number} to phonebook`);
    mongoose.connection.close();
  })
  .catch((error) => {
    console.error("Erreur lors de l'ajout :", error.message);
    mongoose.connection.close();
  });
