const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

async function checkTable() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        await client.connect();
        console.log('Connected to database');
        
        const res = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'events'
            );
        `);
        
        console.log('Events table exists:', res.rows[0].exists);
        
        if (res.rows[0].exists) {
            const columns = await client.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'events';
            `);
            console.log('Columns:', columns.rows);
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkTable();
