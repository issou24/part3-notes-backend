const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
let Person = require("./models/person");
const app = express();

var morgan = require("morgan");

mongoose.set("strictQuery", false);

const url =
  "mongodb+srv://lio3:1234@cluster0.azarczm.mongodb.net/phonebookApp?retryWrites=true&w=majority";

mongoose
  .connect(url)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Error connecting:", error.message));
let notes = [
  {
    id: "1",
    content: "HTML is easy",
    important: true,
  },
  {
    id: "2",
    content: "Browser can execute only JavaScript",
    important: false,
  },
  {
    id: "3",
    content: "GET and POST are the most important methods of HTTP protocol",
    important: true,
  },
];

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
      tokens.body(req, res), // ajoute le body ici
    ].join(" ");
  })
);

app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
});

app.get("/api/notes", (request, response) => {
  response.json(notes);
});

app.get("/api/notes/:id", (request, response) => {
  const id = request.params.id;
  const note = notes.find((note) => note.id === id);

  if (note) {
    response.json(note);
  } else {
    response.status(404).end();
  }
});

const generateId = () => {
  const maxId =
    notes.length > 0 ? Math.max(...notes.map((n) => Number(n.id))) : 0;
  return String(maxId + 1);
};

const generateIdRandom = () => {
  return Math.floor(Math.random() * 1000000000000000000000000);
};

app.post("/api/notes", (request, response) => {
  const body = request.body;

  if (!body.content) {
    return response.status(400).json({
      error: "content missing",
    });
  }

  const note = {
    content: body.content,
    important: body.important || false,
    id: generateId(),
  };

  notes = notes.concat(note);

  response.json(note);
});

app.delete("/api/notes/:id", (request, response) => {
  const id = request.params.id;
  notes = notes.filter((note) => note.id !== id);

  response.status(204).end();
});

app.get("/api/persons", (req, res) => {
  Person.find({}).then((persons) => {
    res.json(persons);
  });
});

app.get("/api/persons/:id", (req, res) => {
  Person.findById(req.params.id)
    .then((person) => {
      if (person) {
        res.json(person);
      } else {
        res.status(404).end();
      }
    })
    .catch(() => res.status(400).send({ error: "malformatted id" }));
});

app.delete("/api/persons/:id", (req, res) => {
  Person.findByIdAndRemove(req.params.id)
    .then(() => res.status(204).end())
    .catch(() => res.status(400).send({ error: "malformatted id" }));
});

app.post("/api/persons", (req, res) => {
  const body = req.body;

  if (!body.name || !body.number) {
    return res.status(400).json({ error: "Le nom ou le numéro est manquant" });
  }

  // Vérifie si le nom existe déjà
  Person.findOne({ name: body.name }).then((existing) => {
    if (existing) {
      return res.status(400).json({ error: "Le nom doit être unique" });
    }

    const person = new Person({
      name: body.name,
      number: body.number,
    });

    person.save().then((savedPerson) => {
      res.json(savedPerson);
    });
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
