const knex = require('knex');
const config = require('../../knexfile');

// const environment = process.env.NODE_ENV || 'development';
export const connection = knex(config);

