const nodeMailer = require('nodemailer');

// Function to send Verification Email to the user
const sendVerificationEmail = async (email, otp) => {
    // Create a nodemailer transport
    const transporter = nodeMailer.createTransport({
        // configure the email service
        service: 'gmail',
        auth: {
            user: "pphighcourtkolkata@gmail.com",
            pass: 'yvdf hunm mvjr wyxf',
        }
    })
    //compose the Email Message
    const mailOptions = {
        from: 'Yatri Subidha',
        to: email,
        subject: "Email Verification",
        text: `Your One time Password is ${otp}`
    }

    //send the email 
    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.log('Error sending verificaion email', error);
    }
}

module.exports = { sendVerificationEmail };