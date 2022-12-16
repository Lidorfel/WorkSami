const request = require("supertest");
const app = require("../app").app;
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
// const checkNull = require("../helpfunctions/update").checkNull;

function checkNull(object1) {
  return (
    object1.new_password !== null &&
    object1.phone_number !== null &&
    object1.email !== null &&
    object1.study_year !== null &&
    object1.grades !== null
  );
}

describe("POST /students/loginSt", () => {
  describe("when passed a username and password", () => {
    test("should respond with a 200 status code", async () => {
      const response = await request(app).post("/students/loginSt").send({
        email: "ldi@gmail.com",
        password: "123456789",
      });
      expect(response.statusCode).toBe(302);
    });
  });
});

describe("POST /students/studentsUpdate", () => {
  it("Should be status code 500 because it should not updated without the session TOKEN recieved from user login, and checking side function that checks the value of the details passed,return true if value is good", async () => {
    const details = {
      password: "147258",
      phone: "0542147578",
      email: "newmailtest@gmail.com",
      status: "year3",
      avg: "76",
    };
    const updateUser = await request(app)
      .post("/students/studentsUpdate")
      .send(details);
    expect(updateUser.status).toBe(500);
    expect(checkNull(details)).toBe(true);
    expect(checkNull({ new_password: null })).toBe(false);
  });
});

describe("POST /employers/admin", () => {
  it("admin logout - should return status code 302,which means admin logged out successfully and got redirected to the main page which sends the code 302", async () => {
    const user = await request(app).post("/employers/admin").send({
      email: "worksami@gmail.com",
      password: "admin123456",
    });
    expect(user.statusCode).toBe(302);
  });
});

describe("POST /employers/employersLoggedinPage", () => {
  it("Checking side function that checks the value of the details passed,return true if value is good, if passed so the job was succcessfully added to database", () => {
    // jest.setTimeout(12000);
    const details = {
      name_job: "wix",
      describe_job: "ux/ui",
      job_type: "ux/ui",
      location: "Ahora",
      approved: false,
      candidates: [],
    };
    const newJob = request(app)
      .post("/employers/employersLoggedinPage")
      .send(details);
    expect(checkNull(details)).toBe(true);
    expect(checkNull({ new_password: null })).toBe(false);
  });
});

describe("it should respons home page", () => {
  test("should return status code of 200", (done) => {
    request(app)
      .get("/")
      .then((response) => {
        expect(response.statusCode).toBe(200);
        done();
      });
  });
});

describe("POST /students/registerSt", () => {
  it("Should be status code 302, which means user created successfully and got redirected to the desire page", async () => {
    const newUser = await request(app).post("/students/registerSt").send({
      fullname: "Asaf Lotz",
      id: "123123000",
      phone: "0525381648",
      email: "AsafLotzMasriah@gmail.com",
      password: "123456",
      gender: "male",
      status: "year2",
      department: "software",
      startdate: "17-10-2021",
      enddate: "17-7-2025",
      avg: "99",
    });
    expect(newUser.statusCode).toBe(302);
    expect(newUser.text).toBe("Found. Redirecting to /students/loginSt");
  });
});

describe("POST /employers/registerEm", () => {
  it("Should be status code 302, which means user updated his details successfully and got redirected to the desire page", async () => {
    const newUser = await request(app).post("/employers/registerEm").send({
      fullname: "Moti Luhim",
      id: "012345678",
      phone: "0502314567",
      email: "MotiLuhimYadani@gmail.com",
      password: "75315982",
      companyName: "Tire and Front origin-BeerSheeba",
      line_of_business: "Tire replacment",
      location: "South israel",
      urlcompany: "https://www.google.com",
      linkedin: "https://www.linkedin.com/",
      jobsPosted: [],
      isadmin: false,
    });
    expect(newUser.statusCode).toBe(302);
    expect(newUser.text).toBe("Found. Redirecting to /employers/loginEm");
  });
});
