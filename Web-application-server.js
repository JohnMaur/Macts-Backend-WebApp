const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');  // Import jsonwebtoken
const cors = require('cors');
const moment = require('moment');
require('dotenv').config();

const app = express();

// Create a connection pool to the MySQL database
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT, // if you have DB_PORT in .env
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME  // Update to use DB_NAME instead of DB_DATABASE
});

// Middleware to parse JSON requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Enable CORS
app.use(cors({
  cors: {
    origin: "*",
  }
}));

// --------------------ADMIN and Dashboard API---------------------
// Route to handle admin login
const SECRET_KEY = 'your_secret_key';

app.post('/admin', (req, res) => {
  const { admin_username, admin_password } = req.body;

  // Check if admin credentials are provided
  if (!admin_username || !admin_password) {
    return res.status(400).json({ error: 'Admin username and password are required' });
  }

  // Get a connection from the pool
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to database:', err);
      return res.status(500).json({ error: 'Database connection error' });
    }

    // Perform the database query to authenticate admin
    connection.query(
      'SELECT * FROM admin_login WHERE admin_username = ? AND admin_password = ?',
      [admin_username, admin_password],
      (error, results) => {
        // Release the connection
        connection.release();

        if (error) {
          console.error('Error fetching data:', error);
          return res.status(500).json({ error: 'Error fetching data' });
        }

        // Check if admin exists and credentials match
        if (results.length === 0) {
          // No admin found or incorrect credentials
          return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Admin authenticated successfully, generate a token
        const token = jwt.sign({ username: admin_username }, SECRET_KEY, { expiresIn: '30d' });
        res.status(200).json({ token });
      }
    );
  });
});

// --------------------Faculty Registration---------------------------
app.post('/teacherSignUp', (req, res) => {
  // Extract user data from the request body
  const { username, password, email } = req.body;

  // Get a connection from the pool
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to database:', err);
      return res.status(500).json({ error: 'Database connection error' });
    }

    // Insert the user data into the database
    const sql = "INSERT INTO teacher_login (teacher_user, teacher_pass, teacher_email) VALUES (?, ?, ?)";
    connection.query(sql, [username, password, email], (error, result) => {
      // Release the connection
      connection.release();

      if (error) {
        console.error('Error signing up:', error);
        return res.status(500).json({ error: 'Error signing up' });
      }

      // Send a success response
      res.status(200).json({ message: 'User signed up successfully' });
    });
  });
});

app.post('/registrarSignUp', (req, res) => {
  // Extract user data from the request body
  const { username, password, email } = req.body;

  // Get a connection from the pool
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to database:', err);
      return res.status(500).json({ error: 'Database connection error' });
    }

    // Insert the user data into the database
    const sql = "INSERT INTO registrar_login (registrar_user, registrar_pass, registrar_email) VALUES (?, ?, ?)";
    connection.query(sql, [username, password, email], (error, result) => {
      // Release the connection
      connection.release();

      if (error) {
        console.error('Error signing up:', error);
        return res.status(500).json({ error: 'Error signing up' });
      }

      // Send a success response
      res.status(200).json({ message: 'User signed up successfully' });
    });
  });
});

app.post('/LibrarianSignUp', (req, res) => {
  // Extract user data from the request body
  const { username, password, email } = req.body;

  // Get a connection from the pool
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to database:', err);
      return res.status(500).json({ error: 'Database connection error' });
    }

    // Insert the user data into the database
    const sql = "INSERT INTO librarian_login (librarian_user, librarian_pass, librarian_email) VALUES (?, ?, ?)";
    connection.query(sql, [username, password, email], (error, result) => {
      // Release the connection
      connection.release();

      if (error) {
        console.error('Error signing up:', error);
        return res.status(500).json({ error: 'Error signing up' });
      }

      // Send a success response
      res.status(200).json({ message: 'User signed up successfully' });
    });
  });
});

