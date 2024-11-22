// Importing models and librarys
const Services = require("../models/services");
const Appointments = require("../models/appointments")
const Slots = require("../models/slots")
const User = require("../models/user")
const Sequelize = require('sequelize');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');
const moment = require('moment-timezone');
const cron = require('node-cron');

// Booking user appointment 
const bookAppointments = async (req, res) => {
  const { slot, service } = req.body;
  const userId = req.user.id;

  try {
    const selectedSlot = await Slots.findOne({ where: { id: slot } });
    if (!selectedSlot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    if (selectedSlot.isBooked) {
      return res.status(400).json({ message: "Slot is already booked." });
    }

    const selectedService = await Services.findOne({ where: { id: service } });
    if (!selectedService) {
      return res.status(404).json({ message: "Service not found" });
    }

    const slotDate = selectedSlot.date; // "YYYY-MM-DD"
    const slotTime = selectedSlot.time; // "HH:mm:ss"

    // Combining date and time explicitly and consider the server's local time
    let appointmentStartTime = new Date(`${slotDate}T${slotTime}`); // Assume this is in server local time
    appointmentStartTime.setHours(appointmentStartTime.getHours() + 5); // Convert to IST
    appointmentStartTime.setMinutes(appointmentStartTime.getMinutes() + 30); // Convert to IST

    // Calculating the end time by adding the service duration
    let appointmentEndTime = new Date(appointmentStartTime);
    appointmentEndTime.setMinutes(appointmentStartTime.getMinutes() + selectedService.duration);
    const appointment = await Appointments.create({
      UserId: userId,
      slotId: slot,
      serviceId: service,
      endTime: appointmentEndTime,
      status: 'active'
    });

    // Mark slot as booked
    selectedSlot.isBooked = true;
    await selectedSlot.save();

    console.log("Appointment booked");
    res.status(201).json(appointment);

  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};


// Getting user appointments
const getAppointments = async (req, res) => {
  const userId = req.user.id;
  try {
    const getUserAppointments = await Appointments.findAll({
      where: { UserId: userId },
      include: [
        {
          model: Slots,
          as: 'slot',
          attributes: ['id', 'date', 'time']
        },
        {
          model: Services,
          as: 'service',
          attributes: ['id', 'name']
        }
      ]
    });

    console.log("Here are user Appointments with related details")
    res.status(201).json(getUserAppointments);

  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
}


// Deleting user appointment
const cancelAppointment = async (req, res) => {
  const appointmentId = req.params.id;
  const slotId = req.params.slotId;
  try {
    const cancelUserAppointment = await Appointments.destroy({ where: { id: appointmentId, UserId: req.user.id } });
    const updateSlot = await Slots.findOne({ where: { id: slotId } });
    updateSlot.isBooked = false;
    await updateSlot.save();

    console.log("Appointment canceled")

    res.status(201).json(cancelUserAppointment);

  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
}


// Slots availability
const getOpenSlots = async (req, res) => {
  try {
    // Get the current date and time separately
    const currentDateTime = new Date();
    const currentDate = currentDateTime.toISOString().split('T')[0]; // YYYY-MM-DD format
    const currentTime = currentDateTime.toTimeString().split(' ')[0]; // HH:mm:ss format


    // Find all active appointments that have expired
    const expiredAppointments = await Appointments.findAll({
      where: {
        status: 'active',
        [Sequelize.Op.or]: [
          {
            '$slot.date$': { [Sequelize.Op.lt]: currentDate } // Slots before today are expired
          },
          {
            '$slot.date$': currentDate, // Today's slots
            endTime: { [Sequelize.Op.lte]: currentTime } // Times before or equal to current time are expired
          }
        ]
      },
      include: [
        {
          model: Slots,
          as: 'slot',
          attributes: ['id', 'date'], // Fetch the slot's date field
        }
      ],
    });

    // Update the status of expired appointments and their associated slots
    for (let appointment of expiredAppointments) {
      // Find the associated slot
      const associatedSlot = await Slots.findOne({ where: { id: appointment.slotId } });
      if (associatedSlot) {
        // Mark slot as available
        associatedSlot.isBooked = false;
        await associatedSlot.save();
      }

      // Mark appointment as completed
      appointment.status = 'completed';
      await appointment.save();
    }

    // Fetch all slots that are available and have not passed the current date and time
    const availableSlots = await Slots.findAll({
      where: {
        isBooked: false,
        [Sequelize.Op.and]: [
          {
            // Ensure slot date and time are in the future
            [Sequelize.Op.or]: [
              {
                date: { [Sequelize.Op.gt]: currentDate }
              },
              {
                date: currentDate,
                time: { [Sequelize.Op.gt]: currentTime }
              }
            ]
          }
        ]
      },
    });

    // Send the available slots back in the response
    res.status(200).json({ slots: availableSlots });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({ error: 'An error occurred while fetching available slots.' });
  }
};


// Get services
const getServices = async (req, res) => {
  try {
    const services = await Services.findAll();
    res.status(201).json(services);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  } 
}


// Schedule a job to run every hour
cron.schedule('0 * * * *', async () => {
  console.log('Running Cron Job to Send Appointment Reminders');

  try {
    // Get the current date and time
    const currentDateTime = moment(); // Use your timezone if needed, e.g., moment().tz("America/New_York");
    const oneHourLater = moment(currentDateTime).add(1, 'hour');

    console.log('Current Date Time:', currentDateTime.format('YYYY-MM-DD HH:mm:ss'));
    console.log('One Hour Later:', oneHourLater.format('YYYY-MM-DD HH:mm:ss'));

    // Extract separate date and time from currentDateTime and oneHourLater
    const currentDate = currentDateTime.format('YYYY-MM-DD');
    const currentTime = currentDateTime.format('HH:mm:ss');
    const oneHourLaterDate = oneHourLater.format('YYYY-MM-DD');
    const oneHourLaterTime = oneHourLater.format('HH:mm:ss');

    // Find appointments that are scheduled within the next hour
    const upcomingAppointments = await Appointments.findAll({
      where: {
        status: 'active', // Only send reminders for active appointments
      },
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id', 'email'],
        },
        {
          model: Slots,
          as: 'slot',
          attributes: ['id', 'date', 'time'],
          where: {
            [Op.or]: [
              {
                [Op.and]: [
                  { date: currentDate }, // Current date
                  { time: { [Op.between]: [currentTime, oneHourLaterTime] } }, // Between current time and one hour later
                ],
              },
              {
                [Op.and]: [
                  { date: oneHourLaterDate }, // The next day's date if crossing midnight
                  { time: { [Op.between]: ['00:00:00', oneHourLaterTime] } }, // Time up to one hour later
                ],
              },
            ],
          },
        },
        {
          model: Services,
          as: 'service',
          attributes: ['id', 'name'],
        },
      ],
    });

    console.log('Fetched upcoming appointments:', upcomingAppointments);

    // Send reminder emails for each upcoming appointment
    if (upcomingAppointments.length === 0) {
      console.log('No appointments found for the next hour.');
    } else {
      for (const appointment of upcomingAppointments) {
        await sendReminderEmail(appointment);
      }
    }
  } catch (error) {
    console.error('Error fetching upcoming appointments:', error);
  }
});


// Using Nodemailer for sending emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_SENDER, // Your email address
    pass: process.env.SENDER_PASS, // Your email password or API key
  },
});


