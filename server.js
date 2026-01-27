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

const app = express();
app.use(express.json());

app.listen(port, () => {
    console.log('Server running on port', port);
});

// ==============================
// GET ROUTES
// ==============================

app.get('/vehicles', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(`
            SELECT v.vehicle_id,
                   v.license_plate,
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
            JOIN energy_type e ON v.energy_type_id = e.energy_type_id
        `);
        await connection.end();
        res.json(rows);
    } catch {
        res.status(500).json({ message: 'Error fetching vehicles' });
    }
});

app.get('/vehicles/ev', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(`
            SELECT v.*, e.energy_name, e.energy_image_url
            FROM vehicle v
            JOIN energy_type e ON v.energy_type_id = e.energy_type_id
            WHERE e.energy_name='EV'
        `);
        await connection.end();
        res.json(rows);
    } catch {
        res.status(500).json({ message: 'Error fetching EVs' });
    }
});

app.get('/vehicles/hybrid', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(`
            SELECT v.*, e.energy_name, e.energy_image_url
            FROM vehicle v
            JOIN energy_type e ON v.energy_type_id = e.energy_type_id
            WHERE e.energy_name='Hybrid'
        `);
        await connection.end();
        res.json(rows);
    } catch {
        res.status(500).json({ message: 'Error fetching hybrids' });
    }
});

// ==============================
// CREATE
// ==============================

app.post('/addvehicle', async (req, res) => {
    const {
        license_plate,
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
            (license_plate, brand, model_name, vehicle_type, registration_date,
             emission_rating, energy_type_id, vehicle_image_url)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                license_plate,
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
        res.status(201).json({ message: 'Vehicle added' });
    } catch {
        res.status(500).json({ message: 'Error adding vehicle' });
    }
});

// ==============================
// UPDATE
// ==============================

app.put('/updatevehicle/:id', async (req, res) => {
    const { id } = req.params;
    const {
        license_plate,
        brand,
        model_name,
        vehicle_type,
        emission_rating,
        energy_type_id,
        vehicle_image_url
    } = req.body;

    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            `UPDATE vehicle
             SET license_plate=?,
                 brand=?,
                 model_name=?,
                 vehicle_type=?,
                 emission_rating=?,
                 energy_type_id=?,
                 vehicle_image_url=?
             WHERE vehicle_id=?`,
            [
                license_plate,
                brand,
                model_name,
                vehicle_type,
                emission_rating,
                energy_type_id,
                vehicle_image_url,
                id
            ]
        );
        await connection.end();
        res.json({ message: 'Vehicle updated' });
    } catch {
        res.status(500).json({ message: 'Error updating vehicle' });
    }
});

// ==============================
// DELETE
// ==============================

app.delete('/deletevehicle/:id', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'DELETE FROM vehicle WHERE vehicle_id=?',
            [req.params.id]
        );
        await connection.end();
        res.json({ message: 'Vehicle deleted' });
    } catch {
        res.status(500).json({ message: 'Error deleting vehicle' });
    }
});
