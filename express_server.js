const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const { Template } = require("ejs");
const app = express();
const PORT = 8080;
//----------------------REQUIRING LIBRARIES-----------------------------//
app.use(morgan("dev"));
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
  })
);
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

//----------------------SETTING DATABASES-----------------------------//
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

let users = {};

///---------HELPER FUNCTION TO GENERATE A RANDOM STRING---------------------------//

function generateRandomString() {
  ///generate random 6 digit string!
  let r = Math.random().toString(20).substr(2, 6);
  return r;
}

///----------HELPER FUNCTION TO FILTER URLS FOR THE USER-----------------------//

function filterUrlsForUser(userId) {
  const urlsObj = {};
  for (let i in urlDatabase) {
    console.log("im here ------>", urlDatabase[i]);
    if (userId === urlDatabase[i]["userID"]) {
      urlsObj[i] = urlDatabase[i];
    }
  }
  return urlsObj;
}

///-------HELPER FUNCTION TO GET THE USER WITH EMAIL-----------------------------//

function getUserWithEmail(email) {
  const userKeys = Object.keys(users);
  if (userKeys) {
    for (let i of userKeys) {
      if (email === users[i].email) {
        return users[i];
      }
    }
    return null;
  }
}

///----------------HELPER FUNCTION TO GET THE USER WITH ID-----//

function getUserWithId(id) {
  const userKeys = Object.keys(users);
  if (userKeys) {
    for (let i of userKeys) {
      if (id === users[i].id) {
        return users[i];
      }
    }
    return null;
  }
}

///----------------SETTING ROOT ROUTE-----------------------------//

app.get("/", (req, res) => {
  res.redirect("/urls");
});

///-------------------------LOGIN FUNCTIONALITIES -----------------------------//

///-----------POST LOGIN ROUTE-----------------------------//

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const userValue = getUserWithEmail(username);
  if (userValue) {
    if (bcrypt.compareSync(password, userValue.password)) {
      req.session.user_id = userValue.id;
      res.redirect("/urls");
    } else {
      return res.status(403).send("Password Not Correct!");
    }
  } else {
    return res.status(403).send("Email Not Found!");
  }
});

///-----------GET LOGIN ROUTE-----------------------------//

app.get("/login", (req, res) => {
  const templateVars = {
    user: getUserWithId(req.session.user_id),
  };
  res.render("login", templateVars);
});

///-----------GET LOGOUT ROUTE-----------------------------//
app.get("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

///-----------POST REGISTER ROUTE-----------------------------//
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (email === "" || password === "") {
    return res.status(400).send("Email And Password Cant Be Blank!");
  }
  if (getUserWithEmail(email)) {
    return res.status(400).send("Email Already Exists!");
  }
  const randomID = generateRandomString();
  users[`${randomID}`] = {
    id: randomID,
    email: email,
    password: bcrypt.hashSync(password, 10),
  };
  const cookieId = randomID;
  req.session.user_id = cookieId;
  return res.redirect("/urls");
});

///-----------STARTING CRUD OPERATIONS-----------------------------//

///-----------POST /URLS ROUTE-----------------------------//
app.post("/urls", (req, res) => {
  let randomString = generateRandomString();
  if (req.session.user_id) {
    urlDatabase[randomString] = {
      longURL: req.body.longURL,
      userID: req.session.user_id,
    };
    res.redirect(`/urls/${randomString}`);
  } else {
    return res.status(401).send("You Are Not Logged In!");
  }
});

///-----------GET /URLS/NEW ROUTE-----------------------------//

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: getUserWithId(req.session.user_id),
  };
  if (templateVars.user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

///-----------GET /URLS/:SHORTURL ROUTE (PARAMS)-----------------------------//

app.get("/urls/:shortURL", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    const templateVars = {
      longURL: urlDatabase[req.params.shortURL].longURL,
      shortURL: req.params.shortURL,
      user: getUserWithId(req.session.user_id),
    };
    return res.render("urls_show", templateVars);
  } else if (req.session.user_id) {
    return res.status(403).send("Invalid User For This ShortURL!");
  }
  return res.status(401).send("Need To Login To View ShortURL'S");
});

//--POST /URLS/:SHORTURL/DELETE ROUTE (DELETE AN EXISTING URL FROM THE DATABASE)--//

app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect(`/urls`);
  } else if (req.session.user_id) {
    res.status(403).send("Invalid User For This ShortURL!");
  }
  return res.status(401).send("Need To Login To View ShortURLS");
});

///-----------END OF CRUD OPERATIONS-----------------------------//

///-----------REDIRECTING FUNCTIONALITIES-----------------------------//

///-----------GET /URLS ROUTE  -----------------------------//
app.get("/urls", (req, res) => {
  if (req.session.user_id) {
    const templateVars = {
      urls: filterUrlsForUser(req.session.user_id),
      user: getUserWithId(req.session.user_id),
    };
    return res.render("urls_index", templateVars);
  }
  return res.status(401).send("You Need To Login To View The ShortURL'S");
});

///-----------POST /URLS/:SHORTURL ROUTE (PARAMS) CREATING A URL------//

app.post("/urls/:shortURL", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    return res.redirect(`/urls`);
  } else if (req.session.user_id) {
    return res.status(403).send("Invalid User For This ShortURL!");
  }
  return res.status(401).send("Need To Login To View ShortURL'S");
});

///--GET /U/:SHORTURL ROUTE (REDIRECTING TO URL)----------//

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (longURL) {
    const url = longURL.longURL;
    return res.redirect(url);
  }
  return res.status(404).send("Invalid ShortURL");
});

///-----------GET /REGISTER ROUTE (RENDERING REGISTER EJS)-----//

app.get("/register", (req, res) => {
  res.render("register");
});

///-----------TinyApp is listening on port: ${PORT}-----------------------------//
app.listen(PORT, () => {
  console.log(`TinyApp is listening on port: ${PORT}`);
});