// Send Reminder fucntion
async function sendReminderEmail(appointment) {
  try {
    const { UserId, slot, service, id } = appointment;
    const reminder = await Appointments.findOne({ where: { id: id } });

    if (!reminder.reminderSent === true) {
      // Fetch user email
      const user = await User.findOne({ where: { id: UserId } });

      if (!user) {
        console.log('User not found for appointment:', appointment.id);
        return; // Exit the function if the user is not found
      }

      const userEmail = user.email;
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: 'Appointment Reminder',
        text: `Dear Customer,\n\nThis is a reminder for your upcoming appointment.\n\nService: ${service.name}\nDate: ${slot.date}\nTime: ${slot.time}\n\nThank you!`,
      };

      // Using Promises with sendMail to handle errors properly
      transporter.sendMail(mailOptions, async (error, info) => {
        if (error) {
          console.log('Error sending email:', error);
        } else {
          console.log('Email sent: ' + info.response);

          try {
            const reminderSended = await Appointments.findOne({ where: { id: id } });

            if (reminderSended) {
              reminderSended.reminderSent = true;
              await reminderSended.save();
            } else {
              console.log('Appointment not found to update reminderSent status for ID:', id);
            }
          } catch (err) {
            console.log('Error updating reminderSent status:', err);
          }
        }
      });
    }
  } catch (error) {
    console.log('Error in sendReminderEmail function:', error);
  }
}


module.exports = {
  bookAppointments,
  getAppointments,
  cancelAppointment,
  getServices,
  getOpenSlots
}