app.post('/GymSignUp', (req, res) => {
  // Extract user data from the request body
  const { username, password, email } = req.body;

  // Get a connection from the pool
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to database:', err);
      return res.status(500).json({ error: 'Database connection error' });
    }

    // Insert the user data into the database
    const sql = "INSERT INTO gym_login (gym_user, gym_pass, gym_email) VALUES (?, ?, ?)";
    connection.query(sql, [username, password, email], (error, result) => {
      // Release the connection
      connection.release();

      if (error) {
        console.error('Error signing up:', error);
        return res.status(500).json({ error: 'Error signing up' });
      }

      // Send a success response
      res.status(200).json({ message: 'User signed up successfully' });
    });
  });
});

app.post('/GuardSignUp', (req, res) => {
  // Extract user data from the request body
  const { username, password, email } = req.body;

  // Check if username already exists
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to database:', err);
      return res.status(500).json({ error: 'Database connection error' });
    }

    const checkUsernameQuery = "SELECT COUNT(*) AS count FROM guard_login WHERE guard_user = ?";
    connection.query(checkUsernameQuery, [username], (error, results) => {
      if (error) {
        connection.release();
        console.error('Error checking username:', error);
        return res.status(500).json({ error: 'Error checking username' });
      }

      const usernameExists = results[0].count > 0;

      if (usernameExists) {
        connection.release();
        return res.status(400).json({ error: 'Your username is already taken, please try again' });
      }

      // Proceed with signup
      const insertUserQuery = "INSERT INTO guard_login (guard_user, guard_pass, guard_email) VALUES (?, ?, ?)";
      connection.query(insertUserQuery, [username, password, email], (insertError, result) => {
        connection.release(); // Release the connection

        if (insertError) {
          console.error('Error signing up:', insertError);
          return res.status(500).json({ error: 'Error signing up' });
        }

        // Send success response
        res.status(200).json({ message: 'User signed up successfully' });
      });
    });
  });
});

