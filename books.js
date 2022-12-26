require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const books = require('./data/books');

const app = express();

app.use(bodyParser.json());

const authenticationJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token  = authHeader.split(' ')[1];

        jwt.verify(token, process.env.ACCESSTOKENSECRET, (err, user) => {
            if (err) {
                return res.sendStatus(403)
            }

            req.user = user;
            next();
        })
    } else {
        res.sendStatus(401);
    }
};

app.get('/books', authenticationJWT, (req, res)=> {
    res.json(books);
})

app.post('/books', authenticationJWT, (req,res) => {
    const { role } = req.user;

    if (role !== 'admin') {
        return res.sendStatus(403);
    }

    const book = req.body;
    books.push(book);

    res.send('Book added successfully');
})

const port = 4040;

app.listen(port, ()=> {
    console.log(`Books service started on port ${port}`);
})