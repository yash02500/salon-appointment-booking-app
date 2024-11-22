{/* <button class="btn btn-success btn-sm" onclick="populateStaffDropdown(${appointment.id})">Assign staff</button> */}

// Frontend


// /// Load staff members and display in the table
// async function loadStaff() {
//     try {
//         const response = await axios.get('http://localhost:3000/admin/getStaff', {
//             headers: { adminAuthorization: adminToken }
//         });
//         const staffMembers = response.data;
//         const staffTableBody = document.querySelector('#staffTable tbody');
//         staffTableBody.innerHTML = ''; // Clear the table body

//         staffMembers.forEach(staff => {
//             const row = document.createElement('tr');
//             row.innerHTML = `
//                 <td>${staff.id}</td>
//                 <td>${staff.name}</td>
//                 <td>${staff.email}</td>
//                 <td>${staff.skills}</td>
//                 <td>
//                     <button class="btn btn-info btn-sm" onclick="viewStaffDetails(${staff.id})">View</button>
//                 </td>
//             `;
//             staffTableBody.appendChild(row);
//         });
//     } catch (error) {
//         console.error('Error loading staff members:', error);
//         alert('Failed to load staff members. Please try again.');
//     }
// }

// // View staff details and display in a modal
// async function viewStaffDetails(staffId) {
//     try {
//         const response = await axios.get(`http://localhost:3000/admin/getStaff/${staffId}`, {
//             headers: { adminAuthorization: adminToken }
//         });
//         const staff = response.data;

//         // Populate the modal with the staff details
//         document.getElementById('staffName').innerText = staff.name;
//         document.getElementById('staffEmail').innerText = staff.email;
//         document.getElementById('staffSkills').innerText = staff.skills;

//         // Show the modal
//         $('#staffDetailsModal').modal('show');
//     } catch (error) {
//         console.error('Error fetching staff details:', error);
//         alert('Failed to load staff details. Please try again.');
//     }
// }

// // Add a new staff member
// async function addStaff() {
//     const newStaffName = document.getElementById('newStaffName').value;
//     const newStaffEmail = document.getElementById('newStaffEmail').value;
//     const newStaffSkills = document.getElementById('newStaffSkills').value;

//     const newStaff = {
//         name: newStaffName,
//         email: newStaffEmail,
//         skills: newStaffSkills
//     };

//     try {
//         await axios.post('http://localhost:3000/admin/addStaff', newStaff, {
//             headers: { adminAuthorization: adminToken }
//         });
//         alert('Staff member added successfully!');
//         $('#addStaffModal').modal('hide');
//         loadStaff();
//     } catch (error) {
//         console.error('Error adding staff member:', error);
//         alert('Failed to add staff member. Please try again.');
//     }
// }


// // Fetch available staff and populate dropdown
// async function populateStaffDropdown(appointmentId) {
//     try{
//     const response = await axios.get('http://localhost:3000/admin/getStaff/available', {
//         headers: {adminAuthorization: adminToken}
//     });
//     console.log(response.data)
//     const staffList = response.data;
    
//     const staffSelect = document.getElementById('staffSelect');
//     staffSelect.innerHTML = ''; // Clear previous options
    
//     staffList.forEach(staff => {
//       const option = document.createElement('option');
//       const Assign = document.createElement('button');
//       option.value = staff.id;
//       option.textContent = `Name: ${staff.name} Skill: ${staff.skills}`;
//       Assign.textContent = 'Assign';
//       Assign.addEventListener('click',()=> assignStaff(staff.id, appointmentId));
//       staffSelect.appendChild(option);
//       option.appendChild(Assign);
//     });
//    }catch(error){
//     console.log(error);
//    }
//   }

// // Assign
// async function assignStaff(staffId, appointmentId) {  
//     try {
//       await axios.post(`http://localhost:3000/admin/assignStaff/${staffId}/${appointmentId}`, {
//         headers: {adminAuthorization: adminToken} 
//     });
//       alert('Staff assigned successfully');
//     } catch (error) {
//       alert('Error assigning staff');
//     }
// }



// Routes

//routes.post('/addStaff', userAuthentication.authenticateAdmin, adminControll.addStaff);
// routes.get('/getStaff', userAuthentication.authenticateAdmin, adminControll.getStaff);
// routes.get('/getStaff/:staffId', userAuthentication.authenticateAdmin, adminControll.viewStaffDetails);
// routes.get('/getStaff/available', userAuthentication.authenticateAdmin, adminControll.availableStaff);


// Backend

// // Add new staff
// const addStaff = async (req, res) => {
//     console.log("Request received", req.body);
//     const { name, email, skills } = req.body;
//     if (!name || !email || !skills) {
//         return res.sendStatus(400);
//     }

//     try {
//         const addNewStaff = await Staff.create({
//             name: name,
//             email: email,
//             skills: skills
//         });
//         res.status(201).json({ message: 'New staff added', addNewStaff });

//     } catch (error) {
//         console.log(error, JSON.stringify(error));
//         res.status(500).json({ error });
//     }
// }

