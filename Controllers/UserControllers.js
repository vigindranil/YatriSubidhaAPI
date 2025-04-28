const db = require("../DbConfiguration/Db");
const JWT = require('jsonwebtoken');
const { sendVerificationEmail } = require("../Helpers/SendMailHelpers");
const uploadFile = require('../Helpers/uploadConfig');
const deleteImage = require("../Helpers/deleteImage");


// const dotenv = require('dotenv');
// // configure env
// dotenv.config();

//Login Otp send Controller
const sendLoginOtpControllers = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.send({
                success: false,
                message: 'Email field cannot be left empty',
            })
        }

        const generateRandomNumber = () => Math.floor(1000 + Math.random() * 9000);
        const otp = generateRandomNumber();

        // Route to set a variable with an expiration time  

        const ttl = 300000;
        const otpExpires = Date.now() + parseInt(ttl);
        const emailExpires = Date.now() + parseInt(ttl);

        if (!req.session.variables) {
            req.session.variables = {};
        }
        req.session.variables["generatedOtp"] = { value: otp, expires: otpExpires };
        req.session.variables["email"] = { value: email, expires: emailExpires };
        // console.log(`Variable ${key} set with value ${value} and TTL ${ttl} ms`);

        res.status(200).send({
            success: true,
            Otp: otp,
        })

        //Send Otp to email 
        sendVerificationEmail(email, otp);

    } catch (error) {
        console.log(error);
        res.status(200).send({
            success: false,
            message: 'Error in send-login-otp API',
            error,
        });
    }
}

//Login Otp verify Controller
const verifyLoginOtpControllers = async (req, res) => {
    try {
        const { enteredOtp } = req.body;
        const key = "generatedOtp";
        // console.log("session data :", req.session.variables);
        if (req.session.variables && req.session.variables[key]) {
            //console.log(`Variable ${key}: ${req.session.variables[key].value}`);
            // console.log(enteredOtp);
            //  console.log(req.session.variables[key].value);
            if (enteredOtp == req.session.variables[key].value) {
                // console.log('Otp verification successfull. Loged in Successfully');

                // Existing Email Check........
                const email = req.session.variables['email'].value;
                const queryExistingUserCheck = `SELECT * FROM users WHERE email='${email}'`;
                const existingUserCheck = await db.query(queryExistingUserCheck);
                //console.log(existingUserCheck[0].length);
                if (existingUserCheck[0].length > 0) {

                    const JWT_SECRET = process.env.JWT_SECRET;
                    // console.log('JWT_Secret', JWT_Secret);
                    const token = await JWT.sign({ _id: existingUserCheck[0][0].id }, JWT_SECRET, { expiresIn: '7d' });
                    return res.status(200).send({
                        success: true,
                        message: 'Carrying Token',
                        token: token
                    });
                }

                const data = await db.query(`INSERT INTO users (email,isActive) VALUES (?,?)`, [email, 1]);
                //  console.log(data);
                if (!data) {
                    return res.send({
                        success: false,
                        message: 'Error in Insert Query',
                    })
                }

                const JWT_SECRET = process.env.JWT_SECRET;
                // console.log('JWT_Secret', JWT_Secret);
                const token = await JWT.sign({ _id: data[0].insertId }, JWT_SECRET, { expiresIn: '7d' });
                return res.status(200).send({
                    success: true,
                    message: 'Carrying Token',
                    data: data,
                    token: token
                });


            } else {
                return res.status(200).send({
                    success: false,
                    message: 'Invalid OTP Entered',
                });
            }

        } else {
            return res.status(200).send({
                success: false,
                message: 'OTP Expired',
            });

        }





    } catch (error) {
        console.log(error);
        res.status(200).send({
            success: false,
            message: 'Error in verify-login-otp api',
            error,
        });
    }
}

//Add profile details Controller
const addProfileDetailsControllers = async (req, res) => {
    try {
        const { name, mobile, email, gender, passport, nationality, address } = req.body;
        // console.log("Details printed", name, mobile, email, passport, nationality, address);

        const data = await db.query(
            `UPDATE users 
             SET name = ?, mobile = ?,gender=?, nationality = ?, passport = ?, address = ? 
             WHERE email = ?`,
            [name, mobile, gender, nationality, passport, address, email]
        );
        const [result] = data;
        console.log(result);
        if (result.affectedRows > 0) {
            // console.log(result);
            return res.status(200).send({
                success: true,
                message: 'Profile Details Updated Successfully',
            })
        }
        return res.status(200).send({
            success: false,
            message: 'Failed To Update Profile Details',
        });

    } catch (error) {
        console.log(error);
        res.status(200).send({
            success: false,
            message: 'Error in add-profile-details api',
            error,
        });
    }
}


