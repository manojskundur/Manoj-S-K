<?php
require_once 'db_config.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Sanitize input data
    $name = $conn->real_escape_string($_POST['name']);
    $age = (int)$_POST['age'];
    $bike_name = $conn->real_escape_string($_POST['bikeName']);
    $rental_date = $conn->real_escape_string($_POST['date']);
    $days = (int)$_POST['days'];

    // Verify age requirement
    if ($age < 18) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Must be at least 18 years old to rent a vehicle'
        ]);
        exit;
    }

    // Get vehicle price from database
    $sql = "SELECT price_per_day FROM vehicle_types WHERE vehicle_name = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $bike_name);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($row = $result->fetch_assoc()) {
        $price_per_day = $row['price_per_day'];
        $total_amount = $price_per_day * $days;

        // Insert booking into database
        $sql = "INSERT INTO vehicle_bookings (name, age, bike_name, rental_date, 
                num_days, total_amount) 
                VALUES (?, ?, ?, ?, ?, ?)";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sissis", $name, $age, $bike_name, $rental_date, 
                          $days, $total_amount);

        if ($stmt->execute()) {
            $booking_id = $stmt->insert_id;

            // Update vehicle availability
            $sql = "UPDATE vehicle_types SET is_available = FALSE 
                   WHERE vehicle_name = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("s", $bike_name);
            $stmt->execute();

            echo json_encode([
                'status' => 'success',
                'message' => 'Vehicle rental confirmed successfully!',
                'booking_id' => $booking_id,
                'total_amount' => $total_amount
            ]);
        } else {
            echo json_encode([
                'status' => 'error',
                'message' => 'Error processing rental: ' . $stmt->error
            ]);
        }
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Vehicle not found in database'
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