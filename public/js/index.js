const token = localStorage.getItem("token");

if (!token) {
  alert("You need to login first");
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", function () {
  // Fetch and display services
  fetchAndDisplayServices();

  // Event listener for "Book Now" buttons (this will be set dynamically after fetching services)
  document.getElementById("profileIcon").addEventListener("click", function (event) {
    event.preventDefault();
    fetchUserProfile(); // Call function to fetch user profile
    fetchAppointments();
  });
});

// Function to fetch services from the backend
async function fetchAndDisplayServices() {
  try {
    const response = await axios.get("http://localhost:3000/services/getServices", {
      headers: { Authorization: token }
    });
    const services = response.data; // Assuming this returns an array of services

    displayServices(services); // Call the function to display the fetched services
  } catch (error) {
    console.error("Error fetching services:", error);
    alert("Failed to load services data. Please try again.");
  }
}

function displayServices(services) {
  const servicesContainer = document.querySelector(".row"); // Assuming .row is the container for services

  // Clear any existing service elements
  servicesContainer.innerHTML = '';

  // Loop through each service in the services array
  services.forEach((service) => {
    // Create a new div element for each service card
    const serviceCard = document.createElement("div");
    serviceCard.classList.add("col-md-4");

    // Set the inner HTML of the service card
    serviceCard.innerHTML = `
      <div class="card service-card">
        <div class="card-body">
          <h5 class="card-title" id="serviceTitle">${service.name}</h5>
          <p class="card-text" id="serviceDescription">${service.description}</p>
          <p class="card-text" id="serviceDuration"><strong>Duration:</strong> ${service.duration} minutes</p>
          <p class="card-text" id="servicePrice"><strong>Price:</strong> $${service.price}</p>
          <button class="btn btn-primary btn-block book-btn" data-service-id="${service.id}" data-service-name="${service.name}">Book Now</button>
        </div>
      </div>
    `;

    // Append the newly created service card to the container
    servicesContainer.appendChild(serviceCard);
  });

  // Reattach event listeners to dynamically created "Book Now" buttons
  attachBookNowEventListeners();
}

// Function to attach event listeners to "Book Now" buttons
function attachBookNowEventListeners() {
  const bookButtons = document.querySelectorAll(".book-btn");
  bookButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const serviceId = this.getAttribute("data-service-id");
      getAvailableSlots(serviceId);
    });
  });
}

// Function to fetch available slots from the backend
async function getAvailableSlots(serviceId) {
  try {
    const response = await axios.get("http://localhost:3000/user/getOpenSlots", {
      headers: { Authorization: token }
    });
    
    const data = response.data;
    displayAvailableSlots(data.slots, serviceId); // Pass serviceId to the display function
  } catch (error) {
    console.error('Error fetching available slots:', error);
  }
}

// Function to display slots in the UI
function displayAvailableSlots(slots, serviceId) {
  const slotsContainer = document.getElementById('slotsContainer'); // Ensure there's a container with this ID
  const availableSlots = document.getElementById('availableSlots'); // Ensure there's a container with this ID

  if(slots.length<=0){
    availableSlots.textContent='Slots will be available soon...';
  }
  availableSlots.textContent='';
  slotsContainer.innerHTML = ''; // Clear any existing content

  slots.forEach(slot => {
    const slotElement = document.createElement('div');
    slotElement.classList.add('slot');
    slotElement.innerHTML = `
      <p>Date: ${new Date(slot.date).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
               })}</p>
      <p>Time: ${slot.time}</p>
      <button class="btn btn-primary book-slot-btn" data-slot-id="${slot.id}">Book Slot</button>
    `;

    slotsContainer.appendChild(slotElement);

    slotElement.querySelector('.book-slot-btn').addEventListener('click', function() {
      bookAppointment(slot.id, serviceId);
    });    
  });

  availableSlots.appendChild(slotsContainer);

  // Show the modal
  $("#slotsModal").modal("show");
}


// Function to book an appointment for the selected slot
async function bookAppointment(slotId, serviceId) {
  const appointmentDetails = {
    slot: slotId,
    service: serviceId
  };

  try {
    const response = await axios.post("http://localhost:3000/user/appointment", appointmentDetails, {
      headers: { Authorization: token },
    });

    alert(`Appointment booked successfully!`);
    $("#slotsModal").modal("hide");
  } catch (error) {
    console.log(error);
    alert("Failed to book appointment. Please try again.");
  }
}

