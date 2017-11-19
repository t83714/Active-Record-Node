const mysql = require("mysql2/promise");
const uuidv4 = require('uuid/v4');

const dbName = "app_test_"+uuidv4();
const createDBSQL = `
CREATE DATABASE IF NOT EXISTS \`${dbName}\`;
USE \`${dbName}\`;
CREATE TABLE IF NOT EXISTS \`people\` (
    \`id\` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    \`firstName\` varchar(255) NOT NULL DEFAULT '',
    \`lastName\` varchar(255) NOT NULL DEFAULT '',
    PRIMARY KEY (\`id\`)
) ENGINE=MyISAM AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
`;

const prepareTestDB = async () => {
    const dbConn = await mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        multipleStatements: true
    });
    await dbConn.query(createDBSQL);
    return dbConn;
};

const removeTestDB = async (db) => {
    db.query(`DROP DATABASE \`${dbName}\``);
    await db.end();
}

module.exports = {prepareTestDB, removeTestDB};