// // Get staffs
// const getStaff = async (req, res) => {
//     try {
//         const staff = await Staff.findAll();
//         res.status(201).json(staff);
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ error });
//     }
// }


// // View selected staff details 
// const viewStaffDetails = async (req, res) => {
//     const staffId = req.params.staffId
//     try {
//         const staff = await Staff.findOne({ where: { id: staffId } });
//         res.status(201).json(staff);

//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ error });
//     }
// }


// // Available 
// const availableStaff = async (req, res) => {
//     try {
//         const freeStaff = await Staff.findAll({where: {availability: 'free'}}); // maybe in ''
//         console.log(freeStaff, 'frfrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrffff'); // Log the result to check the data
//         res.status(201).json(freeStaff);

//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ error });
//     }
// }


// model

// const Sequelize = require('sequelize');
// const sequelize = require('../util/database');

// const Staff = sequelize.define('Staff', {
//     id: {
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         allowNull: false,
//         primaryKey: true
//     },
//     name: {
//         type: Sequelize.STRING,
//         allowNull: false
//     },
//     email: {
//         type: Sequelize.STRING,
//         allowNull: false
//     },
//     skills: {
//         type: Sequelize.STRING,
//         allowNull: false //maybe true
//     },
//     availability: {
//     type: Sequelize.ENUM('free', 'busy'),
//     defaultValue: 'free'
//   }
  
// });

// module.exports = Staff;



// Associations in appointment model


// Staff.hasOne(Appointments);
// Appointments.belongsTo(Staff, { as: 'assignedStaff', foreignKey: 'id' });



// Html


// <li class="nav-item">
//         <a class="nav-link" id="staff-tab" data-toggle="tab" href="#staff" role="tab" aria-controls="staff"
//           aria-selected="false">Staff Management</a>
//       </li>


     // <!-- Staff Management Section -->
//       <div class="tab-pane fade" id="staff" role="tabpanel" aria-labelledby="staff-tab">
//         <div class="card mb-4">
//           <div class="card-header">Manage Staff</div>
//           <div class="card-body">
//             <!-- Button to open Add Staff Modal -->
//             <button type="button" class="btn btn-primary mb-4" data-toggle="modal" data-target="#addStaffModal">Add New
//               Staff</button>

//             <!-- Staff Table -->
//             <table class="table table-striped" id="staffTable">
//               <thead>
//                 <tr>
//                   <th>Id</th>
//                   <th>Name</th>
//                   <th>Email</th>
//                   <th>Skills</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 <!-- Dynamically filled by JavaScript -->
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>

//       <!-- Staff Details Modal -->
//       <div class="modal fade" id="staffDetailsModal" tabindex="-1" role="dialog"
//         aria-labelledby="staffDetailsModalLabel" aria-hidden="true">
//         <div class="modal-dialog" role="document">
//           <div class="modal-content">
//             <div class="modal-header">
//               <h5 class="modal-title" id="staffDetailsModalLabel">Staff Details</h5>
//               <button type="button" class="close" data-dismiss="modal" aria-label="Close">
//                 <span aria-hidden="true">&times;</span>
//               </button>
//             </div>
//             <div class="modal-body">
//               <p><strong>Name:</strong> <span id="staffName"></span></p>
//               <p><strong>Email:</strong> <span id="staffEmail"></span></p>
//               <p><strong>Skills:</strong> <span id="staffSkills"></span></p>
//             </div>
//             <div class="modal-footer">
//               <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
//             </div>
//           </div>
//         </div>
//       </div>

//       <!-- Add Staff Modal -->
//       <div class="modal fade" id="addStaffModal" tabindex="-1" role="dialog" aria-labelledby="addStaffModalLabel"
//         aria-hidden="true">
//         <div class="modal-dialog" role="document">
//           <div class="modal-content">
//             <div class="modal-header">
//               <!-- <h5 class="modal-title" id="addStaffModalLabel">Add New Staff</h5> -->
//               <button type="button" class="close" data-dismiss="modal" aria-label="Close">
//                 <span aria-hidden="true">&times;</span>
//               </button>
//             </div>
//             <div class="modal-body">
//               <form id="addStaffForm">
//                 <div class="form-group">
//                   <label for="newStaffName">Name</label>
//                   <input type="text" class="form-control" id="newStaffName" name="newStaffName">
//                 </div>
//                 <div class="form-group">
//                   <label for="newStaffEmail">Email</label>
//                   <input type="email" class="form-control" id="newStaffEmail" name="newStaffEmail" required>
//                 </div>
//                 <div class="form-group">
//                   <label for="newStaffSkills">Skills</label>
//                   <input type="text" class="form-control" id="newStaffSkills" name="newStaffSkills">
//                 </div>
//                 <button type="button" class="btn btn-primary" onclick="addStaff()">Add Staff</button>
//               </form>
//             </div>
//           </div>
//         </div>
//       </div>

// <!-- Example staff assignment dropdown -->
//    <div class="form-group">
//      <label for="staffSelect">Assign Staff</label>
//      <select id="staffSelect" class="form-control">
//        <!-- Options will be dynamically filled -->
//      </select>
//    </div>
