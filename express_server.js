const express = require("express");
const app = express();
const PORT = 8080;

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.send("Welcome to HOMEPAGE GRINGO");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
app.get("/urls/:shortURL", (req, res) => {
  console.log(urlDatabase[req.params.shortURL]);
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL] /* What goes here? */,
  };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`TinyApp is listening on port: ${PORT}`);
});
