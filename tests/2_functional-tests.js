const chai = require("chai");
const chaiHttp = require("chai-http");
const chaiHttp = chai.use(chaiHttp);
const { assert, request } = chai;
const server = require("../server");

const Browser = require("zombie");
const browser = new Browser();

suite("Functional Tests", function () {
  suite("Integration tests with chai-http", function () {
    test("Test GET /hello with no name", function (done) {
      request(server)
        .get("/hello")
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, "hello Guest");
          done();
        });
    });

    test("Test GET /hello with your name", function (done) {
      request(server)
        .get("/hello?name=Cesar")
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, "hello Cesar");
          done();
        });
    });

    test("Send {surname: 'Colombo'}", function (done) {
      request(server)
        .post("/name")
        .send({ surname: "Colombo" })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.property(res.body, "name");
          assert.equal(res.body.name, "Cristoforo Colombo");
          done();
        });
    });

    test("Send {surname: 'da Verrazzano'}", function (done) {
      request(server)
        .post("/name")
        .send({ surname: "da Verrazzano" })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.property(res.body, "name");
          assert.equal(res.body.name, "Giovanni da Verrazzano");
          done();
        });
    });
  });

  suite("Functional Tests with Zombie.js", function () {
    this.timeout(5000);

    suiteSetup(function (done) {
      browser.visit("http://localhost:3000", done);
    });

    test("should have a working site property", function (done) {
      assert.isDefined(browser.site);
      done();
    });

    test('Submit the surname "Colombo" in the HTML form', function (done) {
      browser
        .fill("input[name='surname']", "Colombo")
        .pressButton("submit", function () {
          browser.assert.success();
          browser.assert.text("span#name", "Cristoforo Colombo");
          done();
        });
    });

    test('Submit the surname "Vespucci" in the HTML form', function (done) {
      browser
        .fill("input[name='surname']", "Vespucci")
        .pressButton("submit", function () {
          browser.assert.success();
          browser.assert.text("span#name", "Amerigo Vespucci");
          done();
        });
    });
  });
});