// -------------------------Faculty Login API--------------------------
app.post('/faculty', (req, res) => {
  const { faculty_user, faculty_pass } = req.body;

  // Check if Faculty credentials are provided
  if (!faculty_user || !faculty_pass) {
    return res.status(400).json({ error: 'Faculty username and password are required' });
  }

  // Get a connection from the pool
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to database:', err);
      return res.status(500).json({ error: 'Database connection error' });
    }

    // Perform the database query to authenticate faculty
    connection.query('SELECT * FROM teacher_login WHERE teacher_user = ? AND teacher_pass = ?', [faculty_user, faculty_pass], (error, teacherResults) => {
      if (error) {
        console.error('Error fetching data:', error);
        connection.release();
        return res.status(500).json({ error: 'Error fetching data' });
      }

      if (teacherResults.length > 0) {
        const teacher = teacherResults[0];
        const token = jwt.sign({ username: faculty_user, userType: 'teacher', userId: teacher.teacher_id }, SECRET_KEY, { expiresIn: '30d' });
        res.status(200).json({ token, userType: 'teacher', userId: teacher.teacher_id });
        connection.release();
      } else {
        connection.query('SELECT * FROM librarian_login WHERE librarian_user = ? AND librarian_pass = ?', [faculty_user, faculty_pass], (error, librarianResults) => {
          if (librarianResults.length > 0) {
            const librarian = librarianResults[0];
            const token = jwt.sign({ username: faculty_user, userType: 'librarian', userId: librarian.librarian_id }, SECRET_KEY, { expiresIn: '30d' });
            res.status(200).json({ token, userType: 'librarian', userId: librarian.librarian_id });
            connection.release();
          } else {
            connection.query('SELECT * FROM gym_login WHERE gym_user = ? AND gym_pass = ?', [faculty_user, faculty_pass], (error, gymResults) => {
              if (gymResults.length > 0) {
                const gym = gymResults[0];
                const token = jwt.sign({ username: faculty_user, userType: 'gym', userId: gym.gym_id }, SECRET_KEY, { expiresIn: '30d' });
                res.status(200).json({ token, userType: 'gym', userId: gym.gym_id });
                connection.release();
              } else {
                connection.query('SELECT * FROM guard_login WHERE guard_user = ? AND guard_pass = ?', [faculty_user, faculty_pass], (error, guardResults) => {
                  if (guardResults.length > 0) {
                    const guard = guardResults[0];
                    const token = jwt.sign({ username: faculty_user, userType: 'guard', userId: guard.guard_id }, SECRET_KEY, { expiresIn: '30d' });
                    res.status(200).json({ token, userType: 'guard', userId: guard.guard_id });
                    connection.release();
                  } else {
                    connection.query('SELECT * FROM registrar_login WHERE registrar_user = ? AND registrar_pass = ?', [faculty_user, faculty_pass], (error, registrarResults) => {
                      connection.release();
                      if (registrarResults.length > 0) {
                        const registrar = registrarResults[0];
                        const token = jwt.sign({ username: faculty_user, userType: 'registrar', userId: registrar.registrar_id }, SECRET_KEY, { expiresIn: '30d' });
                        res.status(200).json({ token, userType: 'registrar', userId: registrar.registrar_id });
                      } else {
                        return res.status(401).json({ error: 'Invalid username or password' });
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  });
});

// ---------------------Student information---------------------------
app.get('/studentinfo', (req, res) => {

  // Get a connection from the pool
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to database:', err);
      return res.status(500).json({ error: 'Database connection error' });
    }

    // Perform the database query
    connection.query('SELECT * FROM studentinfo', (error, rows) => {
      // Release the connection
      connection.release();

      if (error) {
        console.error('Error fetching student information:', error);
        return res.status(500).json({ error: 'Error fetching student information' });
      }
      // Send the fetched data
      res.json(rows);
    });
  });
});

// -----------------Manual Adding attendance record---------------------
// Fetch student info by TUPT ID
app.get('/studentinfo/:tuptId', (req, res) => {
  const { tuptId } = req.params;

  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to database:', err);
      return res.status(500).json({ error: 'Database connection error' });
    }

    connection.query('SELECT * FROM studentinfo WHERE studentInfo_tuptId = ?', [tuptId], (error, rows) => {
      connection.release();

      if (error) {
        console.error('Error fetching student information:', error);
        return res.status(500).json({ error: 'Error fetching student information' });
      }

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Student not found' });
      }

      res.json(rows[0]);
    });
  });
});

// Insert a new attendance record
app.post('/Manual/attendance', (req, res) => {
  const {
    attendance_firstName,
    attendance_middleName,
    attendance_Lastname,
    attendance_tupId,
    attendance_course,
    attendance_section,
    attendance_email,
    attendance_historyDate,
    attendance_code,
    user_id
  } = req.body;

  const attendanceData = {
    attendance_firstName,
    attendance_middleName,
    attendance_Lastname,
    attendance_tupId,
    attendance_course,
    attendance_section,
    attendance_email,
    attendance_historyDate,
    attendance_code,
    user_id
  };

  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to database:', err);
      return res.status(500).json({ error: 'Database connection error' });
    }

    connection.query('INSERT INTO attendance_taphistory SET ?', attendanceData, (error, results) => {
      connection.release();

      if (error) {
        console.error('Error inserting attendance record:', error);
        return res.status(500).json({ error: 'Error inserting attendance record' });
      }

      res.status(201).json({ message: 'Attendance record added successfully', attendance_Id: results.insertId });
    });
  });
});

// -------------------Student device information-------------------
app.get('/studentDevice', (req, res) => {

  // Get a connection from the pool
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to database:', err);
      return res.status(500).json({ error: 'Database connection error' });
    }

    // Perform the database query
    connection.query('SELECT * FROM student_device', (error, rows) => {
      // Release the connection
      connection.release();

      if (error) {
        console.error('Error fetching student information:', error);
        return res.status(500).json({ error: 'Error fetching student information' });
      }
      // Send the fetched data
      res.json(rows);
    });
  });
});

