const User = require("../models/user");
const Appointments = require("../models/appointments")
const dotenv = require("dotenv");
dotenv.config();

// Booking user appointment
const bookAppointment = async (req, res) => {
    const { slot, service } = req.body;
    const userId = req.user.id;

    try {
        const appointment = await Appointments.create({
            UserId: userId,
            slot: slot,
            service: service
        });
        console.log("Appointment booked")
        res.status(201).json(appointment);

    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }

}


// Getting user appointmnets
const getAppointments = async (req, res) => {
    const userId = req.user.id;
    try {
        const getUserAppointment = await Appointments.findAll({ where: {UserId: userId }});
        console.log("Here are user Appointments")
        res.status(201).json(getUserAppointment);

    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
}


// Deleting user appointment
const cancelAppointment = async (req, res) => {
    const appointmentId = req.params.id;
    try {
        const cancelUserAppointment = await Appointments.destroy({ where: {id: appointmentId, UserId: req.user.id }});
        console.log("Appointment canceled")
        res.status(201).json(cancelUserAppointment);

    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
}


module.exports = {
    bookAppointment,
    getAppointments,
    cancelAppointment
}