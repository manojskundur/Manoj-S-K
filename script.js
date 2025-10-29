 const rentBtns = document.querySelectorAll(".rentBtn");
const popup = document.getElementById("bookingPopup");
const closePopup = document.getElementById("closePopup");
const bookingForm = document.getElementById("bookingForm");
const bikeNameInput = document.getElementById("bikeName");

// Function to set the minimum date to today
function setMinDate() {
  const dateInput = document.getElementById("date");
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(today.getDate()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;
  dateInput.min = formattedDate;
}

// Call the function when the page loads
document.addEventListener("DOMContentLoaded", setMinDate);


// Show popup when "Rent Now" is clicked
rentBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const bikeName = btn.getAttribute("data-bike");
    const bikeAmount = parseFloat(btn.getAttribute("data-amount"));
    bikeNameInput.value = bikeName;
    popup.style.display = "flex";

    // Store bike price for calculation
    popup.setAttribute("data-price", bikeAmount);
    document.getElementById("totalCost").innerText = ""; // reset cost display
  });
});

// Close popup
closePopup.addEventListener("click", () => {
  popup.style.display = "none";
});

// Auto calculate cost when user enters days
document.getElementById("days").addEventListener("input", () => {
  const days = parseInt(document.getElementById("days").value);
  const pricePerDay = parseFloat(popup.getAttribute("data-price"));
  if (!isNaN(days) && days > 0) {
    const total = days * pricePerDay;
    document.getElementById("totalCost").innerText = `Total Cost: ₹${total}`;
  } else {
    document.getElementById("totalCost").innerText = "";
  }
});

// Handle booking form
bookingForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const age = document.getElementById("age").value;
  const date = document.getElementById("date").value;
  const days = document.getElementById("days").value;
  const bike = bikeNameInput.value;
  const pricePerDay = parseFloat(popup.getAttribute("data-price"));
  const total = days * pricePerDay;

  if (age >= 18) {
    alert(`✅ Booking Confirmed!\n\nName: ${name}\nAge: ${age}\nBike: ${bike}\nDate: ${date}\nDays: ${days}\nTotal Cost: ₹${total}`);
  } else {
    alert(`🔞 Age Restriction: Booking not allowed.\nYou must be at least 18 years old.`);
  }

  bookingForm.reset();
  popup.style.display = "none";
});