const app = require("../app");
const request = require("supertest");

describe("POST /students/registerSt", () => {
  it("It should respond 'user created'", async () => {
    console.log("lidor");
    const newUser = await (
      await request(app).post("/students/registerSt")
    ).send({
      fullname: "Itay Ventura",
      id: "123456789",
      phone: "0523847373",
      email: "itayventura1@gmail.com",
      password: "123456asd",
      gender: "male",
      status: "first year",
      department: "software",
      startdate: new Date(),
      enddate: new Date(),
      avg: "100",
    });
    // expect(newUser.body.message).toBe("user created");
    expect(newUser.statusCode).toBe(201);
  });
});
