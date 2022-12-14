const express = require("express");
const router = express.Router();
const employer = require("../../models/employers");

//employers
router.get("/", (req, res) => {
  res.render("./employers/employersPage");
});
router.get("/registerEm", (req, res) => {
  res.render("./employers/employersRegister");
});
router.get("/loginEm", (req, res) => {
  res.render("./employers/employersLogin");
});

router.post("/loginEm", async (req, res) => {
  employer
    .findOne({ email: req.body.email })
    .then((user) => {
      console.log(user.password, req.body.password);
      if (user.password === req.body.password) {
        if (user.isadmin === true) {
          console.log("testadmin");
          res.redirect("/admin");
        } else {
          res.redirect(`/employers/${user._id}`);
        }
      } else {
        res.redirect("/404");
      }
    })
    .catch((err) => {
      console.log(err.message);
    });
});

router.get("/:id", (req, res) => {
  const id = req.params.id;
  res.render("./employers/employersPage", { id: id });
});
module.exports = router;
