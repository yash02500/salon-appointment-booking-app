const token = localStorage.getItem("token");

if (!token) {
  alert("You need to login first");
  window.location.href = "login.html";
}


document.addEventListener("DOMContentLoaded", function () {
  // Event listener for "Book Now" buttons
  const bookButtons = document.querySelectorAll(".book-btn");
  bookButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const service = this.getAttribute("data-service");
      showSlots(service);
    });
  });

  // Add click event listener to profile icon
  document.getElementById("profileIcon").addEventListener("click", function (event) {
    event.preventDefault();
    fetchUserProfile(); // Call function to fetch user profile
    fetchAppointments();
  });
});


// Function to show available slots for the selected service
function showSlots(service) {
  // Update the modal title with the selected service name
  document.getElementById("serviceName").innerText = service;

  // Example available slots (these would be fetched from a backend in a real application)
  const slots = [
    "Monday, 10:00 AM",
    "Monday, 11:00 AM",
    "Tuesday, 2:00 PM",
    "Wednesday, 1:00 PM",
    "Thursday, 4:00 PM",
  ];

  // Clear the previous slots
  const slotsContainer = document.getElementById("availableSlots");
  slotsContainer.innerHTML = "";

  // Populate the modal with available slots
  slots.forEach((slot) => {
    const slotButton = document.createElement("button");
    slotButton.className = "btn btn-outline-primary slot-button btn-block";
    slotButton.innerText = slot;
    slotButton.onclick = function () {
      bookAppointment(slot, service);
    };
    slotsContainer.appendChild(slotButton);
  });

  // Show the modal
  $("#slotsModal").modal("show");
}


// Function to book an appointment for the selected slot
async function bookAppointment(slot, service) {

  const appointmentDetails = {
    slot: slot,
    service: service
  }

  try {
    const response = await axios.post('http://localhost:3000/user/appointment', appointmentDetails, {
      headers: { Authorization: token }
    });

    alert(`Appointment booked for: ${service} at ${slot}`);
    $("#slotsModal").modal("hide");

  } catch (error) {
    console.log(error);
  }

}


// Function to fetch user profile data
async function fetchUserProfile() {
  if (!token) {
    alert("You are not logged in!");
    return;
  }

  try {
    const response = await axios.get("http://localhost:3000/user/profile", {
      headers: { Authorization: token }, // Include the token in the request headers
    })

    const userData = response.data; // Get user data from response
    document.getElementById("profileName").value = userData.name;
    document.getElementById("profileEmail").value = userData.email;
    $("#profileModal").modal("show"); // Show the profile modal

  } catch (error) {
    console.error("Error fetching user profile:", error);
    alert("Failed to load profile data. Please try again.");
  };
}


// Function to fetch user profile data
async function fetchAppointments() {
  if (!token) {
    alert("You are not logged in!");
    return;
  }

  try {
    const response = await axios.get("http://localhost:3000/user/getAppointments", {
      headers: { Authorization: token }, // Include the token in the request headers
    })

    const appointments = response.data; // Get user data from response
    displayUserAppointments(appointments); // Function to display appointments
    $("#profileModal").modal("show"); // Show the profile modal

  } catch (error) {
    console.error("Error fetching user appointments:", error);
    alert("Failed to load appointmetns data. Please try again.");
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
    const cancel = document.createElement('button');
    cancel.classList.add('btn', 'btn-danger', 'delete-btn');
    cancel.style.float = 'right';
    cancel.innerText = "Cancel";
    cancel.addEventListener('click', () => deleteUserAppointment(appointment.id));

    listItem.classList.add('list-group-item');
    listItem.textContent = `Service: ${appointment.service}, Time: ${appointment.slot}`;
    listItem.appendChild(cancel);
    appointmentsList.appendChild(listItem);
  });

}


// DeleteUserAppointment function 
async function deleteUserAppointment(appointmentId) {
  if (!token) {
    alert('You are not logged in!');
    return;
  }
  console.log(appointmentId, "yooo");

  try {
    const response = await axios.delete(`http://localhost:3000/user/cancelAppointment/${appointmentId}`, {
      headers: { Authorization: token },
    })
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