// ---------------------RFID Registration API--------------------------
// API endpoint to fetch student information based on TUPT-ID
app.get('/rfidRegistration/studentInfo', (req, res) => {
  const { tuptId } = req.query;

  // Check if TUPT-ID is provided
  if (!tuptId) {
    return res.status(400).json({ error: 'TUPT-ID is required' });
  }

  // Get a connection from the pool
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to database:', err);
      return res.status(500).json({ error: 'Database connection error' });
    }

    // Perform the database query
    connection.query('SELECT * FROM studentinfo WHERE studentInfo_tuptId = ?', [tuptId], (error, rows) => {
      // Release the connection
      connection.release();

      if (error) {
        console.error('Error fetching student information:', error);
        return res.status(500).json({ error: 'Error fetching student information' });
      }

      // Check if student with the provided TUPT-ID exists
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Student not found with the provided TUPT-ID' });
      }

      // Send the fetched data
      res.json(rows);
    });
  });
});

// API endpoint to insert RFID tag value into the database for a specific student
app.post('/rfidRegistration/:tuptId', (req, res) => {
  const { tuptId } = req.params;
  const { tagValue } = req.body;

  // Check if both TUPT ID and tagValue are provided
  if (!tuptId || !tagValue) {
    return res.status(400).json({ error: 'TUPT ID and RFID tagValue are required' });
  }

  // Get a connection from the pool
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to database:', err);
      return res.status(500).json({ error: 'Database connection error' });
    }

    // Perform the database query to insert RFID tagValue into the student account
    connection.query('UPDATE studentinfo SET tagValue = ? WHERE studentInfo_tuptId = ?', [tagValue, tuptId], (error, result) => {
      // Release the connection
      connection.release();

      if (error) {
        console.error('Error inserting RFID tagValue:', error);
        return res.status(500).json({ error: 'Error inserting RFID tagValue' });
      }

      console.log('RFID tagValue inserted successfully for TUPT ID:', tuptId);
      res.json({ success: true });
    });
  });
});

// --------------------Device Registration--------------------------
// API endpoint to fetch student information based on TUPT-ID
app.get('/deviceRegistration', (req, res) => {
  const { serialNumber } = req.query;

  // Check if TUPT-ID is provided
  if (!serialNumber) {
    return res.status(400).json({ error: 'Serial Number is required' });
  }

  // Get a connection from the pool
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to database:', err);
      return res.status(500).json({ error: 'Database connection error' });
    }

    // Perform the database query
    connection.query('SELECT * FROM student_device WHERE device_serialNumber = ?', [serialNumber], (error, rows) => {
      // Release the connection
      connection.release();

      if (error) {
        console.error('Error fetching Device information:', error);
        return res.status(500).json({ error: 'Error fetching Device information' });
      }

      // Check if student with the provided TUPT-ID exists
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Device not found with the provided Serial Number' });
      }

      // Send the fetched data
      res.json(rows);
    });
  });
});

// API endpoint to insert Device code value into the database for a specific Device
app.post('/deviceRegistration/:serialNumber', (req, res) => {
  const { serialNumber } = req.params;
  const { deviceCode } = req.body; // Ensure the client sends the correct property

  // Check if both serialNumber and deviceCode are provided
  if (!serialNumber || !deviceCode) {
    return res.status(400).json({ error: 'Serial number and Device code are required' });
  }

  // Get a connection from the pool
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to database:', err);
      return res.status(500).json({ error: 'Database connection error' });
    }

    // Perform the database query to insert deviceCode into the student account
    connection.query('UPDATE student_device SET deviceRegistration = ? WHERE device_serialNumber = ?', [deviceCode, serialNumber], (error, result) => {
      // Release the connection
      connection.release();

      if (error) {
        console.error('Error inserting Device code:', error);
        return res.status(500).json({ error: 'Error inserting device code' });
      }

      console.log('Device code inserted successfully for Serial number:', serialNumber);
      res.json({ success: true });
    });
  });
});

