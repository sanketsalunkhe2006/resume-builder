<?php
session_start();
require_once 'db.php';
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}

$stmt = $pdo->prepare("SELECT username FROM users WHERE id = ?");
$stmt->execute([$_SESSION['user_id']]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);
$current_username = $user ? $user['username'] : 'User';
?>
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NexResume | Premium Gold</title>
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Outfit:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Icons -->
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,1,0" />

    <!-- html2pdf for Premium Export -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>

    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <!-- Animated Interactive Background -->
    <div class="bg-mesh">
        <div class="blob blob-1"></div>
        <div class="blob blob-2"></div>
        <div class="blob blob-3"></div>
        <!-- Floating Particles -->
        <div class="particles" id="particles"></div>
        <div class="overlay-noise"></div>
    </div>

    <!-- Loading Overlay -->
    <div id="loadingOverlay">
        <div class="spinner"></div>
        <p>Generating Premium PDF...</p>
    </div>

    <!-- View 2: Dashboard -->
    <section id="view-dashboard" class="view active" style="padding: 0;">
        <div class="dashboard-layout">
            <!-- Sidebar -->
            <aside class="sidebar">
                <div class="sidebar-profile">
                    <div class="avatar" id="dashAvatar"><?= htmlspecialchars(strtoupper(substr($current_username, 0, 1))) ?></div>
                    <div class="profile-info">
                        <h3 id="dashUsername"><?= htmlspecialchars($current_username) ?></h3>
                        <p>Premium Member</p>
                    </div>
                </div>
                <nav class="sidebar-nav">
                    <div class="nav-item active"><span class="material-symbols-rounded">description</span> My Resumes</div>
                    <div class="nav-item"><span class="material-symbols-rounded">settings</span> Settings</div>
                    <div class="nav-item" id="themeToggle"><span class="material-symbols-rounded" id="themeIcon">light_mode</span> Theme</div>
                </nav>
                <div style="margin-top: auto;">
                    <a href="logout.php" style="text-decoration:none;"><button class="nav-item full-width" id="navLogout" style="color: var(--danger-color);"><span class="material-symbols-rounded">logout</span> Logout</button></a>
                </div>
            </aside>

            <!-- Main Content -->
            <main class="dashboard-content">
                <header class="view-header">
                    <div>
                        <h2>Your Portfolio</h2>
                        <p>Manage and create stunning premium resumes.</p>
                    </div>
                    <button id="btnCreateResume" class="btn btn-primary">
                        <span class="material-symbols-rounded">add</span> Create New Resume
                    </button>
                </header>
                
                <div class="dashboard-grid" id="resumeGrid">
                    <!-- Resume Cards inserted here by JS -->
                </div>
            </main>
        </div>
    </section>

    <!-- View 3: Builder -->
    <section id="view-builder" class="view builder-layout" style="padding-top: 24px;">
        <header class="builder-header">
            <button id="btnBackToDash" class="btn-icon-text">
                <span class="material-symbols-rounded">arrow_back</span> Back to Dashboard
            </button>
            <div style="display:flex; gap:16px;">
                <button id="btnSaveResume" class="btn btn-outline"><span class="material-symbols-rounded">save</span> Save Draft</button>
                <button id="btnDownloadPDF" class="btn btn-primary"><span class="material-symbols-rounded">picture_as_pdf</span> Export Premium PDF</button>
            </div>
        </header>
        
        <div class="builder-split">
            <!-- Form Area left -->
            <aside class="builder-controls glass-panel scrollable">
                <header class="panel-header">
                    <h3>Content Builder</h3>
                    <span class="material-symbols-rounded" style="color: var(--primary-color);">edit_document</span>
                </header>
                
                <div class="form-sections">
                    <!-- Personal Info -->
                    <div class="section-block active" data-section="personal">
                        <h4 class="section-title"><span><span class="material-symbols-rounded">person</span> Personal Details</span></h4>
                        <div class="section-content">
                            <label style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px; display:block;">Profile Photo</label>
                            <div class="image-upload-area" id="avatarUploadArea">
                                <span class="material-symbols-rounded" style="font-size:32px; color: var(--primary-color);">cloud_upload</span>
                                <p style="font-size:12px; color:var(--text-secondary); margin-top:8px;">Click to upload image</p>
                                <input type="file" id="b-avatar" accept="image/*" style="display:none;">
                                <img id="b-avatar-preview" src="" alt="Profile Preview">
                            </div>
                            <div class="form-grid" style="margin-top: 16px;">
                                <div class="input-group">
                                    <input type="text" id="b-fullname" required placeholder=" ">
                                    <label>First & Last Name</label>
                                </div>
                                <div class="input-group">
                                    <input type="text" id="b-title" required placeholder=" ">
                                    <label>Professional Role</label>
                                </div>
                                <div class="input-group">
                                    <input type="email" id="b-email" required placeholder=" ">
                                    <label>Email Address</label>
                                </div>
                                <div class="input-group">
                                    <input type="text" id="b-phone" required placeholder=" ">
                                    <label>Phone Number</label>
                                </div>
                                <div class="input-group">
                                    <input type="text" id="b-linkedin" required placeholder=" ">
                                    <label>LinkedIn URL</label>
                                </div>
                                <div class="input-group">
                                    <input type="text" id="b-github" required placeholder=" ">
                                    <label>GitHub/Portfolio URL</label>
                                </div>
                                <div class="input-group form-col-full">
                                    <input type="text" id="b-address" required placeholder=" ">
                                    <label>Address</label>
                                </div>
                                <div class="input-group form-col-full">
                                    <textarea id="b-summary" required rows="4" placeholder=" "></textarea>
                                    <label>Professional Summary</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Experience -->
                    <div class="section-block" data-section="experience">
                        <h4 class="section-title"><span><span class="material-symbols-rounded">work</span> Experience</span></h4>
                        <div class="section-content">
                            <div id="experienceList"></div>
                            <button id="btnAddExperience" class="btn btn-outline btn-small full-width"><span class="material-symbols-rounded">add</span> Add Experience</button>
                        </div>
                    </div>

                    <!-- Education -->
                    <div class="section-block" data-section="education">
                        <h4 class="section-title"><span><span class="material-symbols-rounded">school</span> Education</span></h4>
                        <div class="section-content">
                            <div id="educationList"></div>
                            <button id="btnAddEducation" class="btn btn-outline btn-small full-width"><span class="material-symbols-rounded">add</span> Add Education</button>
                        </div>
                    </div>

                    <!-- Projects -->
                    <div class="section-block" data-section="projects">
                        <h4 class="section-title"><span><span class="material-symbols-rounded">rocket_launch</span> Projects</span></h4>
                        <div class="section-content">
                            <div id="projectsList"></div>
                            <button id="btnAddProject" class="btn btn-outline btn-small full-width"><span class="material-symbols-rounded">add</span> Add Project</button>
                        </div>
                    </div>

                    <!-- Skills -->
                    <div class="section-block" data-section="skills">
                        <h4 class="section-title"><span><span class="material-symbols-rounded">psychology</span> Skills</span></h4>
                        <div class="section-content">
                            <div class="input-group full-width">
                                <input type="text" id="b-skills-input" placeholder="Type a technical/soft skill & press Enter">
                            </div>
                            <div id="skillsPills" class="skills-container"></div>
                        </div>
                    </div>

                    <!-- Certifications -->
                    <div class="section-block" data-section="certs">
                        <h4 class="section-title"><span><span class="material-symbols-rounded">military_tech</span> Certifications</span></h4>
                        <div class="section-content">
                            <div id="certsList"></div>
                            <button id="btnAddCert" class="btn btn-outline btn-small full-width"><span class="material-symbols-rounded">add</span> Add Certification</button>
                        </div>
                    </div>

                </div>
            </aside>

            <!-- Live Preview right -->
            <section class="builder-preview scrollable" id="previewAreaScroll">
                <div class="preview-actions">
                    <span style="font-size: 14px; color: var(--text-secondary);">Live Preview</span>
                    <select id="templateSelector" class="template-selector">
                        <option value="executive">Template: Minimal Executive</option>
                        <option value="modern">Template: Creative Modern</option>
                    </select>
                </div>
                
                <div class="resume-wrapper">
                    <div class="resume-paper" id="resumePreview">
                        <!-- Dynamic Premium Content injected here -->
                    </div>
                </div>
            </section>
        </div>
    </section>

    <!-- Toast Notifications -->
    <div id="toastContainer" class="toast-container"></div>

    <script src="app.js"></script>
</body>
</html>
