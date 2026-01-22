// include required packages
const express = require('express');
const mysql = require('mysql2/promise');
require('dotenv').config();

const port = 3000;

// database config
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
};

// initialise Express app
const app = express();
app.use(express.json());

// start server
app.listen(port, () => {
    console.log('Server running on port', port);
});


// ==============================
// GET ROUTES
// ==============================

// Get ALL vehicles
app.get('/vehicles', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);

        const [rows] = await connection.execute(`
            SELECT v.vehicle_id,
                   v.brand,
                   v.model_name,
                   v.vehicle_type,
                   v.registration_date,
                   v.emission_rating,
                   v.vehicle_image_url,
                   v.energy_type_id,
                   e.energy_name,
                   e.energy_image_url
            FROM vehicle v
            JOIN energy_type e
              ON v.energy_type_id = e.energy_type_id
        `);

        await connection.end();
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error - could not get vehicles' });
    }
});

// Get EV vehicles
app.get('/vehicles/ev', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);

        const [rows] = await connection.execute(`
            SELECT v.vehicle_id,
                   v.brand,
                   v.model_name,
                   v.vehicle_type,
                   v.registration_date,
                   v.emission_rating,
                   v.vehicle_image_url,
                   v.energy_type_id,
                   e.energy_name,
                   e.energy_image_url
            FROM vehicle v
            JOIN energy_type e
              ON v.energy_type_id = e.energy_type_id
            WHERE e.energy_name = 'EV'
        `);

        await connection.end();
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error - could not get EV vehicles' });
    }
});

// Get Hybrid vehicles
app.get('/vehicles/hybrid', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);

        const [rows] = await connection.execute(`
            SELECT v.vehicle_id,
                   v.brand,
                   v.model_name,
                   v.vehicle_type,
                   v.registration_date,
                   v.emission_rating,
                   v.vehicle_image_url,
                   v.energy_type_id,
                   e.energy_name,
                   e.energy_image_url
            FROM vehicle v
            JOIN energy_type e
              ON v.energy_type_id = e.energy_type_id
            WHERE e.energy_name = 'Hybrid'
        `);

        await connection.end();
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error - could not get Hybrid vehicles' });
    }
});


// ==============================
// CREATE
// ==============================

app.post('/addvehicle', async (req, res) => {
    const {
        brand,
        model_name,
        vehicle_type,
        registration_date,
        emission_rating,
        energy_type_id,
        vehicle_image_url
    } = req.body;

    try {
        const connection = await mysql.createConnection(dbConfig);

        await connection.execute(
            `INSERT INTO vehicle
            (brand, model_name, vehicle_type, registration_date,
             emission_rating, energy_type_id, vehicle_image_url)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                brand,
                model_name,
                vehicle_type,
                registration_date,
                emission_rating,
                energy_type_id,
                vehicle_image_url
            ]
        );

        await connection.end();
        res.status(201).json({ message: 'Vehicle added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error - could not add vehicle' });
    }
});


// ==============================
// UPDATE (FIXED)
// ==============================

app.put('/updatevehicle/:id', async (req, res) => {
    const { id } = req.params;
    const {
        brand,
        model_name,
        vehicle_type,
        registration_date,
        emission_rating,
        energy_type_id,
        vehicle_image_url
    } = req.body;

    try {
        const connection = await mysql.createConnection(dbConfig);

        await connection.execute(
            `UPDATE vehicle
             SET brand=?,
                 model_name=?,
                 vehicle_type=?,
                 registration_date=COALESCE(?, registration_date),
                 emission_rating=?,
                 energy_type_id=?,
                 vehicle_image_url=?
             WHERE vehicle_id=?`,
            [
                brand,
                model_name,
                vehicle_type,
                registration_date || null,
                emission_rating,
                energy_type_id,
                vehicle_image_url,
                id
            ]
        );

        await connection.end();
        res.json({ message: 'Vehicle updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error - could not update vehicle' });
    }
});


// ==============================
// DELETE
// ==============================

app.delete('/deletevehicle/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const connection = await mysql.createConnection(dbConfig);

        await connection.execute(
            'DELETE FROM vehicle WHERE vehicle_id = ?',
            [id]
        );

        await connection.end();
        res.json({ message: 'Vehicle deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error - could not delete vehicle' });
    }
});
