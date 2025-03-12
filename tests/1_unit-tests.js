const chai = require("chai");
const assert = chai.assert;
const chaiHttp = require("chai-http");

chai.use(chaiHttp); // Ensure chai-http is used

const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const path = require("path");
const axios = require("axios");

const scriptPath = path.resolve(__dirname, "..", "public", "script.js");
const Browser = require("zombie");
const browser = new Browser();

suite("Unit Tests", function () {
  suite("Basic Assertions", function () {
    test("#isNull, #isNotNull", function () {
      assert.isNull(null, "null is null");
      assert.isNotNull(1, "1 is not null");
    });

    test("#isDefined, #isUndefined", function () {
      assert.isDefined(1, "1 is defined");
      assert.isUndefined(undefined, "undefined is undefined");
    });

    test("#isOk, #isNotOk", function () {
      assert.isOk(true, "true is truthy");
      assert.isNotOk(false, "false is falsy");
    });

    test("#isBoolean", function () {
      assert.isBoolean(true, "true is a boolean");
      assert.isBoolean(false, "false is a boolean");
    });
  });

  suite("Equality", function () {
    test("#equal, #notEqual", function () {
      assert.equal(12, "12", "numbers are coerced into strings");
      assert.notEqual(1, 2, "different numbers are not equal"); // Fixed object comparison issue
    });

    test("#strictEqual, #notStrictEqual", function () {
      assert.strictEqual(12, 12, "same type and value");
      assert.notStrictEqual(12, "12", "different types are not strictly equal");
    });

    test("#deepEqual, #notDeepEqual", function () {
      assert.deepEqual(
        { a: 1 },
        { a: 1 },
        "objects with same properties are deeply equal"
      );
      assert.notDeepEqual(
        { a: 1 },
        { a: 2 },
        "objects with different properties are not deeply equal"
      );
    });
  });
});
