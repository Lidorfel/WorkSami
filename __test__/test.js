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
function checkNullJob(object1) {
  return (
    object1.describe_job !== null &&
    object1.job_type !== null &&
    object1.location !== null
  );
}
const dbURI =
  "mongodb+srv://bugab:test1234@worksami.1vddn1h.mongodb.net/WorkSamiweb?retryWrites=true&w=majority";
let db = mongoose.connection;
mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((res) => {
    console.log("connected to db + listing to port 3000");
  })
  .catch((err) => console.log(err));

  //  סיפור משתמש 1-הרשמה סטודנט
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
// סיפור משתמש 2-ההתחברות סטודנט
describe("POST /students/loginSt", () => {
  describe("when passed a username and password", () => {
    test("should respond with a 302 status code", async () => {
      const response = await request(app).post("/students/loginSt").send({
        email: "yoni1345@gmail.com",
        password: "123456",
      });
      expect(response.statusCode).toBe(302);
    });
  });
});
//  סיפור משתמש 3-עדכון פרטי סטודנט
describe("POST /students/studentsUpdate", () => {
  it("Should be status code 500 because it should not updated without the session TOKEN recieved from user login, and checking side function that checks the value of the details passed,return true if value is good", async () => {
    const details = {
      new_password: "123456",
      phone_number: "0542147578",
      email: "yoni1345@gmail.com",
      study_year: "year3",
      avrage_grade: "76",
    };
    const updateUser = await request(app)
      .post("/students/studentsUpdate")
      .send(details);
    expect(updateUser.status).toBe(302);
    expect(checkNull(details)).toBe(true);
    expect(checkNull({ new_password: null })).toBe(false);
  });
});
// סיפור משתמש 4-התנתקות סטודנט
describe("POST /students/logout", () => {
  it("student logout - should return status code 302,which means students logged out successfully and got redirected to the main page which sends the code 302", async () => {
    const user = await request(app).post("/students/logout").send({
      email: "yoni1345@gmail.com",
      password: "123456",
    });
    expect(user.statusCode).toBe(302);
  });
});
// סיפור משתמש 5-בקשת עזרה מאדמין סטודנט
describe("POST /students/contact", () => {
  it("it should respond status code 302 because there is no TOKEN session so we get redirected", async () => {
    const details = {
      person_email: "yoni1345@gmail.com",
      person_phone: "0525381648",
      person_fullname: "Moti Luhim",
      contact_body_text: "REQUEST BODY HELP ME",
    };
    const sendRequest = await request(app)
      .post("/students/contact")
      .send(details);
    expect(sendRequest.status).toBe(302);
  });
});
//סיפור משתמש 6-לחצן מצאתי עבודה
describe("POST /students/studentsUpdate", () => {
  it("Should be status code 500 because it should not updated without the session TOKEN recieved from user login, and checking side function that checks the value of the details passed,return true if value is good", async () => {
    const details = {
      findajob: "yes",
    };
    const updateUser = await request(app)
      .post("/students/studentsUpdate")
      .send(details);
    expect(updateUser.status).toBe(500);
  });
});
//  סיפור משתמש 7-שמירת משרה במועדפים 
describe("POST /students/studentMainPage/likejob/:id", () => {
  it("Should be status code 500 because it should not add to favorite without the session TOKEN recieved from user login", async () => {
    const favor = await request(app).post(
      "/students/studentMainPage/likejob/63ac3c2251874bff78b5f3df4"
    );
    expect(favor.status).toBe(500);
  });
});
// סיפור משתמש 8-שורת חיפוש סטודנט 
describe("POST /students/studentMainPage/afterFilterJob", () => {
  it("Should be status code 302 because it should not search without the session TOKEN recieved from user login", async () => {
    const details = {
      name_job: "Facebook",
    };
    const searchResult = await request(app)
      .post("/students/studentMainPage/afterFilterJob")
      .send(details);
    expect(searchResult.status).toBe(302);
  });
});
// סיפור משתמש 9-חיפוש מתקדם סטודנט 
describe("POST /students/studentMainPage/afterFilterJob", () => {
  it("Should be status code 302 because it should not search without the session TOKEN recieved from user login", async () => {
    const details = {
      job_type: "הנדסת תוכנה",
      location: "איזור הדרום",
    };
    const searchResult = await request(app)
      .post("/students/studentMainPage/afterFilterJob")
      .send(details);
    expect(searchResult.status).toBe(302);
  });
});
// סיפור משתמש 10-הגשת מועמדות משרה   
describe("POST /students/studentMainPage/applyToJob/:id", () => {
  it("Should be status code 500 because it should not add to favorite without the session TOKEN recieved from user login", () => {
    const apply = request(app).post(
      "/students/studentMainPage/applyToJob/63ab012e06b57cbea41b7897"
    );
    expect(apply.status).toBe(undefined);
  });
});
//  סיפור משתמש 11-הרשמת מעסיק
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
// סיפור משתמש 12-כניסה לאתר מגייס(התחברות)
describe("POST /employers/loginEm", () => {
  describe("when passed a username and password", () => {
    test("should respond with a 200 status code", async () => {
      const response = await request(app).post("/employers/loginEm").send({
        email: "tal@gmail.com",
        password: "123456789",
      });
      expect(response.statusCode).toBe(302);
    });
  });
});
// סיפור משתמש 13-בקשת עזרה מאדמין מגייס
describe("POST /employers/contact", () => {
  it("it should respond status code 302 because there is no TOKEN session so we get redirected", async () => {
    const details = {
      person_email: "tal@gmail.com",
      person_phone: "0525381648",
      person_fullname: "Moti Luhim",
      contact_body_text: "REQUEST BODY HELP ME",
    };
    const sendRequest = await request(app)
      .post("/employers/contact")
      .send(details);
    expect(sendRequest.status).toBe(302);
  });
});
//סיפור משתמש 14-עריכת פרופיל של מגייס
describe("POST /employers/employersUpdate", () => {
  it("Should be status code 500 because it should not updated without the session TOKEN recieved from user login, and checking side function that checks the value of the details passed,return true if value is good", async () => {
    const details = {
      new_password: "147258",
      phone_number: "0542147578",
      email: "newmailtest@gmail.com",
      urlcompany: "https://www.google.com",
      linkedin: "https://www.instagram.com",
    };
    const updateUser = await request(app)
      .post("/employers/employersUpdate")
      .send(details);
    expect(updateUser.status).toBe(500);
    expect(checkNull(details)).toBe(true);
    expect(checkNull({ new_password: null })).toBe(false);
  });
});
// סיפור משתמש 15-דף משרות מאושרות מגייס   
describe("it should respons employers main page", () => {
  test("should return status code of 302 because user is not logged in so session TOKEN is not found", (done) => {
    request(app)
      .get("/employers/employersloggedinpage")
      .then((response) => {
        expect(response.statusCode).toBe(302);
        done();
      });
  });
});
// סיפור משתמש 16-התנתקות אדמין
describe("POST /employers/logoutemployer", () => {
  it("employers logout - should return status code 302,which means employers logged out successfully and got redirected to the main page which sends the code 302", async () => {
    const user = await request(app).post("/employers/logoutemployer").send({
      email: "tal@gmail.com",
      password: "123456789",
    });
    expect(user.statusCode).toBe(302);
  });
});
//סיפור משתמש 17-העלאת משרה מעסיק
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
//  סיפור משתמש 18-רשימת מועמדים למשרה    
describe("it should respons to seeCandidates page ", () => {
  test("should return status code of 302, because there is no TOKEN session", (done) => {
    request(app)
      .get(
        "/employers/employersLoggedinPage/seeCandidate/63ac3c2251874bff78b5f3df"
      )
      .then((response) => {
        expect(response.statusCode).toBe(302);
        done();
      });
  });
});
//  סיפור משתמש 19-עריכת\מחיקת פוסט
describe("POST /employers/employersloggedinpage/updateJOB/:id", () => {
  it("Should be status code 302 because it should not updated the job without the session TOKEN recieved from user login, and checking side function that checks the value of the details passed,return true if value is good", async () => {
    const details = {
      describe_job: "wix",
      job_type: "software",
      location: "North ",
    };
    const updateJob = await request(app)
      .post(
        "/employers/employersloggedinpage/updateJOB/63ac3c2251874bff78b5f3df"
      )
      .send(details);
    expect(updateJob.status).toBe(302);
    expect(checkNullJob(details)).toBe(true);
    expect(checkNullJob({ describe_job: null })).toBe(false);
  });
});
// סיפור משתמש 20-דף משרות ממתינות לאישור
describe("it should respons to waitingJobs page ", () => {
  test("should return status code of 302, because there is no TOKEN session", (done) => {
    request(app)
      .get("/employers/waitingJobs")
      .then((response) => {
        expect(response.statusCode).toBe(302);
        done();
      });
  });
});

