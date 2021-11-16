const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const { Template } = require("ejs");
const app = express();
const PORT = 8080;

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

let users = {}; //

////////////////////**helper function */////////
function generateRandomString() {
  ///generate random 6 digit string!
  let r = Math.random().toString(20).substr(2, 6);
  return r;
}
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
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
  })
);
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

app.get("/login", (req, res) => {
  const templateVars = {
    user: getUserWithId(req.session.user_id),
  };
  res.render("login", templateVars);
});

//Logout*****************************
app.get("/logout", (req, res) => {
  req.session = null;
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
    password: bcrypt.hashSync(password, 10),
  };
  const cookieId = randomID;
  console.log("creating cookie", cookieId);
  req.session.user_id = cookieId;
  console.log("userdb", users);
  return res.redirect("/urls");
});

//////////////////**Start Crud Op *////////////////////

//Create New Url**************************
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
// get part of new
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
//View urls****************************
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

//Delete existing url
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect(`/urls`);
  } else if (req.session.user_id) {
    res.status(403).send("Invalid User For This ShortURL!");
  }
  return res.status(401).send("Need To Login To View ShortURL'S");
});
/**End Crud op */

/////////////**Redirecting functionalities**////////////////

//Redirecting to List of urls *********
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
//Redirecting to create page or Edit page*
app.post("/urls/:shortURL", (req, res) => {
  console.log(urlDatabase);
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;

    return res.redirect(`/urls`);
  } else if (req.session.user_id) {
    return res.status(403).send("Invalid User For This ShortURL!");
  }
  return res.status(401).send("Need To Login To View ShortURL'S");
});

//Redirecting to create new page**********

//Redirecting LongUrl location***********
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (longURL) {
    const url = longURL.longURL;
    return res.redirect(url);
  }
  return res.status(404).send("Invalid ShortURL");
});
app.get("/register", (req, res) => {
  //res.clearCookie("username");
  res.render("register");
});
app.listen(PORT, () => {
  console.log(`TinyApp is listening on port: ${PORT}`);
});

//
