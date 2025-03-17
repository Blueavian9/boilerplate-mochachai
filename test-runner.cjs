const EventEmitter = require("events");
const Mocha = require("mocha");
const fs = require("fs");
const path = require("path");
const assertionAnalyser = require("./assertion-analyser.js");

const mocha = new Mocha();
const testDir = path.join(__dirname, "./tests");


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Add each .js file to the mocha instance
fs.readdirSync(testDir)
  .filter((file) => file.endsWith(".js"))
  .forEach((file) => {
    mocha.addFile(path.join(testDir, file));
  });

const emitter = new EventEmitter();

emitter.run = function () {
  const tests = [];
  let context = "";
  const separator = " -> ";

  try {
    const runner = mocha
      .ui("tdd")
      .run()
      .on("test end", (test) => {
        let body = test.body.replace(/\/\/.*\n|\/\*.*\*\//g, ""); // remove comments
        body = body.replace(/\s+/g, " "); // collapse spaces

        const obj = {
          title: test.title,
          context: context.slice(0, -separator.length),
          state: test.state,
          assertions: assertionAnalyser(body),
        };
        tests.push(obj);
      })
      .on("end", () => {
        emitter.report = tests;
        emitter.emit("done", tests);
      })
      .on("suite", (s) => {
        context += s.title + separator;
      })
      .on("suite end", (s) => {
        context = context.slice(0, -(s.title.length + separator.length));
      });
  } catch (e) {
    throw e;
  }
};

export default emitter;
