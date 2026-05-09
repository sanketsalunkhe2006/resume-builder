<?php
require_once 'db.php';

$error = '';
$success = '';
$context = $_GET['context'] ?? '';

if ($context !== 'signup' && $context !== 'login') {
    die("Invalid request.");
}

// Check if we have the pending data
if ($context === 'signup' && !isset($_SESSION['pending_user'])) {
    header("Location: signup.php");
    exit();
}
if ($context === 'login' && !isset($_SESSION['pending_login_mobile'])) {
    header("Location: login.php");
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $entered_otp = trim($_POST['otp'] ?? '');
    $mobile = $context === 'signup' ? $_SESSION['pending_user']['mobile'] : $_SESSION['pending_login_mobile'];

    if (empty($entered_otp)) {
        $error = "Please enter OTP.";
    } else {
        // Verify OTP against db
        // Get the latest OTP for this mobile
        $stmt = $pdo->prepare("SELECT * FROM otp WHERE mobile = ? ORDER BY id DESC LIMIT 1");
        $stmt->execute([$mobile]);
        $otp_record = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($otp_record) {
            $current_time = date('Y-m-d H:i:s');
            if ($otp_record['expiry_time'] < $current_time) {
                $error = "OTP has expired. Please try again.";
            } elseif ($otp_record['otp'] !== $entered_otp) {
                $error = "Invalid OTP.";
            } else {
                // OTP is valid
                if ($context === 'signup') {
                    $user = $_SESSION['pending_user'];
                    $stmt = $pdo->prepare("INSERT INTO users (username, email, password, mobile) VALUES (?, ?, ?, ?)");
                    if ($stmt->execute([$user['username'], $user['email'], $user['password'], $user['mobile']])) {
                        unset($_SESSION['pending_user']);
                        header("Location: login.php?signup=success");
                        exit();
                    } else {
                        $error = "Failed to create account. User may already exist.";
                    }
                } elseif ($context === 'login') {
                    $stmt = $pdo->prepare("SELECT id FROM users WHERE mobile = ?");
                    $stmt->execute([$mobile]);
                    $user = $stmt->fetch(PDO::FETCH_ASSOC);

                    if ($user) {
                        session_regenerate_id(true);
                        $_SESSION['user_id'] = $user['id'];
                        unset($_SESSION['pending_login_mobile']);
                        header("Location: index.php");
                        exit();
                    } else {
                        $error = "User not found.";
                    }
                }
            }
        } else {
            $error = "No OTP requested.";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Verify OTP</title>
    <link rel="stylesheet" href="auth.css">
</head>
<body>
    <div class="auth-container">
        <h2>Verify OTP</h2>
        <?php if ($error): ?>
            <div class="error"><?= htmlspecialchars($error) ?></div>
        <?php endif; ?>
        <?php if (isset($_SESSION['mock_otp'])): ?>
            <div class="success">OTP Sent! (Mock: <?= htmlspecialchars($_SESSION['mock_otp']) ?>)</div>
            <?php unset($_SESSION['mock_otp']); ?>
        <?php else: ?>
            <div class="success">OTP sent successfully.</div>
        <?php endif; ?>
        
        <form method="POST" action="verify_otp.php?context=<?= htmlspecialchars($context) ?>">
            <div class="form-group">
                <label>Enter 6-digit OTP</label>
                <input type="text" name="otp" required pattern="[0-9]{6}" title="Enter 6 digit OTP">
            </div>
            <button type="submit" class="btn">Verify</button>
        </form>
    </div>
</body>
</html>
