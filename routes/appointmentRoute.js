const express = require('express');
const routes = express.Router();
const userAppointments = require('../controllers/userAppointments');
const userAuthentication = require('../middleware/auth')

routes.post('/appointment', userAuthentication.authenticate, userAppointments.bookAppointment);
routes.get('/getAppointments', userAuthentication.authenticate, userAppointments.getAppointments);
routes.delete('/cancelAppointment/:id', userAuthentication.authenticate, userAppointments.cancelAppointment);

module.exports = routes;