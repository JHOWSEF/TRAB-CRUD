const { DataTypes } = require('sequelize');
const {sequelize} = require('../config');

const Empregado = sequelize.define('Empregado', {
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },
    salario_bruto: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    departamento: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = Empregado;
sequelize.sync({ alter: true });

