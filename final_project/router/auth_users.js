const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }}

const authenticatedUser = (username,password)=>{ //returns boolean
// Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }
    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });
        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const reviewText = req.body.review;
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;
    let updated = false;
    const review = {
        "review" : reviewText,
        "username" : username
    };
    const reviews = books[isbn].reviews;
    Object.keys(books[isbn].reviews).forEach(review => {
        if (reviews[review]!= null && reviews[review].username === username){
            reviews[review].review = reviewText;
            updated = true;
        }
      });
    const reviewsList = [books[isbn].reviews];
    if (!updated){
        reviewsList.push(review);
        books[isbn].reviews = reviewsList;
    }
    res.send(books[isbn]);  
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;
    const reviews = books[isbn].reviews;
    Object.keys(reviews).forEach(review => {
        if (reviews[review]!= null && reviews[review].username === username){
            reviews.splice(review, 1);
        }
      });
    books[isbn].reviews = reviews;
    res.send(books[isbn]); 
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
