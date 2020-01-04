const express = require('express');
const env = require('dotenv').config();
const cors = require('cors');
const helmet = require('helmet');
const fetch = require('node-fetch');
const async = require('express-async-await');
const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

const {
    CAPTCHA_URL,
    CAPTCHA_PORT,
    CAPTCHA_SECRET
} = env.parsed;

app.post('/auth', async (req, res) => {
    const reply = await fetch(CAPTCHA_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `secret=${CAPTCHA_SECRET}&response=${req.body.token}`
    });
    const data = await reply.json();
    console.log(data);
    res.send(data);
});

app.listen(CAPTCHA_PORT || 5000, () => console.log('Connected on port ' + CAPTCHA_PORT))