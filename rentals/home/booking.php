<?php
// booking.php

// 1. Database Connection Details (REPLACE with your actual credentials)
$servername = "localhost";
$username = "your_db_user"; 
$password = "your_db_password"; 
$dbname = "homestay_bookings_db";

// 2. Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// 3. Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// 4. Check if the form was submitted using POST method
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // 5. Get and Sanitize Form Data (VERY IMPORTANT FOR SECURITY)
    $name = $conn->real_escape_string($_POST['name']);
    $email = $conn->real_escape_string($_POST['email']);
    $phone = $conn->real_escape_string($_POST['phone']);
    $members = (int)$_POST['members']; // Cast to integer
    $room_type = $conn->real_escape_string($_POST['room_type']);
    $booking_date = date("Y-m-d H:i:s"); // Timestamp the booking

    // 6. SQL to insert data into the 'bookings' table
    // (You must create this table in your database first!)
    $sql = "INSERT INTO bookings (name, email, phone, members, room_type, booking_date)
            VALUES ('$name', '$email', '$phone', $members, '$room_type', '$booking_date')";

    // 7. Execute the query
    if ($conn->query($sql) === TRUE) {
        echo "<h2>✅ Booking Successful!</h2>";
        echo "<p>Thank you, **$name**! Your booking for the **$room_type** has been confirmed.</p>";
        echo "<p>We will contact you shortly at **$email** or **$phone**.</p>";
    } else {
        echo "<h2>❌ Error:</h2>" . $sql . "<br>" . $conn->error;
    }
}

// 8. Close connection
$conn->close();

// Optional: Provide a link back to the homepage
echo "<p><a href='index.html'>Go back to the homepage</a></p>";
?>