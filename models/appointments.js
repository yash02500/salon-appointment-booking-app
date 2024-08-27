const Sequelize = require('sequelize');
const sequelize = require('../util/database');
const User = require('./user');

const Appointments = sequelize.define('Appointments', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    slot: {
        type: Sequelize.STRING,
        allowNull: false
    },
    service: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

User.hasMany(Appointments);
module.exports = Appointments;


