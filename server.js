const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
const fs = require('fs'); // To use file system for loading SSL certificate
const path = require('path'); // To handle file paths
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Database connection configuration (with SSL support for Aiven)
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT, // Add this if it's specified in your .env file
    ssl: {
        ca: fs.readFileSync(path.join(__dirname, 'certs', 'ca.pem')), // Path to the .pem certificate
    },
});
// CORS configuration (allowing frontend on Vercel)
const corsOptions = {
    origin: 'https://fsd-task.vercel.app', // Your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
};
app.use(cors(corsOptions));

db.connect((err) => {
    if (err) {
        console.error('MySQL connection error:', err);
        throw err;
    }
    console.log('MySQL connected...');
});

// Endpoint for adding employees
app.post('/api/employees', (req, res) => {
    const {
        name,
        employeeID,
        email,
        phoneNumber,
        age,
        address,
        gender,
        department,
        dateOfJoining,
        role,
    } = req.body;

    const query = `
        INSERT INTO employees (name, employeeID, email, phoneNumber, age, address, gender, department, dateOfJoining, role)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        query,
        [name, employeeID, email, phoneNumber, age, address, gender, department, dateOfJoining, role],
        (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ message: 'Employee ID or Email already exists' });
                }
                return res.status(500).json({ message: err });
            }
            res.status(200).json({ message: 'Employee added successfully' });
        }
    );
});

// Start the server
app.listen(5000, () => {
    console.log('Server running on port 5000');
});




// const express = require('express');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const mysql = require('mysql2');
// require('dotenv').config();
// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// const db = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: 'Naveen123',
//     database: 'employee_db',
// });

// const db = mysql.createConnection({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
// });


// // Replace 'your-frontend-url' with your deployed frontend URL
// const corsOptions = {
//     origin: 'https://fsd-task.vercel.app/',
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     credentials: true,
// };
// app.use(cors(corsOptions));

// db.connect((err) => {
//     if (err) throw err;
//     console.log('MySQL connected...');
// });

// app.post('/api/employees', (req, res) => {
//     const {
//         name,
//         employeeID,
//         email,
//         phoneNumber,
//         age,
//         address,
//         gender,
//         department,
//         dateOfJoining,
//         role,
//     } = req.body;

//     // SQL query for inserting the new form data
//     const query = `
//         INSERT INTO employees (name, employeeID, email, phoneNumber, age, address, gender, department, dateOfJoining, role) 
//         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//     `;

//     db.query(
//         query,
//         [name, employeeID, email, phoneNumber, age, address, gender, department, dateOfJoining, role],
//         (err, result) => {
//             if (err) {
//                 if (err.code === 'ER_DUP_ENTRY') {
//                     return res.status(400).json({ message: 'Employee ID or Email already exists' });
//                 }
//                 return res.status(500).json({ message: err });
//             }
//             res.status(200).json({ message: 'Employee added successfully' });
//         }
//     );
// });

// app.listen(5000, () => console.log('Server running on port 5000'));
