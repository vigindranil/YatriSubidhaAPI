const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const morgan = require('morgan');
const mySqlPool = require('./DbConfiguration/Db');



// configure env
dotenv.config();

// Rest Object
const app = express();

// Configure session middleware
app.use(session({
    secret: 'SecretKey',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set secure: true if using HTTPS
}));

// Middleware to check for expired variables
app.use((req, res, next) => {
    const now = Date.now();
    if (req.session.variables) {
        for (const key in req.session.variables) {
            if (req.session.variables[key].expires < now) {
                delete req.session.variables[key];
            }
        }
    }
    next();
});

// Serve static files from the 'uploads' directory
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));


// Testing......
// app.get('/test-api', (req, res) => {
//     res.send('hello from server............');
// })


//Routes
app.use('/api/user', require('./Routes/UserRoutes'));
app.use('/api/slot', require('./Routes/SlotRoutes'));



// Port
const port = process.env.PORT;


try {
    // Conditionaly Listen
    const connectionVariable = mySqlPool.query('SELECT 1');
    if (connectionVariable) {
        console.log("Database connected");
    }
} catch (error) {
    console.log(error);
}

// Listen
app.listen(port, () => console.log(`Server running at ${port}`))


