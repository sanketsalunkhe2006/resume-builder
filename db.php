<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$host = 'localhost';
$dbname = 'test'; // Changed to 'test' based on phpMyAdmin
$user = 'root'; // Change to existing user
$pass = ''; // Change to existing password

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Database connection failed. Please ensure the database and tables exist.");
}

/*
// Database Schema to run in MySQL:
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    mobile VARCHAR(15) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS otp (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mobile VARCHAR(15) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expiry_time DATETIME NOT NULL
);
*/

// Helper to simulate sending OTP
function send_otp($mobile, $otp) {
    // In production, integrate with Twilio, AWS SNS, Msg91, etc.
    // For now, we simulate it by writing to session for UI display.
    $_SESSION['mock_otp'] = $otp; 
    return true;
}
?>
