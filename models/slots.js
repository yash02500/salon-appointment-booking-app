const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Slots = sequelize.define('slots', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    date: {
        type: Sequelize.DATEONLY,
        allowNull: false
    },   
    time: {
        type: Sequelize.TIME,
        allowNull: false
    },
    isBooked: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
});

module.exports = Slots;
