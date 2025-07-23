const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Person = require("./models/person");
const morgan = require("morgan");
const errorHandler = require("./middlewares/errorHandler");
const app = express();

mongoose.set("strictQuery", false);

const url =
  "mongodb+srv://lio3:1234@cluster0.azarczm.mongodb.net/phonebookApp?retryWrites=true&w=majority";

mongoose
  .connect(url)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Error connecting:", error.message));

app.use(express.json());
app.use(cors());

morgan.token("body", (req) => JSON.stringify(req.body));

app.use(
  morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
      tokens.body(req, res),
    ].join(" ");
  })
);

app.get("/", (req, res) => {
  res.send("<h1>Hello World!</h1>");
});

// Notes API (unchanged)
let notes = [
  { id: "1", content: "HTML is easy", important: true },
  { id: "2", content: "Browser can execute only JavaScript", important: false },
  {
    id: "3",
    content: "GET and POST are the most important methods of HTTP protocol",
    important: true,
  },
];

app.get("/api/notes", (req, res) => {
  res.json(notes);
});

app.get("/api/notes/:id", (req, res, next) => {
  try {
    const id = req.params.id;
    const note = notes.find((note) => note.id === id);

    if (note) {
      res.json(note);
    } else {
      // Si aucune note trouvée, on crée une erreur et on la passe à next()
      const err = new Error("Note not found");
      err.status = 404;
      next(err);
    }
  } catch (err) {
    next(err); // Pour capturer les erreurs inattendues
  }
});

app.post("/api/notes", (req, res, next) => {
  try {
    const body = req.body;

    if (!body.content) {
      const err = new Error("Content missing");
      err.status = 400;
      return next(err);
    }

    const note = {
      content: body.content,
      important: body.important || false,
      id: (Math.max(...notes.map((n) => Number(n.id))) + 1).toString(),
    };

    notes = notes.concat(note);
    res.status(201).json(note);
  } catch (err) {
    next(err);
  }
});

app.delete("/api/notes/:id", (req, res, next) => {
  try {
    const id = req.params.id;
    const initialLength = notes.length;

    notes = notes.filter((note) => note.id !== id);

    if (notes.length === initialLength) {
      const err = new Error("Note not found");
      err.status = 404;
      return next(err);
    }

    res.status(204).end(); // Suppression réussie, pas de contenu
  } catch (err) {
    next(err);
  }
});

// === PERSONS API ===

// Helper to validate MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

app.get("/api/persons", async (req, res, next) => {
  try {
    const persons = await Person.find({});
    res.json(persons);
  } catch (err) {
    next(err); // Middleware d'erreur
  }
});

app.get("/api/persons/:id", async (req, res, next) => {
  const id = req.params.id;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: "Malformatted ID" });
  }

  try {
    const person = await Person.findById(id);
    if (!person) {
      return res.status(404).json({ error: "Person not found" });
    }
    res.json(person);
  } catch (err) {
    next(err);
  }
});

app.delete("/api/persons/:id", async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "malformatted id" });
  }

  try {
    const deletedPerson = await Person.findByIdAndDelete(id); // ✅ CORRECTION ICI
    if (!deletedPerson) {
      return res.status(404).json({ error: "person not found" });
    }
    res.status(204).end();
  } catch (error) {
    console.error("Erreur suppression:", error);
    res.status(500).json({ error: "Erreur serveur lors de la suppression" });
  }
});

app.post("/api/persons", async (req, res, next) => {
  const { name, number } = req.body;

  if (!name || !number) {
    return res.status(400).json({ error: "Le nom ou le numéro est manquant" });
  }

  try {
    const existing = await Person.findOne({ name });
    if (existing) {
      return res.status(400).json({ error: "Le nom doit être unique" });
    }

    const person = new Person({ name, number });
    const savedPerson = await person.save();
    res.json(savedPerson);
  } catch (error) {
    next(error);
  }
});

// Middleware gestion erreurs
app.use((error, req, res, next) => {
  console.error(error.message);

  if (error.name === "CastError" && error.kind === "ObjectId") {
    return res.status(400).json({ error: "malformatted id" });
  }

  if (error.name === "ValidationError") {
    return res.status(400).json({ error: error.message });
  }

  res.status(500).json({ error: "Internal server error" });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
