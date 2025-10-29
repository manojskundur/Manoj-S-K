<?php
require_once 'db_config.php';

if ($_SERVER["REQUEST_METHOD"] == "GET") {
    $type = $_GET['type']; // 'room' or 'vehicle'
    $date = $_GET['date'];
    
    if ($type === 'room') {
        $room_type = $_GET['room_type'];
        
        // Check room availability for given dates
        $sql = "SELECT COUNT(*) as bookings FROM homestay_bookings 
                WHERE room_type = ? 
                AND (
                    (check_in_date <= ? AND check_out_date >= ?) 
                    OR 
                    (check_in_date >= ? AND check_in_date <= ?)
                )
                AND status != 'cancelled'";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sssss", $room_type, $date, $date, $_GET['check_in'], $_GET['check_out']);
        
    } else if ($type === 'vehicle') {
        $vehicle = $_GET['vehicle'];
        
        // Check vehicle availability
        $sql = "SELECT COUNT(*) as bookings FROM vehicle_bookings 
                WHERE bike_name = ? 
                AND rental_date = ?
                AND status != 'cancelled'";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ss", $vehicle, $date);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    
    echo json_encode([
        'available' => ($row['bookings'] == 0),
        'bookings' => $row['bookings']
    ]);
    
    $stmt->close();
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid request method'
    ]);
}

$conn->close();
?>