// const { response } = require("express");
// const app = require("../app");
// const request = require("supertest");
// const studentRoutes = require("../routes/students/studentsRoutes");
// // const { describe } = require("node:test");

// describe("", () => {
//   test("it should respons home page", (done) => {
//     request(app)
//       .get("/")
//       .then((response) => {
//         expect(response.statusCode).toBe(200);
//         done();
//       });
//   });
// });
// describe("POST /loginSt", () => {
//   it("should respones 'login ok'", async () => {
//     const user = await request(studentRoutes).post("/students/loginSt").send({
//       email: "yoni13445@gmail.com",
//       password: "123456",
//     });

//     expect(user.statusCode).toBe(200);
//   });
// });

// describe("POST /student/loginSt", () => {
//   describe("when passed a username and password", () => {
//     test("should respond with a 200 status code", async () => {
//       const user = await request(app).post("/student/loginSt").send({
//         email: "yoni13445@gmail.com",
//         password: "123456",
//       });
//       expect(response.statusCode).toBe(200);
//     });
//   });
// });