// Function to fetch user profile data
async function fetchUserProfile() {
  try {
    const response = await axios.get("http://localhost:3000/user/profile", {
      headers: { Authorization: token }, // Include the token in the request headers
    });

    const userData = response.data; // Get user data from response
    document.getElementById("profileName").value = userData.name;
    document.getElementById("profileEmail").value = userData.email;
    $("#profileModal").modal("show"); // Show the profile modal

  } catch (error) {
    console.error("Error fetching user profile:", error);
    alert("Failed to load profile data. Please try again.");
  }
}


// Function to fetch user profile data
async function fetchAppointments() {
  try {
    const response = await axios.get("http://localhost:3000/user/getAppointments", {
      headers: { Authorization: token }, // Include the token in the request headers
    });

    const appointments = response.data; // Get user data from response
    displayUserAppointments(appointments); // Function to display appointments
    $("#profileModal").modal("show"); // Show the profile modal

  } catch (error) {
    console.error("Error fetching user appointments:", error);
    alert("Failed to load appointments data. Please try again.");
  }
}


// Display user appointments
function displayUserAppointments(appointments) {
  const appointmentsList = document.getElementById('appointmentsList');
  appointmentsList.innerHTML = '';

  if (appointments.length === 0) {
    appointmentsList.innerHTML = '<li class="list-group-item">No appointments booked.</li>';
    return;
  }

  appointments.forEach(appointment => {
    const listItem = document.createElement('li');
    listItem.classList.add('list-group-item');

    // Display appointment details
    const serviceName = appointment.service ? appointment.service.name : 'N/A';
    const slotDate = appointment.slot ? new Date(appointment.slot.date).toLocaleDateString() : 'N/A';
    const slotTime = appointment.slot ? appointment.slot.time : 'N/A';

    listItem.textContent = `Service: ${serviceName}, Date: ${slotDate}, Time: ${slotTime}`;

    // Check if the appointment status is "completed"
    if (appointment.status === "completed") {
      // If completed, show "Completed" label
      const completedLabel = document.createElement('span');
      completedLabel.classList.add('badge', 'badge-success', 'ml-2');
      completedLabel.innerText = 'Completed';
      listItem.appendChild(completedLabel);
    } else {
      // If not completed, show "Cancel" button
      const cancel = document.createElement('button');
      cancel.classList.add('btn', 'btn-danger', 'delete-btn');
      cancel.style.float = 'right';
      cancel.innerText = "Cancel";
      cancel.addEventListener('click', () => deleteUserAppointment(appointment.id, appointment.slotId));
      listItem.appendChild(cancel);
    }

    appointmentsList.appendChild(listItem);
  });
}


// DeleteUserAppointment function 
async function deleteUserAppointment(appointmentId, slotId) {
  try {
    const response = await axios.delete(`http://localhost:3000/user/cancelAppointment/${appointmentId}/${slotId}`, {
      headers: { Authorization: token },
    });
    alert('Appointment deleted successfully!');
    fetchAppointments(); // Refresh the appointments list after deletion

  } catch (error) {
    console.error('Error deleting appointment:', error);
    alert('Failed to delete appointment. Please try again.');
  }
}

// User Logout
function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}






// const token = localStorage.getItem("token");

// if (!token) {
//   alert("You need to login first");
//   window.location.href = "login.html";
// }


// document.addEventListener("DOMContentLoaded", function () {
//   // Event listener for "Book Now" buttons
//   const bookButtons = document.querySelectorAll(".book-btn");
//   bookButtons.forEach((button) => {
//     button.addEventListener("click", function () {
//       const service = this.getAttribute("data-service");
//       showSlots(service);
//     });
//   });

//   // Add click event listener to profile icon
//   document.getElementById("profileIcon").addEventListener("click", function (event) {
//     event.preventDefault();
//     fetchUserProfile(); // Call function to fetch user profile
//     fetchAppointments();
//   });
// });


// // Function to show available slots for the selected service
// function showSlots(service) {
//   // Update the modal title with the selected service name
//   // document.getElementById("serviceName").innerText = service;

