"use strict";
const express = require("express");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const runner = require("./test-runner");
const chaiHttp = require("chai-http"); // Ensure chai-http is imported

const app = require("express");

app.use(helmet());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.use(express.static(__dirname + "/public"));

app.get("/api/test", (req, res) => {
  res.status(200).json({ message: "CORS and Testing Working!" });
});

app.get("/hello", (req, res) => {
  const name = req.query.name || "Guest";
  res.type("txt").send("hello " + name);
});

const travellers = (req, res) => {
  if (!req.body || !req.body.surname) {
    return res.status(400).json({ error: "Surname is required" });
  }

  const data = {
    polo: { name: "Marco", surname: "Polo", dates: "1254 - 1324" },
    colombo: { name: "Cristoforo", surname: "Colombo", dates: "1451 - 1506" },
    vespucci: { name: "Amerigo", surname: "Vespucci", dates: "1454 - 1512" },
    verrazzano: {
      name: "Giovanni",
      surname: "da Verrazzano",
      dates: "1485 - 1528",
    },
  };

  const result = data[req.body.surname.toLowerCase()] || { name: "unknown" };
  res.json(result);
};

app.route("/travellers").put(travellers);

let error;
app.get(
  "/_api/get-tests",
  (req, res, next) => {
    if (error) return res.json({ status: "unavailable" });
    next();
  },
  (req, res, next) => {
    if (!runner.report) return next();
    res.json(testFilter(runner.report, req.query.type, req.query.n));
  },
  (req, res) => {
    runner.on("done", (report) => {
      process.nextTick(() =>
        res.json(testFilter(runner.report, req.query.type, req.query.n))
      );
    });
  }
);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Listening on port " + port);
  console.log("Running Tests...");
  setTimeout(() => {
    try {
      runner.run();
    } catch (e) {
      error = e;
      console.error("Tests are not valid:", error);
    }
  }, 1500);
});

function testFilter(tests, type, n) {
  const filterMap = {
    unit: (t) => t.context.match("Unit Tests"),
    functional: (t) => t.context.match("Functional Tests"),
  };

  const filteredTests = filterMap[type] ? tests.filter(filterMap[type]) : tests;
  return n !== undefined ? filteredTests[n] || filteredTests : filteredTests;
}

export default module.exports = app;
