// const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') })

module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: path.join(__dirname, '/migrations')
    },
    seeds: {
      directory: path.join(__dirname, '/seeds', '/fake')
    }
  },
  production: {
    client: 'postgresql',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
        // uncomment the following lines to
        // allow add ssl

        // ca:
        //   process.env.NODE_ENV === 'production'
        //     ? fs.readFileSync('../../root.crt').toString()
        //     : null,
        // key:
        //   process.env.NODE_ENV === 'production'
        //     ? fs.readFileSync('../../postgresql.key').toString()
        //     : null,
        // cert:
        //   process.env.NODE_ENV === 'production'
        //     ? fs.readFileSync('../../postgresql.crt').toString()
        //     : null
      }
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: path.join(__dirname, '/migrations')
    },
    seeds: {
      directory: path.join(__dirname, '/seeds', '/real')
    }
  },
  onUpdateTrigger: table => `
    CREATE TRIGGER ${table}_updated_at
    BEFORE UPDATE ON ${table}
    FOR EACH ROW
    EXECUTE PROCEDURE on_update_timestamp();
  `
}
