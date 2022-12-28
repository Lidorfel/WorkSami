// const { agent } = require("supertest");
// const request = require("supertest");
// const app = require("../app");
// const mongoose = require( 'mongoose' )
// mongoose.Promise = global.Promise

// describe("Test the root path", () => {
//     test("It should response the GET method", done => {
//         request(app)
//             .get("/")
//             .then(response => {
//                 expect(response.statusCode).toBe(200);
//                 done();
//             });
//     });
// });

// //Test Sign Up

// //Student sign up
// describe("POST /student", () => {
//     it("Should be status code 200", async () => {
//         const newUser = await request(app).post("/student").send({
//             firstname: 'ofek',
//             secondname: 'biton',
//             email: 'ofekbiton120200@gmail.com',
//             phone: '0549254191',
//             security: 'billie',
//             password: '123456789Tpen',
//         });
//         expect(newUser.statusCode).toBe(302);
//     });
// });

// //HR sign up
// describe("POST /hr", () => {
//     it("Should be status code 200", async () => {
//         const newUser = await request(app).post("/hr").send({
//             firstname: 'gal',
//             secondname: 'yossef',//json.toString(req.body.birthdate),
//             email: 'galyossef15@gmail.com',
//             companyname: 'castro',
//             phone: '0544676374',
//             security: 'ilanit',
//             password: '123',

//         });
//         expect(newUser.statusCode).toBe(302);
//     });
// });

// //Test Login
// //login hr
// describe("POST /login", () => {
//     it("Should be status code 200", async () => {
//         const hr = await request(app).get("/login").send({
//             email: 'ofekbiton120200@gmail.com',
//             password: 'Ofek1234',
//         });
//         expect(200);
//         expect((res) => {
//             expect(res.body.email).toBe("ofekbiton120200@gmail.com");
//             expect(res.body.password).toBe("Ofek1234");
//         })

//     });
// });

// //login agent
// describe("POST /login", () => {
//     it("Should be status code 302", async () => {
//         const agent = await request(app).get("/login").send({
//             email: 'shir@gmail.com',
//             password: 'Shir12345',
//         });
//         expect(302);
//         expect((res) => {
//             expect(res.body.email).toBe("shir@gmail.com");
//             expect(res.body.password).toBe("Shir1234");
//         })

//     });
// });

// //login student
// describe("POST /login", () => {
//     it("Should be status code 200", async () => {
//         const student = await request(app).get("/login").send({
//             email: 'yoni@gmail.com',
//             password: '123Yoni',
//         });
//         expect(200);
//         expect((res) => {
//             expect(res.body.email).toBe("yoni@gmail.com");
//             expect(res.body.password).toBe("123Yoni");
//         })

//     });
// });

// //Test Change Password
// describe("POST /porggot", () => {
//     it("Should be status code 200", async () => {
//         const student = await request(app).get("/porggot").send({
//             email: 'yoni@gmail.com',
//             security: '123Yoni',
//         });
//         expect(200);
//         expect((res) => {
//             expect(res.body.email).toBe("yoni@gmail.com");
//             expect(res.body.security).toBe("123Yoni");
//         })

//     });
// });