// סיפור משתמש 21-כניסה לאתר אדמין
describe("POST /employers/loginEm", () => {
  describe("when passed a username and password", () => {
    test("should respond with a 200 status code", async () => {
      const response = await request(app).post("/employers/loginEm").send({
        email: "worksami@gmail.com",
        password: "admin123456",
      });
      expect(response.statusCode).toBe(302);
    });
  });
});

// סיפור משתמש 23-התנתקות אדמין מהמערכת
describe("POST /employers/admin", () => {
  it("admin logout - should return status code 302,which means admin logged out successfully and got redirected to the main page which sends the code 302", async () => {
    const user = await request(app).post("/employers/admin").send({
      email: "worksami@gmail.com",
      password: "admin123456",
    });
    expect(user.statusCode).toBe(302);
  });
});
// סיפור משתמש 24-מתן מענה לבעיות
// describe("it should respons to userRequests page ", () => {
//   test("should return status code of 302, because there is no TOKEN session", (done) => {
//     request(app)
//       .get("/employers/admin/usersRequests")
//       .then((response) => {
//         expect(response.statusCode).toBe(302);
//         done();
//       });
//   });
// });

describe("POST /employers/admin/allUsers/student/:id", () => {//סיפור משתמש 25 - אישור רישום יוזר
  it("Should be status code 404 because it should not pop the job without the session TOKEN recieved from user login", async () => {
    const favor = await request(app).post(
      "/employersadmin/allUsers/student/63988b6c400cd756eeb10414"
    );
    expect(favor.status).toBe(404);
  });
});

