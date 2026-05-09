<?php
require_once 'db.php';

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';
    $mobile = trim($_POST['mobile'] ?? '');

    if (empty($username) || empty($email) || empty($password) || empty($confirm_password) || empty($mobile)) {
        $error = "All fields are required.";
    } elseif ($password !== $confirm_password) {
        $error = "Passwords do not match.";
    } else {
        // Check duplicates
        $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? OR email = ? OR mobile = ?");
        $stmt->execute([$username, $email, $mobile]);
        if ($stmt->rowCount() > 0) {
            $error = "Username, email, or mobile already exists.";
        } else {
            // Generate OTP
            $otp = rand(100000, 999999);
            $expiry = date('Y-m-d H:i:s', strtotime('+5 minutes'));

            // Store OTP
            $stmt = $pdo->prepare("INSERT INTO otp (mobile, otp, expiry_time) VALUES (?, ?, ?)");
            if ($stmt->execute([$mobile, $otp, $expiry])) {
                // Store temp user data in session
                $_SESSION['pending_user'] = [
                    'username' => $username,
                    'email' => $email,
                    'password' => password_hash($password, PASSWORD_DEFAULT),
                    'mobile' => $mobile
                ];
                
                send_otp($mobile, $otp);
                
                header("Location: verify_otp.php?context=signup");
                exit();
            } else {
                $error = "Failed to generate OTP.";
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Sign Up</title>
    <link rel="stylesheet" href="auth.css">
</head>
<body>
    <div class="auth-container">
        <h2>Sign Up</h2>
        <?php if ($error): ?>
            <div class="error"><?= htmlspecialchars($error) ?></div>
        <?php endif; ?>
        <form method="POST" action="signup.php">
            <div class="form-group">
                <label>Username</label>
                <input type="text" name="username" required>
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" name="email" required>
            </div>
            <div class="form-group">
                <label>Mobile Number</label>
                <input type="text" name="mobile" required pattern="[0-9]{10,15}" title="Enter a valid mobile number">
            </div>
            <div class="form-group">
                <label>Password</label>
                <input type="password" name="password" required>
            </div>
            <div class="form-group">
                <label>Confirm Password</label>
                <input type="password" name="confirm_password" required>
            </div>
            <button type="submit" class="btn">Sign Up</button>
        </form>
        <div class="auth-links">
            <p>Already have an account? <a href="login.php">Log in</a></p>
        </div>
    </div>
</body>
</html>
