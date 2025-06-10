import knex from 'knex';
import config from '../../knexfile.js';

// console.log({config})

export const db = knex(config)

export async function setupDB() {
  try {
    console.log(`Setup database and start server...`);
    // Check connection
    await db.raw('SELECT 1');
    console.log('Database connected!');

    // Check if tables exist, if not run migrations
    if (!await db.schema.hasTable('users')) {
      console.log('Tables not found, running migrations...');
      
      // Create users table
      await db.schema.createTable('users', table => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('email').notNullable().unique();
        table.string('password').notNullable();
        table.timestamps(true, true);
      });
      console.log('Users table created');
    }
    
    return true;
  } catch (error) {
    console.error('Database setup error:', error);
    console.error(`PLEASE MAKE SURE TO SET THE 'DB_HOST' in 'local.env' TO YOUR HOST NETWORK IP.`)
    throw error;
  }
}