// --------------------END Device Registration-------------------------

// ----------------------Adding Attendance---------------------------
app.post('/add-Attendance', (req, res) => {
  const { attendance_description, attendance_code, attendance_date } = req.body;
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error connecting to database:", err);
      return res.status(500).json({ error: "Database connection error" })
    }
    const sql = `INSERT INTO attendance (attendance_description, attendance_code, attendance_date) VALUES (?, ?, ?)`;
    const values = [attendance_description, attendance_code, attendance_date];

    connection.query(sql, values, (err, result) => {
      connection.release(); // Release the connection back to the pool

      if (err) {
        console.error('Error adding attendance:', err);
        res.status(500).json({ error: 'An error occurred while adding attendance' });
        return;
      }

      console.log('Attendance added successfully');
      res.status(201).json({ message: 'Attendance added successfully' });
    });
  });
});

// ----------------------Fetching Attendance List----------------------
app.get('/attendance', (req, res) => {
  // Perform a database query to fetch the attendance data
  pool.query('SELECT * FROM attendance', (error, results) => {
    if (error) {
      console.error('Error fetching attendance data:', error);
      res.status(500).json({ error: 'An error occurred while fetching attendance data' });
      return;
    }

    // If data is fetched successfully, send it back to the client
    res.json(results);
  });
});

// -------------------Faculty Teacher Attendance------------------------
// ----------------------Adding Attendance----------------------------
app.post('/Facultyadd-Attendance', (req, res) => {
  const { attendance_description, attendance_code, attendance_date, userId } = req.body;
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error connecting to database:", err);
      return res.status(500).json({ error: "Database connection error" });
    }
    const sql = `INSERT INTO attendance (attendance_description, attendance_code, attendance_date, userId) VALUES (?, ?, ?, ?)`;
    const values = [attendance_description, attendance_code, attendance_date, userId];

    connection.query(sql, values, (err, result) => {
      connection.release(); // Release the connection back to the pool

      if (err) {
        console.error('Error adding attendance:', err);
        res.status(500).json({ error: 'An error occurred while adding attendance' });
        return;
      }

      console.log('Attendance added successfully');
      res.status(201).json({ message: 'Attendance added successfully' });
    });
  });
});

// ----------------------Fetching Attendance List----------------------
app.get('/Facultyattendance/:userId', (req, res) => {
  const { userId } = req.params;
  // Perform a database query to fetch the attendance data for a specific user
  pool.query('SELECT * FROM attendance WHERE userId = ?', [userId], (error, results) => {
    if (error) {
      console.error('Error fetching attendance data:', error);
      res.status(500).json({ error: 'An error occurred while fetching attendance data' });
      return;
    }

    // If data is fetched successfully, send it back to the client
    res.json(results);
  });
});

// -------------------END Faculty Teacher Attendance-------------------

// ----------------------Fetching Attendance Report--------------------
app.post('/attendance/report/:code', (req, res) => {
  const { code } = req.params;

  // Get a connection from the pool
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to database:', err);
      return res.status(500).json({ error: 'Database connection error' });
    }

    // Perform the database query to fetch data for the provided attendance code
    const query = `
      SELECT ath.*, a.attendance_description 
      FROM attendance_taphistory ath
      JOIN attendance a ON ath.attendance_code = a.attendance_code
      WHERE ath.attendance_code = ?
    `;
    connection.query(query, [code], (error, rows) => {
      // Release the connection
      connection.release();

      if (error) {
        console.error('Error fetching attendance report data:', error);
        return res.status(500).json({ error: 'Error fetching attendance report data' });
      }

      // Send the fetched data
      res.json(rows);
    });
  });
});
// ----------------------Report API------------------------------------
// API endpoint to fetch data for Library Report
app.get('/Library-Report', (req, res) => {
  // Get a connection from the pool
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to database:', err);
      return res.status(500).json({ error: 'Database connection error' });
    }

    // Perform the database query to fetch data for Library
    connection.query("SELECT * FROM library_taphistory", (error, rows) => {
      // Release the connection
      connection.release();

      if (error) {
        console.error('Error fetching tap history student information:', error);
        return res.status(500).json({ error: 'Error fetching tap history student information' });
      }

      // Send the fetched data
      res.json(rows);
    });
  });
});

