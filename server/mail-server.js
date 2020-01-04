const {
    body,
    validationResult,
} = require('express-validator');
const env = require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const nodeMailer = require('nodemailer');
const helmet = require('helmet');
const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_PW,
    SMTP_USER,
    MAIL_PORT
} = env.parsed;

app.use(helmet());
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"]
    }
}))
app.use(cors());

app.use(express.json());
app.post('/send-mail', [body('firstname').isLength({
    min: 3
}).withMessage('Must be at least 3 characters').escape().trim(), body('lastname').isLength({
    min: 3
}).withMessage('Must be at least 3 characters').escape().trim(), body('subject').isLength({
    min: 3
}).withMessage('Must be at least 3 characters').escape().trim(), body('email').isEmail({
    min: 3
}).withMessage('Must be at least 3 characters').normalizeEmail(), body('message').isLength({
    min: 3
}).withMessage('Must be at least 3 characters').escape().trim(), ], async (req, res) => {

    if(validationResult(req).errors[0]) {
        const errs = [];
        for(let err of validationResult(req).errors) {
            errs.push({
                field: err.param,
                error: err.msg
            });
        }
        return res.send(errs);
    }

    const {
        firstname,
        lastname,
        subject,
        email,
        message
    } = req.body;
    const mailerOptions = {
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: true,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PW
        }
    }
    const transporter = nodeMailer.createTransport(mailerOptions);
    const messageOptions = {
        to: 'iamjustp@gmail.com',
        from: SMTP_USER,
        replyTo: email,
        subject: subject,
        text: firstname + '\n' + lastname + '\n' + message,
        html: firstname + '\n' + lastname + '\n' + message
    };
    transporter.sendMail(messageOptions, (err, info) => {
        if (err) return console.log(err);
        return res.send({success: info.response});
    });
});

app.listen(MAIL_PORT || 8080, () => console.log('Mail server connected on 8080'));