//Add Profile Image Controller
const addProfileImageController = async (req, res) => {
    try {
        // Wait for the file to be uploaded
        const file = await uploadFile(req, res);
        const imageFileName = file.filename;
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const { presentProfilePicture } = req.body;
        if (presentProfilePicture) {
            await deleteImage(presentProfilePicture);
        }


        const sql = 'UPDATE users SET image = ? WHERE email = ?';
        const [result] = await db.query(sql, [imageFileName, email]);

        if (result.affectedRows > 0) {
            return res.status(200).json({ success: true, message: 'Profile image uploaded successfully!' });
        } else {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

    } catch (error) {
        console.log("Error: ", error.message || error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

// Delete Profile Image Controller
const deleteProfileImageController = async (req, res) => {
    try {
        const { filename, email } = req.body;
        console.log(filename, email);
        if (!filename) {
            return res.status(400).json({ success: false, message: 'file name is required' });
        }
        const deleteFile = await deleteImage(filename);

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const sql = 'UPDATE users SET image = ? WHERE email = ?';
        const [result] = await db.query(sql, ['', email]);

        if (result.affectedRows > 0) {
            return res.status(200).json({ success: true, message: 'Profile image Deleted successfully!' });
        } else {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

    } catch (error) {
        console.log("Error: ", error.message || error);
        return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
}







//Get profile
const getProfileDetailsController = async (req, res) => {
    try {
        const { email } = req.body;
        const data = await db.query(
            `SELECT * FROM users              
             WHERE email = ? AND isActive = ?`,
            [email, 1]
        );
        console.log(data[0].length > 0);
        const result = data;
        if (data[0].length > 0) {
            // console.log(result);
            return res.status(200).send({
                success: true,
                response: data[0][0],
                message: 'Profile Details Fetched Successfully',
            })
        }
        return res.status(200).send({
            success: false,
            message: 'Failed To Fetched Profile Details',
        });

    } catch (error) {
        console.log(error);
        res.status(200).send({
            success: false,
            message: 'Error in get-profile-details api',
            error,
        });
    }
}


// All Booking History Controller
const indivisualAllBookingHistoryController = async (req, res) => {
    try {
        const { email } = req.body;
        const result = await db.query(`
                    SELECT 
                slotBookingDate, 
                slotBookedOnDate, 
                COUNT(*) AS total_count
            FROM 
                slot_booking_history
            WHERE 
                users_email = ?
            GROUP BY 
                slotBookedOnDate
            ORDER BY 
                slotBookedOnDate DESC;
            `, [email]);

        if (result[0].length > 0) {
            return res.status(200).send({
                success: true,
                isData: true,
                message: 'Booking History fetched successfully',
                result: result[0]
            });
        }

        return res.status(200).send({
            success: true,
            isData: false,
            message: 'No Booking History Found',

        });

    } catch (error) {
        console.log(error);
        res.status(200).send({
            success: false,
            message: 'Error in indivisual-all-booking-history api',
            error,
        });
    }
}

// Specific day booking details
const specifiDayBookingDetailsController = async (req, res) => {
    try {
        const { email, date } = req.body;
        const result = await db.query(`         
            WITH NumberedBookings AS (
    SELECT 
        sbh.*, 
        s.name AS slot_name, 
        s.timing AS slot_timing,
        ROW_NUMBER() OVER (PARTITION BY sbh.slots_id, sbh.slotBookingDate ORDER BY sbh.id ASC) AS serial_number
    FROM 
        slot_booking_history sbh
    JOIN 
        slots s 
    ON 
        sbh.slots_id = s.id
    WHERE 
        sbh.slotBookedOnDate = ?
)
SELECT *
FROM NumberedBookings
WHERE users_email = ?
ORDER BY slots_id, slotBookingDate, serial_number;
      
            
            `, [date, email]);

        if (result[0].length > 0) {
            return res.status(200).send({
                success: true,
                isData: true,
                message: 'Booking History fetched successfully',
                result: result[0],
            });
        }

        return res.status(200).send({
            success: true,
            isData: false,
            message: 'No Booking History Found',

        });

    } catch (error) {
        console.log(error);
        res.status(200).send({
            success: false,
            message: 'Error in specific-day-booking-details api',
            error,
        });
    }
}

module.exports = {
    sendLoginOtpControllers, verifyLoginOtpControllers, indivisualAllBookingHistoryController,
    specifiDayBookingDetailsController, addProfileDetailsControllers, getProfileDetailsController,
    addProfileImageController, deleteProfileImageController
};