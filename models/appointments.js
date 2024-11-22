const Sequelize = require('sequelize');
const sequelize = require('../util/database');
const User = require('./user');
const Services = require('./services');
const Slots = require('./slots');

const Appointments = sequelize.define('Appointments', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    slotId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: Slots,
            key: 'id'
        }
       
    },
    serviceId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: Services,
            key: 'id'
        }
        
    },
    UserId: {
        type: Sequelize.INTEGER,
        references: {
            model: User,
            key: 'id'
        }
       
    },
    endTime: {
        type: Sequelize.TIME, 
        allowNull: false
    },
    status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'active'  // or 'completed' or 'canceled'
    },
    reminderSent: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
});


User.hasMany(Appointments);
Appointments.belongsTo(User);

Services.hasMany(Appointments);
Appointments.belongsTo(Services);

Slots.hasOne(Appointments);
Appointments.belongsTo(Slots);

module.exports = Appointments;





// 1.1. Update Staff Model: Add a new field to track the availability status.

// js
// Copy code
// // In your Sequelize Staff model
// availability: {
//   type: Sequelize.ENUM('free', 'busy'),
//   defaultValue: 'free'
// }
// 1.2. Update Appointment Model: Ensure there's a relationship between Appointment and Staff.

// js
// Copy code
// // Assuming an Appointment can have one staff member
// Appointment.belongsTo(Staff, { as: 'assignedStaff', foreignKey: 'staffId' });
// 2. Modify Appointment Assignment Logic
// 2.1. Check Staff Availability: When an admin is assigning a staff member to an appointment, check the staff's availability. You might need to adjust your backend logic to handle this.

// Example Logic:

// Retrieve available staff based on their availability status.
// Ensure that the staff is not already assigned to an appointment that overlaps with the new one.
// 2.2. Update Staff Status: When a staff member is assigned to an appointment, update their availability status to 'busy'. Once the appointment ends, set it back to 'free'.

// js
// Copy code
// // Example code to update staff availability
// async function assignStaffToAppointment(staffId, appointmentId) {
//   const appointment = await Appointment.findByPk(appointmentId);
//   const staff = await Staff.findByPk(staffId);

//   // Check if the staff is available
//   if (staff.availability === 'free') {
//     // Assign staff to the appointment
//     await appointment.update({ staffId });
//     // Mark the staff as busy
//     await staff.update({ availability: 'busy' });

//     // Optionally, you might want to set a timer or event to mark staff as free once the appointment ends
//   } else {
//     throw new Error('Staff is not available');
//   }
// }
// 3. Update Frontend
// 3.1. Display Staff Availability: When the admin is assigning staff, display the list of staff members with their availability status. You can use different styles or indicators to show if staff is free or busy.

// html
// Copy code
// <!-- Example staff assignment dropdown -->
// <div class="form-group">
//   <label for="staffSelect">Assign Staff</label>
//   <select id="staffSelect" class="form-control">
//     <!-- Options will be dynamically filled -->
//   </select>
// </div>
// 3.2. Populate Dropdown: Fetch available staff from the server and populate the dropdown. Only show staff members who are currently marked as 'free'.

// js
// Copy code
// // Fetch available staff and populate dropdown
// async function populateStaffDropdown() {
//   const response = await axios.get('/api/staff/available');
//   const staffList = response.data;
  
//   const staffSelect = document.getElementById('staffSelect');
//   staffSelect.innerHTML = ''; // Clear previous options
  
//   staffList.forEach(staff => {
//     const option = document.createElement('option');
//     option.value = staff.id;
//     option.textContent = staff.name;
//     staffSelect.appendChild(option);
//   });
// }
// 3.3. Handle Selection: When a staff member is selected, send the assignment request to the server.

// js
// Copy code
// document.getElementById('assignStaffButton').addEventListener('click', async () => {
//   const staffId = document.getElementById('staffSelect').value;
//   const appointmentId = /* get the current appointment ID */;

//   try {
//     await axios.post('/api/appointments/assign-staff', { staffId, appointmentId });
//     alert('Staff assigned successfully');
//   } catch (error) {
//     alert('Error assigning staff');
//   }
// });