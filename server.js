"use strict";
const express = require("express");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const cors = require("cors");
const runner = require("./test-runner");

const app = express();

app.use(helmet());
app.use(cors());
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
};

const data = {
  polo: { name: "Marco", surname: "Polo", dates: "1254 - 1324" },
  colombo: { name: "Cristoforo", surname: "Colombo", dates: "1451 - 1506" },
  vespucci: { name: "Amerigo", surname: "Vespucci", dates: "1454 - 1512" },
  verrazzano: {
    name: "Giovanni",
    surname: "da Verrazanno",
    dates: "1485 - 1528",
  },
};
const result = data[req.body.surname.toLowerCase()] || { name: "unknown" };
res.json(result);

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
    res.json(testFilter(ruuner.report, req.query.type, req.query.n));
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

  const filteredTests = filteredMap[type]
    ? tests.filter(filterMap[type])
    : tests;
  return n !== undefined ? filteredTests[n] || filteredTests : filteredTests;
}

module.exports = app;

// "use strict";
// const express = require("express");
// const app = express();

// // using Helmet for security headers
// const helmet = require("helmet");
// app.use(helmet());

// const runner = require("./test-runner");

// const bodyParser = require("body-parser");

// app.use(bodyParser.json());

// app.get("/", function (req, res) {
//   res.sendFile(__dirname + "/views/index.html");
// });

// app.use(express.static(__dirname + "/public"));

// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
//   res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   next();
// });

// app.get("/api/test", (req, res) => {
//   res.status(200).json({ message: "CORS and Testing Working!" });
// });

// app.get("/hello", function (req, res) {
//   const name = req.query.name || "Guest";
//   res.type("txt").send("hello " + name);
// });

// const travellers = function (req, res) {
//   let data = {};
//   if (req.body && req.body.surname) {
//     switch (req.body.surname.toLowerCase()) {
//       case "polo":
//         data = {
//           name: "Marco",
//           surname: "Polo",
//           dates: "1254 - 1324",
//         };
//         break;
//       case "colombo":
//         data = {
//           name: "Cristoforo",
//           surname: "Colombo",
//           dates: "1451 - 1506",
//         };
//         break;
//       case "vespucci":
//         data = {
//           name: "Amerigo",
//           surname: "Vespucci",
//           dates: "1454 - 1512",
//         };
//         break;
//       case "da verrazzano":
//       case "verrazzano":
//         data = {
//           name: "Giovanni",
//           surname: "da Verrazzano",
//           dates: "1485 - 1528",
//         };
//         break;
//       default:
//         data = {
//           name: "unknown",
//         };
//     }
//   }
//   res.json(data);
// };

// app.route("/travellers").put(travellers);

// let error;
// app.get(
//   "/_api/get-tests",
//   cors(),
//   function (req, res, next) {
//     if (error) return res.json({ status: "unavailable" });
//     next();
//   },
//   function (req, res, next) {
//     if (!runner.report) return next();
//     res.json(testFilter(runner.report, req.query.type, req.query.n));
//   },
//   function (req, res) {
//     runner.on("done", function (report) {
//       process.nextTick(() =>
//         res.json(testFilter(runner.report, req.query.type, req.query.n))
//       );
//     });
//   }
// );

// if(!req.body ||!req.body.surname) {
//   return res.status(400).json({ error: "Surname is required" });
// }

// const port = process.env.PORT || 3000;
// app.listen(port, function () {
//   console.log("Listening on port " + port);
//   console.log("Running Tests...");
//   setTimeout(function () {
//     try {
//       runner.run();
//     } catch (e) {
//       error = e;
//       console.log("Tests are not valid:");
//       console.log(error);
//     }
//   }, 1500);
// });

// module.exports = app; // for testing

// function testFilter(tests, type, n) {
//   let out;
//   switch (type) {
//     case "unit":
//       out = tests.filter((t) => t.context.match("Unit Tests"));
//       break;
//     case "functional":
//       out = tests.filter((t) => t.context.match("Functional Tests"));
//       break;
//     default:
//       out = tests;
//   }
//   if (n !== undefined) {
//     return out[n] || out;
//   }
//   return out;
// }