// API endpoint to fetch data for Gym Report
app.get('/Gym-Report', (req, res) => {
  // Get a connection from the pool
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to database:', err);
      return res.status(500).json({ error: 'Database connection error' });
    }

    // Perform the database query to fetch data for Gym
    connection.query("SELECT * FROM gym_taphistory", (error, rows) => {
      // Release the connection
      connection.release();

      if (error) {
        console.error('Error fetching tap history student information:', error);
        return res.status(500).json({ error: 'Error fetching tap history student information' });
      }

      // Send the fetched data
      res.json(rows);
    });
  });
});

// API endpoint to fetch data for Registrar Report
app.get('/Registrar-Report', (req, res) => {
  // Get a connection from the pool
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to database:', err);
      return res.status(500).json({ error: 'Database connection error' });
    }

    // Perform the database query to fetch data for Registrar
    connection.query("SELECT * FROM registrar_taphistory", (error, rows) => {
      // Release the connection
      connection.release();

      if (error) {
        console.error('Error fetching tap history student information:', error);
        return res.status(500).json({ error: 'Error fetching tap history student information' });
      }

      // Send the fetched data
      res.json(rows);
    });
  });
});

// API endpoint to fetch data for Gatepass Report
app.get('/Gatepass-Report', (req, res) => {
  // Get a connection from the pool
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to database:', err);
      return res.status(500).json({ error: 'Database connection error' });
    }

    // Perform the database query to fetch data for Gatepass
    connection.query("SELECT * FROM gatepass_taphistory", (error, rows) => {
      // Release the connection
      connection.release();

      if (error) {
        console.error('Error fetching tap history student information:', error);
        return res.status(500).json({ error: 'Error fetching tap history student information' });
      }

      // Send the fetched data
      res.json(rows);
    });
  });
});

// ---------------------ND of REPORT API------------------------------

// --------------------Fetch Device List-----------------------------
app.get('/DeviceList', (req, res) => {
  // Get a connection from the pool
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to database:', err);
      return res.status(500).json({ error: 'Database connection error' });
    }

    // Perform the database query to fetch data for devices where deviceRegistration is null or empty string
    const sqlQuery = "SELECT * FROM student_device WHERE deviceRegistration IS NULL OR deviceRegistration = ''";
    connection.query(sqlQuery, (error, rows) => {
      // Release the connection
      connection.release();

      if (error) {
        console.error('Error fetching device information:', error);
        return res.status(500).json({ error: 'Error fetching device information' });
      }

      // Send the fetched data
      res.json(rows);
    });
  });
});

// ------------------------PDF Download server------------------------

// app.get('/Attendance-Report/pdf', (req, res) => {
//   const { date, attendance_code } = req.query; // Get the date and attendance_code from query parameters
//   if (!date || !attendance_code) {
//     return res.status(400).json({ error: 'Date and attendance code are required' });
//   }

//   const formattedDate = date;

//   // Check if the formatted date is valid
//   if (!moment(formattedDate, 'YYYY-MM-DD', true).isValid()) {
//     return res.status(400).json({ error: 'Invalid date format' });
//   }

//   // Get a connection from the pool
//   pool.getConnection((err, connection) => {
//     if (err) {
//       console.error('Error connecting to database:', err);
//       return res.status(500).json({ error: 'Database connection error' });
//     }

//     // Perform the database query to fetch data based on date and attendance_code
//     const query = `
//       SELECT ath.*, a.attendance_description 
//       FROM attendance_taphistory ath
//       JOIN attendance a ON ath.attendance_code = a.attendance_code
//       WHERE ath.attendance_code = ?
//       AND DATE_FORMAT(STR_TO_DATE(ath.attendance_historyDate, '%c/%e/%Y, %r'), '%Y-%m-%d') = ?
//     `;
//     connection.query(query, [attendance_code, formattedDate], (error, rows) => {
//       // Release the connection
//       connection.release();

