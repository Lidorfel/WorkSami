import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
} from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAGiFmbIkyvQW3BbTwTzUzVZYypxFuBczs",
  authDomain: "worksami-webapp.firebaseapp.com",
  projectId: "worksami-webapp",
  storageBucket: "worksami-webapp.appspot.com",
  messagingSenderId: "504692702406",
  appId: "1:504692702406:web:2b3726da185d338afaabc7",
  measurementId: "G-GEN3HE6ZEE",
};
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore();
const studentsRef = collection(db, "Students");
const auth = getAuth();
onSnapshot(studentsRef, (snapshot) => {
  let students = [];
  snapshot.docs.forEach((st) => {
    students.push({ ...st.data(), id: st.id });
  });
  console.log(students);
});
const signUp1 = document.querySelector("#signup1");
if (signUp1) {
  const continue1 = document.getElementById("submit-button1");
  continue1.addEventListener("click", (e1) => {
    // e1.preventDefault();
    const account1 = {};
    account1["fullName"] = signUp1.register_name.value;
    account1["userID"] = signUp1.user_id.value;
    account1["phoneNumber"] = signUp1.phone_pass.value;
    account1["email"] = signUp1.email_pass.value;
    window.localStorage.setItem("account1", JSON.stringify(account1));
  });
}
const signUp2 = document.querySelector("#signup2");
if (signUp2) {
  const continue2 = document.getElementById("submit-button2");
  continue2.addEventListener("click", (e2) => {
    // e2.preventDefault();
    const account2 = {};
    account2["birthDay"] = new Date(signUp2.birthday.value);
    account2["gender"] = signUp2.gender_select.value;
    account2["password"] = signUp2.password.value;
    // account2["passwordAgain"] = signUp2.password_again.value;
    window.localStorage.setItem("account2", JSON.stringify(account2));
  });
}
const signUp3 = document.querySelector("#signup3");
if (signUp3) {
  const continue3 = document.getElementById("submit-button3");
  continue3.addEventListener("click", (e3) => {
    // e3.preventDefault();
    const account3 = {};
    account3["yearStatus"] = signUp3.year_study.value;
    account3["department"] = signUp3.study_profession.value;
    account3["dateStart"] = new Date(signUp3.date_start.value);
    account3["dateEnd"] = new Date(signUp3.date_finish.value);
    account3["grades"] = signUp3.avrage_grade.value;
    const account1 = JSON.parse(window.localStorage.getItem("account1"));
    const account2 = JSON.parse(window.localStorage.getItem("account2"));
    const fullAccount = { ...account1, ...account2, ...account3 };
    console.log(fullAccount);
    createUserWithEmailAndPassword(
      auth,
      fullAccount["email"],
      fullAccount["password"]
    )
      .then((cred) => {
        console.log("user created", cred.user);
        addDoc(studentsRef, fullAccount)
          .then(() => {
            console.log("added successfully");
          })
          .catch((err) => {
            console.log(err.message);
          });
      })
      .catch((err) => {
        console.log(err.message);
      });
  });
}

const login = document.querySelector(".details_login");
if (login) {
  const loginButton = document.querySelector("#login_button");
  loginButton.addEventListener("click", (e) => {
    const email = login.user_email.value;
    const password = login.user_pass.value;
    signInWithEmailAndPassword(auth, email, password)
      .then((cred) => {
        console.log("user logged in successfully", cred.user);
      })
      .catch((err) => {
        console.log(err.message);
        alert("סיסמה/אימייל לא נכונים");
        login.reset();
      });
  });
}