//   // Example available slots (these would be fetched from a backend in a real application)
//   const slots = [
//     "Monday, 10:00 AM",
//     "Monday, 11:00 AM",
//     "Tuesday, 2:00 PM",
//     "Wednesday, 1:00 PM",
//     "Thursday, 4:00 PM",
//   ];

//   // Clear the previous slots
//   const slotsContainer = document.getElementById("availableSlots");
//   slotsContainer.innerHTML = "";

//   // Populate the modal with available slots
//   slots.forEach((slot) => {
//     const slotButton = document.createElement("button");
//     slotButton.className = "btn btn-outline-primary slot-button btn-block";
//     slotButton.innerText = slot;
//     slotButton.onclick = function () {
//       bookAppointment(slot, service);
//     };
//     slotsContainer.appendChild(slotButton);
//   });

//   // Show the modal
//   $("#slotsModal").modal("show");
// }


// // Function to book an appointment for the selected slot
// async function bookAppointment(slot, service) {

//   const appointmentDetails = {
//     slot: slot,
//     service: service
//   }

//   try {
//     const response = await axios.post('http://localhost:3000/user/appointment', appointmentDetails, {
//       headers: { Authorization: token }
//     });

//     alert(`Appointment booked for: ${service} at ${slot}`);
//     $("#slotsModal").modal("hide");

//   } catch (error) {
//     console.log(error);
//   }

// }


// // Function to fetch user profile data
// async function fetchUserProfile() {
//   if (!token) {
//     alert("You are not logged in!");
//     return;
//   }

//   try {
//     const response = await axios.get("http://localhost:3000/user/profile", {
//       headers: { Authorization: token }, // Include the token in the request headers
//     })

//     const userData = response.data; // Get user data from response
//     document.getElementById("profileName").value = userData.name;
//     document.getElementById("profileEmail").value = userData.email;
//     $("#profileModal").modal("show"); // Show the profile modal

//   } catch (error) {
//     console.error("Error fetching user profile:", error);
//     alert("Failed to load profile data. Please try again.");
//   };
// }


// // Function to fetch user profile data
// async function fetchAppointments() {
//   if (!token) {
//     alert("You are not logged in!");
//     return;
//   }

//   try {
//     const response = await axios.get("http://localhost:3000/user/getAppointments", {
//       headers: { Authorization: token }, // Include the token in the request headers
//     })

//     const appointments = response.data; // Get user data from response
//     displayUserAppointments(appointments); // Function to display appointments
//     $("#profileModal").modal("show"); // Show the profile modal

//   } catch (error) {
//     console.error("Error fetching user appointments:", error);
//     alert("Failed to load appointmetns data. Please try again.");
//   }
// }

// // Display user appointments
// function displayUserAppointments(appointments) {
//   const appointmentsList = document.getElementById('appointmentsList');
//   appointmentsList.innerHTML = '';

//   if (appointments.length === 0) {
//     appointmentsList.innerHTML = '<li class="list-group-item">No appointments booked.</li>';
//     return;
//   }

//   appointments.forEach(appointment => {
//     const listItem = document.createElement('li');
//     const cancel = document.createElement('button');
//     cancel.classList.add('btn', 'btn-danger', 'delete-btn');
//     cancel.style.float = 'right';
//     cancel.innerText = "Cancel";
//     cancel.addEventListener('click', () => deleteUserAppointment(appointment.id));

//     listItem.classList.add('list-group-item');
//     listItem.textContent = `Service: ${appointment.service}, Time: ${appointment.slot}`;
//     listItem.appendChild(cancel);
//     appointmentsList.appendChild(listItem);
//   });

// }


// // DeleteUserAppointment function 
// async function deleteUserAppointment(appointmentId) {
//   if (!token) {
//     alert('You are not logged in!');
//     return;
//   }
//   console.log(appointmentId, "yooo");

//   try {
//     const response = await axios.delete(`http://localhost:3000/user/cancelAppointment/${appointmentId}`, {
//       headers: { Authorization: token },
//     })
//     alert('Appointment deleted successfully!');
//     fetchAppointments(); // Refresh the appointments list after deletion

//   } catch (error) {
//     console.error('Error deleting appointment:', error);
//     alert('Failed to delete appointment. Please try again.');
//   }
// }

// // User Logout
// function logout() {
//   localStorage.removeItem("token");
//   window.location.href = "login.html";
// }
