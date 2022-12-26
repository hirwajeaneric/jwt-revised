require('dotenv').config();

const express = require('express');
const users = require('./data/users');
const refreshTokens = require('./data/refreshTokens');
const app = express();
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

app.use(bodyParser.json());

app.post('/login', (req, res) => {
    //Read username and password from request body
    const { username, password } = req.body;
    
    //Filter user from the users array by username and password
    const user = users.find(u=> {
        return u.username === username && u.password === password
    })

    if (user) {
        //Generate an access token and refresh token
        const accessToken = jwt.sign({ username: user.username, role: user.role}, process.env.ACCESSTOKENSECRET, { expiresIn: '30s' })
        const refreshToken = jwt.sign({ username: user.username, role: user.role }, process.env.REFRESHTOKENSECRET);

        refreshTokens.push(refreshToken);

        res.json({
            accessToken,
            refreshToken
        })
    } else {
        res.send('Username or password incorrect');
    }
})

app.post('/token', (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.sendStatus(401);
    }

    if (!refreshTokens.includes(token)) {
        return res.sendStatus(403);
    }

    jwt.verify(token, process.env.REFRESHTOKENSECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }

        const accessToken = jwt.sign({ username: user.username, role: user.role }, process.env.ACCESSTOKENSECRET, { expiresIn: '30s' });

        res.json({
            accessToken
        })
    })
})

app.post('/logout', (req, res) => {
    const { token } = req.body;
    refreshTokens = refreshTokens.filter(token => t !== token);
    
    res.send("Logout successful")
})

const port = 4000;

app.listen(port, ()=>{
    console.log(`Authentication service started on port ${port}`);
})