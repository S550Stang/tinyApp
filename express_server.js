const express = require("express");
const app = express();
const PORT = 8080;

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// this send you to the home page and its path is defaulted to /
app.get("/", (req, res) => {
  res.send("Welcome to HOMEPAGE GRINGO");
});

app.listen(PORT, () => {
  console.log(`TinyApp is listening on port: ${PORT}`);
});
