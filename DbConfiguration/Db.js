const mysql = require('mysql2/promise');

const mySqlPool = mysql.createPool({
    host: '115.187.62.16',
    user: 'viuser',
    password: 'Vyoma@2018',
    database: 'yatri_subidha'
});

module.exports = mySqlPool;