//       if (error) {
//         console.error('Error fetching tap history student information:', error);
//         return res.status(500).json({ error: 'Error fetching tap history student information' });
//       }

//       // Send the fetched data
//       res.json(rows);
//     });
//   });
// });

app.get('/Attendance-Report/pdf', (req, res) => {
  const { date, attendance_code } = req.query; // Get the date and attendance_code from query parameters
  if (!date || !attendance_code) {
    return res.status(400).json({ error: 'Date and attendance code are required' });
  }

  const formattedDate = moment(date, 'YYYY-MM-DD').format('YYYY-MM-DD');

  // Get a connection from the pool
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to database:', err);
      return res.status(500).json({ error: 'Database connection error' });
    }

    // Perform the database query to fetch data based on date and attendance_code
    const query = `
    SELECT ath.*, a.attendance_description 
    FROM attendance_taphistory ath
    JOIN attendance a ON ath.attendance_code = a.attendance_code
    WHERE ath.attendance_code = ?
    AND DATE(STR_TO_DATE(ath.attendance_historyDate, '%c/%e/%Y, %r')) = ?
    `;

    connection.query(query, [attendance_code, formattedDate], (error, rows) => {
      // Release the connection
      connection.release();

      if (error) {
        console.error('Error fetching tap history student information:', error);
        return res.status(500).json({ error: 'Error fetching tap history student information' });
      }

      // Send the fetched data
      res.json(rows);
    });
  });
});

// Library Report PDF API
app.get('/Library-Report/pdf', (req, res) => {
  const { date } = req.query; // Get the date from query parameters
  if (!date) {
    return res.status(400).json({ error: 'Date is required' });
  }

  const formattedDate = date;

  // Check if the formatted date is valid
  if (!moment(formattedDate, 'YYYY-MM-DD', true).isValid()) {
    return res.status(400).json({ error: 'Invalid date format' });
  }

  // Get a connection from the pool
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to database:', err);
      return res.status(500).json({ error: 'Database connection error' });
    }

    // Perform the database query to fetch data based on date
    const query = `
      SELECT * 
      FROM library_taphistory 
      WHERE DATE_FORMAT(STR_TO_DATE(library_InHistoryDate, '%c/%e/%Y, %r'), '%Y-%m-%d') = ?
    `;
    connection.query(query, [formattedDate], (error, rows) => {
      // Release the connection
      connection.release();

      if (error) {
        console.error('Error fetching tap history student information:', error);
        return res.status(500).json({ error: 'Error fetching tap history student information' });
      }

      // Send the fetched data
      res.json(rows);
    });
  });
});

// Gym Report PDF API
app.get('/Gym-Report/pdf', (req, res) => {
  const { date } = req.query; // Get the date from query parameters
  if (!date) {
    return res.status(400).json({ error: 'Date is required' });
  }

  const formattedDate = date;

  // Check if the formatted date is valid
  if (!moment(formattedDate, 'YYYY-MM-DD', true).isValid()) {
    return res.status(400).json({ error: 'Invalid date format' });
  }

  // Get a connection from the pool
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to database:', err);
      return res.status(500).json({ error: 'Database connection error' });
    }

    // Perform the database query to fetch data based on date
    const query = `
      SELECT * 
      FROM gym_taphistory 
      WHERE DATE_FORMAT(STR_TO_DATE(gym_InHistoryDate, '%c/%e/%Y, %r'), '%Y-%m-%d') = ?
    `;
    connection.query(query, [formattedDate], (error, rows) => {
      // Release the connection
      connection.release();

      if (error) {
        console.error('Error fetching tap history student information:', error);
        return res.status(500).json({ error: 'Error fetching tap history student information' });
      }

      // Send the fetched data
      res.json(rows);
    });
  });
});

