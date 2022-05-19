const nodemailer = require("nodemailer");
require("dotenv").config();

/**********************************//* contact via mail *//*****************************/

const contactMail = async(mailTo, body, subject)=> {
    return new Promise((resolve,reject)=>{

        // Create a SMTP transporter object
        let transporter = nodemailer.createTransport({
            service: process.env.SERVICE,
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT ,
            secure: false,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        // Message object
        let message = {
            from: `PDF Security<${process.env.EMAIL}>`,
            to: mailTo,
            subject: subject,
            html: body
        };

        transporter.sendMail(message, (err, info) => {
            if (err) {
                console.log("Error occurred. " + err.message);
                return reject({
                    sent: false,
                    message: err.message
                });
            }
            console.log("Message sent: %s", info.messageId);
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
            return resolve({
                sent: true,
                message: `mail send suessfully ${info.messageId}`
            });
        });
    });
};

module.exports = { contactMail };