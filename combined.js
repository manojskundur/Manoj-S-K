// Room prices and details
const roomPrices = {
    "Couple's Nest": 6800,
    "Mountain View Suite": 8000,
    "Group Lodge": 22000
};

// Vehicle rental prices
const vehiclePrices = {
    "KTM 390 Duke": 1500,
    "Royal Enfield": 1200,
    "Activa": 400
};

// Set minimum date to today for all date inputs
document.addEventListener('DOMContentLoaded', function() {
    // Room booking date initialization
    const today = new Date().toISOString().split('T')[0];
    const checkInInput = document.getElementById('check_in');
    const checkOutInput = document.getElementById('check_out');
    if (checkInInput && checkOutInput) {
        checkInInput.min = today;
        checkOutInput.min = today;
    }

    // Vehicle rental date initialization
    const dateInput = document.getElementById('date');
    if (dateInput) {
        dateInput.min = today;
    }

    // Initialize vehicle rental buttons
    initializeVehicleRental();
});

// Room Booking Functions
function updateCheckOutMin() {
    const checkIn = document.getElementById('check_in');
    const checkOut = document.getElementById('check_out');
    if (checkIn && checkOut) {
        checkOut.min = checkIn.value;
        
        if (checkOut.value && checkOut.value < checkIn.value) {
            checkOut.value = checkIn.value;
        }
        calculateStayDuration();
    }
}

function calculateStayDuration() {
    const checkIn = new Date(document.getElementById('check_in').value);
    const checkOut = new Date(document.getElementById('check_out').value);
    const stayDuration = document.getElementById('stay-duration');
    
    if (checkIn && checkOut && checkOut >= checkIn) {
        const nights = (checkOut - checkIn) / (1000 * 60 * 60 * 24);
        stayDuration.textContent = `Duration of stay: ${nights} night${nights !== 1 ? 's' : ''}`;
        updateTotalPrice(nights);
    } else {
        stayDuration.textContent = '';
    }
}

function filterRooms(numberOfPeople) {
    const people = parseInt(numberOfPeople);
    const roomInput = document.getElementById('room_type');
    const message = document.getElementById('room-message');
    if (!roomInput || !message) return;

    roomInput.value = ''; // Clear previous value
    message.textContent = ''; // Clear previous message
    
    if (people > 0) {
        let roomName;
        if (people <= 2) {
            roomName = "Couple's Nest";
            roomInput.value = `${roomName} (2 People - ₹6800/Day)`;
        } else if (people <= 4) {
            roomName = "Mountain View Suite";
            roomInput.value = `${roomName} (4 People - ₹8000/Day)`;
        } else if (people <= 6) {
            roomName = "Group Lodge";
            roomInput.value = `${roomName} (6 People - ₹22000/Day)`;
        } else {
            roomInput.value = "Contact us for custom arrangements";
            message.textContent = "We recommend contacting us for groups larger than 6.";
        }
        calculateStayDuration();
    } else {
        roomInput.value = "Select number of people first";
    }
}

function updateTotalPrice(nights) {
    const totalPrice = document.getElementById('total-price');
    const roomType = document.getElementById('room_type');
    if (!totalPrice || !roomType) return;

    const roomTypeValue = roomType.value;
    
    if (roomTypeValue && nights > 0) {
        const roomName = Object.keys(roomPrices).find(name => roomTypeValue.includes(name));
        if (roomName) {
            const price = roomPrices[roomName] * nights;
            totalPrice.textContent = `Total Price: ₹${price} for ${nights} night${nights !== 1 ? 's' : ''}`;
        }
    } else {
        totalPrice.textContent = '';
    }
}

// Vehicle Rental Functions
function initializeVehicleRental() {
    const rentBtns = document.querySelectorAll(".rentBtn");
    const popup = document.getElementById("bookingPopup");
    const closePopup = document.getElementById("closePopup");
    const bookingForm = document.getElementById("bookingForm");
    const bikeNameInput = document.getElementById("bikeName");

    if (!popup || !bookingForm) return;

    // Show popup when "Rent Now" is clicked
    rentBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const bikeName = btn.getAttribute("data-bike");
            const bikeAmount = parseFloat(btn.getAttribute("data-amount"));
            if (bikeNameInput) bikeNameInput.value = bikeName;
            popup.style.display = "flex";
            popup.setAttribute("data-price", bikeAmount);
            
            const totalCost = document.getElementById("totalCost");
            if (totalCost) totalCost.innerText = "";
        });
    });

    // Close popup
    if (closePopup) {
        closePopup.addEventListener("click", () => {
            popup.style.display = "none";
        });
    }

    // Auto calculate cost for vehicle rental
    const daysInput = document.getElementById("days");
    if (daysInput) {
        daysInput.addEventListener("input", () => {
            const days = parseInt(daysInput.value);
            const pricePerDay = parseFloat(popup.getAttribute("data-price"));
            const totalCost = document.getElementById("totalCost");
            
            if (!isNaN(days) && days > 0 && totalCost) {
                const total = days * pricePerDay;
                totalCost.innerText = `Total Cost: ₹${total}`;
            } else if (totalCost) {
                totalCost.innerText = "";
            }
        });
    }

    // Handle vehicle booking form submission
    bookingForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("name").value;
        const age = document.getElementById("age").value;
        const date = document.getElementById("date").value;
        const days = document.getElementById("days").value;
        const bike = bikeNameInput.value;
        const pricePerDay = parseFloat(popup.getAttribute("data-price"));
        const total = days * pricePerDay;

        if (parseInt(age) >= 18) {
            alert(`✅ Booking Confirmed!\n\nName: ${name}\nAge: ${age}\nVehicle: ${bike}\nDate: ${date}\nDays: ${days}\nTotal Cost: ₹${total}`);
            bookingForm.reset();
            popup.style.display = "none";
        } else {
            alert(`🔞 Age Restriction: Booking not allowed.\nYou must be at least 18 years old.`);
        }
    });
}

// Form Validation Functions
function validateForm() {
    const form = document.getElementById('booking-form');
    if (!form) return true;

    const roomType = document.getElementById('room_type').value;
    const checkIn = document.getElementById('check_in').value;
    const checkOut = document.getElementById('check_out').value;
    
    if (roomType === "Select number of people first" || roomType === "Contact us for custom arrangements") {
        alert("Please select the number of people and ensure a suitable room is suggested.");
        return false;
    }
    
    if (!checkIn || !checkOut) {
        alert("Please select both check-in and check-out dates.");
        return false;
    }
    
    const nights = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);
    if (nights < 1) {
        alert("Check-out date must be after check-in date.");
        return false;
    }
    
    return true;
}
    
 