// Registrar Report PDF API
app.get('/Registrar-Report/pdf', (req, res) => {
  const { date } = req.query; // Get the date from query parameters
  if (!date) {
    return res.status(400).json({ error: 'Date is required' });
  }

  const formattedDate = date;

  // Check if the formatted date is valid
  if (!moment(formattedDate, 'YYYY-MM-DD', true).isValid()) {
    return res.status(400).json({ error: 'Invalid date format' });
  }

  // Get a connection from the pool
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to database:', err);
      return res.status(500).json({ error: 'Database connection error' });
    }

    // Perform the database query to fetch data based on date
    const query = `
      SELECT * 
      FROM registrar_taphistory 
      WHERE DATE_FORMAT(STR_TO_DATE(registrar_taphistoryDate, '%c/%e/%Y, %r'), '%Y-%m-%d') = ?
    `;
    connection.query(query, [formattedDate], (error, rows) => {
      // Release the connection
      connection.release();

      if (error) {
        console.error('Error fetching tap history student information:', error);
        return res.status(500).json({ error: 'Error fetching tap history student information' });
      }

      // Send the fetched data
      res.json(rows);
    });
  });
});

// Gatepass Report PDF API
app.get('/Gatepass-Report/pdf', (req, res) => {
  const { date } = req.query; // Get the date from query parameters
  if (!date) {
    return res.status(400).json({ error: 'Date is required' });
  }

  const formattedDate = date;

  // Check if the formatted date is valid
  if (!moment(formattedDate, 'YYYY-MM-DD', true).isValid()) {
    return res.status(400).json({ error: 'Invalid date format' });
  }

  // Get a connection from the pool
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to database:', err);
      return res.status(500).json({ error: 'Database connection error' });
    }

    // Perform the database query to fetch data based on date
    const query = `
      SELECT * 
      FROM gatepass_taphistory 
      WHERE DATE_FORMAT(STR_TO_DATE(gatepass_historyDate, '%c/%e/%Y, %r'), '%Y-%m-%d') = ?
    `;
    connection.query(query, [formattedDate], (error, rows) => {
      // Release the connection
      connection.release();

      if (error) {
        console.error('Error fetching tap history student information:', error);
        return res.status(500).json({ error: 'Error fetching tap history student information' });
      }

      // Send the fetched data
      res.json(rows);
    });
  });
});
// ------------------------END PDF Download server---------------------

// ------------------------Library tap API----------------------------
// API endpoint to fetch the latest tap status
app.get('/tap_status', (req, res) => {
  // Get a connection from the pool
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to database:', err);
      return res.status(500).json({ error: 'Database connection error' });
    }

    // Perform the database query to fetch the latest entry
    connection.query('SELECT * FROM library_taphistory ORDER BY library_tapHistoryID DESC LIMIT 1', (error, rows) => {
      // Release the connection
      connection.release();

      if (error) {
        console.error('Error fetching tap status:', error);
        return res.status(500).json({ error: 'Error fetching tap status' });
      }
      // Send the fetched data
      res.json(rows[0]); // Send only the first row (latest entry)
    });
  });
});

// API endpoint to fetch the latest Gym tap status
app.get('/gym_status', (req, res) => {
  // Get a connection from the pool
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to database:', err);
      return res.status(500).json({ error: 'Database connection error' });
    }

    // Perform the database query to fetch the latest entry
    connection.query('SELECT * FROM gym_taphistory ORDER BY gym_taphistoryID DESC LIMIT 1', (error, rows) => {
      // Release the connection
      connection.release();

      if (error) {
        console.error('Error fetching tap status:', error);
        return res.status(500).json({ error: 'Error fetching tap status' });
      }
      // Send the fetched data
      res.json(rows[0]); // Send only the first row (latest entry)
    });
  });
});

// ------------------------END of Tap status server------------------

// Start the server
const PORT = process.env.PORT || 2526;
app.listen(PORT, () => {
  console.log(`Admin server is running on port ${PORT}`);
});