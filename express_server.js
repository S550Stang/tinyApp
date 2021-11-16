const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const { Template } = require("ejs");
const app = express();
const PORT = 8080;

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

let users = {}; //
////////////////////**helper function */////////
function generateRandomString() {
  ///generate random 6 digit string!
  let r = Math.random().toString(20).substr(2, 6);
  return r;
}

function getUserWithEmail(email) {
  const userKeys = Object.keys(users); //
  console.log("userkeys", userKeys);
  if (userKeys) {
    for (let i of userKeys) {
      // console.log("*******", i + "&&" + users[i]);
      if (email === users[i].email) {
        return users[i];
      }
    }
    return null;
  }
}
function getUserWithId(id) {
  const userKeys = Object.keys(users); //
  console.log("userkeys", userKeys);
  if (userKeys) {
    for (let i of userKeys) {
      // console.log("*******", i + "&&" + users[i]);
      if (id === users[i].id) {
        return users[i];
      }
    }
    return null;
  }
}
app.use(morgan("dev"));
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
// root path
app.get("/", (req, res) => {
  res.redirect("/urls");
});

///////////////////**Login functionalities */////////////

// POST LOGIN ROUTE                                             ******************************
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const userValue = getUserWithEmail(username);
  if (userValue) {
    if (userValue.password === password) {
      res.cookie("user_id", userValue.id);
      res.redirect("/urls");
    } else {
      return res.status(403).send("Password Not Correct!");
    }
  } else {
    return res.status(403).send("Email Not Found!");
  }
});

app.get("/login", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: getUserWithId(req.cookies.user_id),
  };
  res.render("login", templateVars);
});

//Logout*****************************
app.get("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

//Register***************************
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (email === "" || password === "") {
    return res.status(400).send("Email And Password Cant Be Blank!");
  }
  if (getUserWithEmail(email)) {
    return res.status(400).send("Email Already Exists!");
  }
  console.log("entering create user", email, password);
  const randomID = generateRandomString();
  users[`${randomID}`] = {
    id: randomID,
    email: email,
    password: password,
  };
  const cookieId = randomID;
  console.log("creating cookie", cookieId);
  res.cookie("user_id", cookieId);
  console.log("userdb", users);
  return res.redirect("/urls");
});

//////////////////**Start Crud Op *////////////////////

//Create New Url**************************
app.post("/urls", (req, res) => {
  let randomString = generateRandomString();
  urlDatabase[randomString] = req.body.longURL;
  res.redirect(`/urls/${randomString}`);
});
// get part of new
app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: getUserWithId(req.cookies.user_id),
  };
  res.render("urls_new", templateVars);
});
//View urls****************************
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: getUserWithId(req.cookies.user_id),
  };
  res.render("urls_show", templateVars);
});
//Update*****************************
app.post("/urls/:shortURL/update", (req, res) => {
  console.log("update code", req.params.shortURL);
  res.redirect(`/urls/${req.params.shortURL}`);
});

//Delete existing url
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});
/**End Crud op */

/////////////**Redirecting functionalities**////////////////

//Redirecting to List of urls *********
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: getUserWithId(req.cookies.user_id),
  };

  res.render("urls_index", templateVars);
});
//Redirecting to create page or Edit page*
app.post("/urls/:shortURL", (req, res) => {
  const templateVars = { urls: urlDatabase };
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect(`/urls`);
});

//Redirecting to create new page**********

//Redirecting LongUrl location***********
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});
app.get("/register", (req, res) => {
  //res.clearCookie("username");
  res.render("register");
});
app.listen(PORT, () => {
  console.log(`TinyApp is listening on port: ${PORT}`);
});

//
