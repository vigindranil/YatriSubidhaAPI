const db = require("../DbConfiguration/Db");

// Book Slot Controller
const bookSlotController = async (req, res) => {
    try {

        // Data to be inserted
        const data = req.body.bookingDetails;

        // Function to get slot details for particular date
        const slotDetails = async () => {
            const slotBookingDate = data[0].slotBookingDate;
            const slots_id = data[0].slots_id;
            // const query = `SELECT * FROM slot_booking_history WHERE slotBookingDate='${slotBookingDate}' AND slots_id='${slots_id}'`;
            const query = `SELECT 
                            slot_booking_history.id, 
                            slot_booking_history.users_email, 
                            slot_booking_history.name AS user_name, 
                            slot_booking_history.mobile, 
                            slot_booking_history.email, 
                            slot_booking_history.nationality, 
                            slot_booking_history.passportNumber, 
                            slot_booking_history.address, 
                            slot_booking_history.slotBookingDate, 
                            slot_booking_history.slots_id, 
                            slot_booking_history.isActive, 
                            slots.capacity, 
                            slots.timing, 
                            slots.name AS slot_name 
                        FROM 
                            slot_booking_history 
                        JOIN 
                            slots ON slot_booking_history.slots_id = slots.id 
                        WHERE 
                            slot_booking_history.slotBookingDate = '${slotBookingDate}' 
                            AND slot_booking_history.slots_id = '${slots_id}';
                        `;
            try {
                const [results] = await db.query(query);
                console.log(results);
                return results;
            } catch (error) {
                console.error('Error in fetching slot details:', error);
                throw error;
            }
        }

        const bookedSlotDetails = await slotDetails();
        // console.log(bookedSlotDetails[0].capacity);
        if (bookedSlotDetails.length != 0) {
            if (bookedSlotDetails.length + data.length > bookedSlotDetails[0].capacity) {
                return res.status(200).send({
                    success: false,
                    message: 'This slot is either fully booked or cannot accommodate the number of persons entered.',
                });
            }
        }



        // Function to insert data into the database

        const insertData = async (item) => {
            // Get the current UTC timestamp
            //const utcTimestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
            const utcTimestamp = new Date().toISOString();
            const query = `
                INSERT INTO slot_booking_history
                (users_email, name, mobile, email, nationality, passportNumber, address, slotBookingDate, slotBookedOnDate, slots_id, isActive)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const values = [
                item.users_email, item.name, item.mobile, item.email, item.nationality,
                item.passportNumber, item.address, item.slotBookingDate, utcTimestamp, item.slots_id, item.isActive
            ];

            try {
                const [results] = await db.query(query, values);
                console.log('Inserted data with ID:', results.insertId);
            } catch (error) {
                console.error('Error inserting data:', error);
                throw error;  // Throw error to be caught in the main function
            }
        };


        // const insertData = async (item) => {
        //     const query = `
        //         INSERT INTO slot_booking_history
        //         (users_email, name, mobile, email, nationality, passportNumber, address, slotBookingDate, slotBookedOnDate, slots_id, isActive)
        //         VALUES (?, ?, ?, ?, ?, ?, ?, ?, UTC_TIMESTAMP(), ?, ?)
        //     `;
        //     const values = [
        //         item.users_email, item.name, item.mobile, item.email, item.nationality,
        //         item.passportNumber, item.address, item.slotBookingDate, item.slots_id, item.isActive
        //     ];

        //     try {
        //         const [results] = await db.query(query, values);
        //         console.log('Inserted data with ID:', results.insertId);
        //     } catch (error) {
        //         console.error('Error inserting data:', error);
        //         throw error;  // Throw error to be caught in the main function
        //     }
        // };


        // const insertData = async (item) => {
        //     const query = `
        //         INSERT INTO slot_booking_history
        //         (users_email, name, mobile, email, nationality, passportNumber, address, slotBookingDate, slotBookedOnDate, slots_id, isActive)
        //         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)
        //     `;
        //     const values = [
        //         item.users_email, item.name, item.mobile, item.email, item.nationality,
        //         item.passportNumber, item.address, item.slotBookingDate, item.slots_id, item.isActive
        //     ];

        //     try {
        //         const [results] = await db.query(query, values);
        //         console.log('Inserted data with ID:', results.insertId);
        //     } catch (error) {
        //         console.error('Error inserting data:', error);
        //         throw error;  // Throw error to be caught in the main function
        //     }
        // };

        // insertDataMain function to handle the insertion process
        const insertDataMain = async () => {
            for (const item of data) {
                await insertData(item);
            }
        };


        // Execute the insertDataMain function
        await insertDataMain();
        return res.status(200).send({
            success: true,
            message: 'Slot booked successfully'
        });




    } catch (error) {
        console.error(error);
        res.status(200).send({
            success: false,
            message: 'Error in booking slots',
            error,
        });
    }
};


// Datewise slot Details Controller
const datewiseSlotDetailsController = async (req, res) => {
    const date = req.body.intendedBookingDate;
    const query = `
                    SELECT 
                    s.id,
                    s.name,
                    s.timing,
                    s.capacity,
                    s.isActive,
                    COUNT(sb.slots_id) AS slot_count
                FROM 
                    slots s
                LEFT JOIN 
                    slot_booking_history sb
                ON 
                    s.id = sb.slots_id AND sb.slotBookingDate = '${date}'
                GROUP BY 
                    s.id, s.name, s.timing, s.capacity, s.isActive;
                     `;
    try {
        const [results] = await db.query(query);
        return res.status(200).send({
            success: true,
            message: 'Slot booked successfully',
            data: results
        });
    } catch (error) {
        console.error('Error inserting data:', error);
        throw error;  // Throw error to be caught in the main function
    }

}

module.exports = { bookSlotController, datewiseSlotDetailsController };
