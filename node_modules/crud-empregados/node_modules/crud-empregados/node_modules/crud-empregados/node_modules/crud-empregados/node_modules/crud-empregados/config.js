const { Sequelize } = require('sequelize');
console.log("euuuu" + Sequelize);
const sequelize = new Sequelize('crud_empregados', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
});
module.exports = {sequelize, Sequelize};
