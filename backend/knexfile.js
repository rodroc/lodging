import dotenv from 'dotenv';

dotenv.config({ path: '../local.env' })

console.log({env:process.env.DB_HOST})

const config = {

    client : 'pg',
    connection : {
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    },
    migrations : {
      directory: './src/db/migrations'
    },
    seeds : {
      directory: './src/db/seeds'
    }

}

export default config;
