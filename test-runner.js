import EventEmitter from "events";
import Mocha from "mocha";
import fs from "fs";
import path from "path";
import assertionAnalyser from "./assertion-analyser.js";

import mocha from new Mocha();
import testDir from path.join(__dirname, "./test/**/*.js");

import __filename from fileURLToPath(import.meta.url);
import __dirname from dirname(__filename);

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


export default new EventEmitter(); 