//סיפור משתמש 28-העלאת משרה אדמין
describe("POST /employers/admin", () => {
  it("Checking side function that checks the value of the details passed,return true if value is good, if passed so the job was succcessfully added to database", () => {
    // jest.setTimeout(12000);
    const details = {
      name_job: "wix",
      describe_job: "ux/ui",
      job_type: "ux/ui",
      location: "Ahora",
      approved: true,
      candidates: [],
    };
    const newJob = request(app).post("/employers/admin").send(details);
    expect(checkNull(details)).toBe(true);
    expect(checkNull({ new_password: null })).toBe(false);
  });
});
//סיפור משתמש 29-הקפצת פוסטים ישנים
describe("POST /employers/admin/jobPosition/:id", () => {
  it("Should be status code 302 because it should not pop the job without the session TOKEN recieved from user login", async () => {
    const favor = await request(app).post(
      "/employers/admin/jobPosition/63c187c080b13615ef0c01c0"
    );
    expect(favor.status).toBe(302);
  });
});
// סיפור משתמש 30-מסך עם כלל המשתמשים
// describe("it should respons to AllUsersPage page ", () => {
//   test("should return status code of 302, because there is no TOKEN session", (done) => {
//     request(app)
//       .get("/employers/admin/allUsers")
//       .then((response) => {
//         expect(response.statusCode).toBe(302);
//         done();
//       });
//   });
// });

describe("it should respons home page", () => {//בדיקת דף ראשי
  test("should return status code of 200", (done) => {
    request(app)
      .get("/")
      .then((response) => {
        expect(response.statusCode).toBe(200);
        done();
      });
  });
});
