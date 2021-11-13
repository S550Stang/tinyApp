// if user is logged in:
// (Minor) redirects to /urls
// if user is not logged in:
// returns HTML with:
// a form which contains:
// input fields for email and password
// submit button that makes a POST request to /login
//login
/*app.post("/:loginStatus", (req, res) => {
  let user = req.body.username;

  if (req.params.loginStatus === "login") {
    //checking if

    if (user === loginDatabase.username) {
      res.cookie("username", user);
      return res.redirect(`/urls`);
    } else {
      //
      console.log(req.body.username, req.body.user, req.body.password);
      return res.render("details"); //redirecting to details
    }
  } else if (req.params.loginStatus === "logout") {
    //logout

  } else {
    loginDatabase[req.body.user] = req.body.user;
    loginDatabase["password1"] = req.body.password;
    console.log(loginDatabase);
    return res.redirect(`/login`);

    // res.redirect("https://i.stack.imgur.com/6M513.png")
  }
});

//logout
app.post("/logout", (req, res) => {
  res.redirect(`/urls`);
});*/
