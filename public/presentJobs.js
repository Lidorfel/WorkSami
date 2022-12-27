// const db = require("../app").db;
// const jobsCol = db.collection("jobs");
// jobsCol.find().toArray((err, jobs) => {
//   console.log(jobs);

// });
let responseClone;
fetch("http://localhost:3000/employers/admin")
  //   .then((response) => {
  //     return response.json();
  //   })
  .then(function (response) {
    responseClone = response.clone(); // 2
    return response.json();
  })
  .then(
    function (data) {
      console.log(data);
    },
    function (rejectionReason) {
      // 3
      console.log(
        "Error parsing JSON from response:",
        rejectionReason,
        responseClone
      ); // 4
      responseClone
        .text() // 5
        .then(function (bodyText) {
          console.log(
            "Received the following instead of valid JSON:",
            bodyText
          ); // 6
        });
    }
  )

  .catch((err) => {
    console.log(err);
  });

// console.log("ldir   ");
// let fb = "facebook";
// let test = document.querySelector(".jobs");
// test.innerHTML = `<div class="works">
// <div class="up_part">
//   <h1 name="name_job" id="name_job">${jobs[i].name}</h1>
//   <button name="edit_job" id="edit_job">
//     <i class="bi bi-pencil-square"></i>
//   </button>
//   <button name="deleate_job" id="deleate_job">
//     <i class="bi bi-trash-fill"></i>
//   </button>
// </div>
// <div class="middle_part">
//   <label>תיאור המשרה:</label>
//   <p id="job-description">תיאור המשרה היא..</p>
//   <label>תחום עיסוק:</label>
//   <p id="job_type" class="job_type">תחום העיסוק הוא......</p>
//   <label>מיקום:</label>
//   <p id="job_loction" class="job_loction">מיקום העבודה היא...</p>
// </div>
// <div class="bottom_part">
//   <button class="see_candidates">ראה מועמדים</button>
//   <button id="icon_linkdin" class="icon_buttons">
//     <i class="bi bi-linkedin"></i>
//   </button>
//   <button id="home_page_web" class="icon_buttons">
//     <i class="bi bi-house-door-fill"></i>
//   </button>
// </div>
// </div>`;
