const env = require('dotenv').config();
const express = require('express');
const expressFormidable = require('express-formidable');
const app = express();
const cors = require('cors');
const nodeMailer = require('nodemailer');
const {SMTP_HOST, SMTP_PORT, SMTP_PW, SMTP_USER, MAIL_PORT} = env.parsed;
app.use(cors());

app.use(expressFormidable());

app.post('/send-mail', (req,res) => {
    const { firstname, lastname, subject, email, message } = req.fields;

    
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
        from: email,
        replyTo: email,
        subject: subject,
        text: firstname + '\n' + lastname + '\n' + message,
        html: firstname + '\n' + lastname + '\n' + message
    };
    transporter.sendMail(messageOptions, (err, info) => {
        if (err) return console.log(err);
        console.log(info);
        return res.send({data: info});
    });
});

app.listen(MAIL_PORT || 8080, () => console.log('Mail server connected on 8080'));