
const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Services = sequelize.define('services', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    description: {
        type: Sequelize.STRING,
        allowNull: false
    },
    duration: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    price: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
});

module.exports = Services;


