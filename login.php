<?php
require_once 'db.php';

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $login_method = $_POST['login_method'] ?? '';

    if ($login_method === 'password') {
        $username = trim($_POST['username'] ?? '');
        $password = $_POST['password'] ?? '';

        if (empty($username) || empty($password)) {
            $error = "Username and password required.";
        } else {
            $stmt = $pdo->prepare("SELECT id, password FROM users WHERE username = ?");
            $stmt->execute([$username]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user && password_verify($password, $user['password'])) {
                session_regenerate_id(true);
                $_SESSION['user_id'] = $user['id'];
                header("Location: index.php");
                exit();
            } else {
                $error = "Invalid username or password.";
            }
        }
    } elseif ($login_method === 'otp') {
        $mobile = trim($_POST['mobile'] ?? '');

        if (empty($mobile)) {
            $error = "Mobile number required.";
        } else {
            $stmt = $pdo->prepare("SELECT id FROM users WHERE mobile = ?");
            $stmt->execute([$mobile]);
            if ($stmt->rowCount() === 0) {
                $error = "User not found. Please sign up first.";
            } else {
                $otp = rand(100000, 999999);
                $expiry = date('Y-m-d H:i:s', strtotime('+5 minutes'));

                $stmt = $pdo->prepare("INSERT INTO otp (mobile, otp, expiry_time) VALUES (?, ?, ?)");
                if ($stmt->execute([$mobile, $otp, $expiry])) {
                    $_SESSION['pending_login_mobile'] = $mobile;
                    send_otp($mobile, $otp);
                    
                    header("Location: verify_otp.php?context=login");
                    exit();
                } else {
                    $error = "Failed to generate OTP.";
                }
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Login</title>
    <link rel="stylesheet" href="auth.css">
    <script>
        function switchTab(tab) {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            if (tab === 'password') {
                document.getElementById('tab-password').classList.add('active');
                document.getElementById('content-password').classList.add('active');
            } else {
                document.getElementById('tab-otp').classList.add('active');
                document.getElementById('content-otp').classList.add('active');
            }
        }
    </script>
</head>
<body>
    <div class="auth-container">
        <h2>Login</h2>
        <?php if ($error): ?>
            <div class="error"><?= htmlspecialchars($error) ?></div>
        <?php endif; ?>
        <?php if (isset($_GET['signup']) && $_GET['signup'] === 'success'): ?>
            <div class="success">Signup successful. Please login.</div>
        <?php endif; ?>

        <div class="tabs">
            <div id="tab-password" class="tab active" onclick="switchTab('password')">Password</div>
            <div id="tab-otp" class="tab" onclick="switchTab('otp')">OTP</div>
        </div>

        <div id="content-password" class="tab-content active">
            <form method="POST" action="login.php">
                <input type="hidden" name="login_method" value="password">
                <div class="form-group">
                    <label>Username</label>
                    <input type="text" name="username" required>
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" name="password" required>
                </div>
                <button type="submit" class="btn">Login</button>
            </form>
        </div>

        <div id="content-otp" class="tab-content">
            <form method="POST" action="login.php">
                <input type="hidden" name="login_method" value="otp">
                <div class="form-group">
                    <label>Mobile Number</label>
                    <input type="text" name="mobile" required pattern="[0-9]{10,15}" title="Enter a valid mobile number">
                </div>
                <button type="submit" class="btn">Send OTP</button>
            </form>
        </div>

        <div class="auth-links">
            <p>Don't have an account? <a href="signup.php">Sign up</a></p>
        </div>
    </div>
</body>
</html>
