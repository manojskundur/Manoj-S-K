<?php
require_once 'db_config.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Sanitize input data
    $name = $conn->real_escape_string($_POST['name']);
    $email = $conn->real_escape_string($_POST['email']);
    $phone = $conn->real_escape_string($_POST['phone']);
    $check_in = $conn->real_escape_string($_POST['check_in']);
    $check_out = $conn->real_escape_string($_POST['check_out']);
    $members = (int)$_POST['members'];
    $room_type = $conn->real_escape_string($_POST['room_type']);

    // Calculate total amount
    $room_prices = [
        "Mountain View Suite" => 150,
        "Couple's Nest" => 80,
        "Group Lodge" => 220
    ];

    // Extract room name from the selection
    $room_name = explode(" (", $room_type)[0];
    $price_per_day = $room_prices[$room_name];
    
    // Calculate number of nights
    $date1 = new DateTime($check_in);
    $date2 = new DateTime($check_out);
    $interval = $date1->diff($date2);
    $num_nights = $interval->days;
    
    $total_amount = $price_per_day * $num_nights;

    // Insert booking into database
    $sql = "INSERT INTO homestay_bookings (name, email, phone, check_in_date, check_out_date, 
            num_members, room_type, total_amount) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssssids", $name, $email, $phone, $check_in, $check_out, 
                      $members, $room_name, $total_amount);

    if ($stmt->execute()) {
        $booking_id = $stmt->insert_id;
        
        // Send confirmation email
        $to = $email;
        $subject = "Booking Confirmation - Hillside Retreats";
        $message = "Dear $name,\n\n"
                . "Thank you for booking with Hillside Retreats!\n\n"
                . "Booking Details:\n"
                . "Booking ID: $booking_id\n"
                . "Room: $room_name\n"
                . "Check-in: $check_in\n"
                . "Check-out: $check_out\n"
                . "Number of Guests: $members\n"
                . "Total Amount: $$total_amount\n\n"
                . "We look forward to hosting you!\n\n"
                . "Best regards,\nHillside Retreats Team";
        
        mail($to, $subject, $message);

        echo json_encode([
            'status' => 'success',
            'message' => 'Booking confirmed successfully!',
            'booking_id' => $booking_id,
            'total_amount' => $total_amount
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Error processing booking: ' . $stmt->error
        ]);
    }

    $stmt->close();
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid request method'
    ]);
}

$conn->close();
?>