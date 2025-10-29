// Room prices and details
const roomPrices = {
    "Couple's Nest": 6800,
    "Mountain View Suite": 8000,
    "Group Lodge": 22000
};

// Set minimum date to today
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('check_in').min = today;
    document.getElementById('check_out').min = today;
});

// Update check-out minimum date based on check-in selection
function updateCheckOutMin() {
    const checkIn = document.getElementById('check_in');
    const checkOut = document.getElementById('check_out');
    checkOut.min = checkIn.value;
    
    // If check-out date is before new check-in date, update it
    if (checkOut.value && checkOut.value < checkIn.value) {
        checkOut.value = checkIn.value;
    }
    calculateStayDuration();
}

// Calculate and display the duration of stay
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

// Function to suggest/allot a room based on the number of people
function filterRooms(numberOfPeople) {
    const people = parseInt(numberOfPeople);
    const roomInput = document.getElementById('room_type');
    const message = document.getElementById('room-message');
    roomInput.value = ''; // Clear previous value
    message.textContent = ''; // Clear previous message
    
    // Logic to allot a room based on capacity
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
        calculateStayDuration(); // Update total price when room changes
    } else {
        roomInput.value = "Select number of people first";
    }
}

// Update total price based on room and duration
function updateTotalPrice(nights) {
    const totalPrice = document.getElementById('total-price');
    const roomType = document.getElementById('room_type').value;
    
    if (roomType && nights > 0) {
        // Extract room name from the room type string
        const roomName = Object.keys(roomPrices).find(name => roomType.includes(name));
        if (roomName) {
            const price = roomPrices[roomName] * nights;
            totalPrice.textContent = `Total Price: $${price} for ${nights} night${nights !== 1 ? 's' : ''}`;
        }
    } else {
        totalPrice.textContent = '';
    }
}

// Enhanced client-side form validation
function validateForm() {
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