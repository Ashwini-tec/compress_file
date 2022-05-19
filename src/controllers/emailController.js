require("dotenv").config();
const mailer = require("../../utils/mail");

/********************* send email **************** */
const sendEmail = async(req, res)=>{
    try {
        const mailTo = req.body.email;
        const body = req.body.body;
        const subject = req.body.subject;
        let mail = await mailer.contactMail(mailTo, body, subject);
        if(mail.sent){
            return res.status(200).send({ Message: mail.message });
        }
        return res.status(400).send({ Message: mail.message });
    } catch (error) {
        res.status(500).send({ Error: error });
    }
};

module.exports = { sendEmail };
