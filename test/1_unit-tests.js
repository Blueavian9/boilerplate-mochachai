import chai from "chai";
import analyser from "./assertion-analyser.js";
import { EventEmitter } from "events";
import Mocha from "mocha";
import fs from "fs";
import path from "path";

const assert = chai.assert;
const mocha = new Mocha();
const testDir = "./tests";

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

  const runner = mocha
    .ui("tdd")
    .run()
    .on("test end", (test) => {
      let body = test.body.replace(/\/\/.*\n|\/\*.*\*\//g, "");
      body = body.replace(/\s+/g, " ");

      const obj = {
        title: test.title,
        context: context.slice(0, -separator.length),
        state: test.state,
        assertions: analyser(body),
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
};

export default emitter;
