// app.js
document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    const AppState = {
        theme: localStorage.getItem('theme') || 'dark',
        currentView: 'dashboard', // 'dashboard', 'builder'
        resumes: JSON.parse(localStorage.getItem('resumes')) || [],
        currentResumeId: null,
        currentTemplate: 'executive',
        currentResumeData: getEmptyResumeData()
    };

    function getEmptyResumeData() {
        return {
            personal: { fullName: '', title: '', email: '', phone: '', summary: '', linkedin: '', github: '', avatar: '', address: '' },
            experience: [],
            education: [],
            projects: [],
            skills: [],
            certs: []
        };
    }

    // --- DOM Elements Initialization ---
    const htmlThemeRoot = document.documentElement;
    const themeToggleBtn = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const navLogout = document.getElementById('navLogout');

    const views = {
        dashboard: document.getElementById('view-dashboard'),
        builder: document.getElementById('view-builder')
    };

    // Dashboard
    const resumeGrid = document.getElementById('resumeGrid');
    const btnCreateResume = document.getElementById('btnCreateResume');
    const btnBackToDash = document.getElementById('btnBackToDash');
    const dashAvatar = document.getElementById('dashAvatar');
    const dashUsername = document.getElementById('dashUsername');

    // Builder Personal
    const bAvatarInput = document.getElementById('b-avatar');
    const bAvatarUploadArea = document.getElementById('avatarUploadArea');
    const bAvatarPreview = document.getElementById('b-avatar-preview');

    // Lists
    const experienceList = document.getElementById('experienceList');
    const btnAddExperience = document.getElementById('btnAddExperience');
    const educationList = document.getElementById('educationList');
    const btnAddEducation = document.getElementById('btnAddEducation');
    const projectsList = document.getElementById('projectsList');
    const btnAddProject = document.getElementById('btnAddProject');
    const certsList = document.getElementById('certsList');
    const btnAddCert = document.getElementById('btnAddCert');

    // Action / Settings
    const templateSelector = document.getElementById('templateSelector');
    const resumePreview = document.getElementById('resumePreview');
    const btnSaveResume = document.getElementById('btnSaveResume');
    const btnDownloadPDF = document.getElementById('btnDownloadPDF');

    // --- Initialization ---
    initParticles();
    initTheme();
    switchView('dashboard');

    // --- Particle Logic ---
    function initParticles() {
        const particlesContainer = document.getElementById('particles');
        if (particlesContainer) {
            for (let i = 0; i < 30; i++) {
                const p = document.createElement('div');
                p.className = 'particle';
                const size = Math.random() * 6 + 2;
                p.style.width = size + 'px';
                p.style.height = size + 'px';
                p.style.left = Math.random() * 100 + '%';
                p.style.animationDuration = (Math.random() * 15 + 10) + 's';
                p.style.animationDelay = (Math.random() * -15) + 's';
                particlesContainer.appendChild(p);
            }
        }
    }

    // --- Theme Logic ---
    function initTheme() {
        htmlThemeRoot.setAttribute('data-theme', AppState.theme);
        updateThemeIcon();
    }
    themeToggleBtn.addEventListener('click', () => {
        AppState.theme = AppState.theme === 'dark' ? 'light' : 'dark';
        htmlThemeRoot.setAttribute('data-theme', AppState.theme);
        localStorage.setItem('theme', AppState.theme);
        updateThemeIcon();
    });
    function updateThemeIcon() {
        if (themeIcon) themeIcon.textContent = AppState.theme === 'dark' ? 'light_mode' : 'dark_mode';
    }

    // --- Utilities ---
    function switchView(viewName) {
        Object.values(views).forEach(v => v.classList.remove('active'));
        views[viewName].classList.add('active');
        AppState.currentView = viewName;
        if (viewName === 'dashboard') renderDashboard();
    }

    function showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type === 'error' ? 'toast-error' : ''}`;
        toast.innerHTML = `<span class="material-symbols-rounded icon">${type === 'error' ? 'error' : 'check_circle'}</span><span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => { toast.style.animation = 'fadeOut 0.4s ease forwards'; setTimeout(() => toast.remove(), 400); }, 3000);
    }
    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }

    // Auth logic has been moved to secure PHP backend

    // --- Dashboard Logic ---
    function renderDashboard() {
        resumeGrid.innerHTML = '';
        if (AppState.resumes.length === 0) {
            resumeGrid.innerHTML = '<p style="color: var(--text-secondary); grid-column: 1/-1;">No resumes found. Create a Premium Resume!</p>';
            return;
        }

        AppState.resumes.forEach(resume => {
            const card = document.createElement('div');
            card.className = 'resume-card';
            card.innerHTML = `
                <div class="r-card-preview"><span class="material-symbols-rounded">description</span></div>
                <div class="r-card-info">
                    <h3>${escapeHtml(resume.title)}</h3>
                    <p>Last edited: ${new Date(resume.updatedAt).toLocaleDateString()}</p>
                </div>
                <div class="r-card-actions">
                    <button class="btn btn-outline btn-small full-width" onclick="editResume('${resume.id}')">Edit</button>
                    <button class="btn btn-small" style="color: var(--danger-color); border: 1px solid var(--glass-border);" onclick="deleteResume('${resume.id}')">Delete</button>
                </div>
            `;
            resumeGrid.appendChild(card);
        });
    }

    btnCreateResume.addEventListener('click', () => {
        AppState.currentResumeId = 'res_' + Date.now();
        AppState.currentResumeData = getEmptyResumeData();
        populateBuilderForm();
        updatePreview();
        switchView('builder');
    });

    btnBackToDash.addEventListener('click', () => switchView('dashboard'));

    window.editResume = function (id) {
        const resume = AppState.resumes.find(r => r.id === id);
        if (resume) {
            AppState.currentResumeId = resume.id;
            AppState.currentResumeData = JSON.parse(JSON.stringify(resume.data));
            populateBuilderForm();
            updatePreview();
            switchView('builder');
        }
    };
    window.deleteResume = function (id) {
        if (confirm('Are you sure you want to delete this premium resume?')) {
            AppState.resumes = AppState.resumes.filter(r => r.id !== id);
            localStorage.setItem('resumes', JSON.stringify(AppState.resumes));
            renderDashboard();
            showToast('Resume deleted.');
        }
    };

    // --- Builder Accordions ---
    document.querySelectorAll('.section-title').forEach(title => {
        title.addEventListener('click', () => {
            const block = title.parentElement;
            const wasActive = block.classList.contains('active');
            document.querySelectorAll('.section-block').forEach(b => b.classList.remove('active'));
            if (!wasActive) block.classList.add('active');
        });
    });

    templateSelector.addEventListener('change', (e) => {
        AppState.currentTemplate = e.target.value;
        updatePreview();
    });

    // --- Form Rendering & State Updates ---
    function populateBuilderForm() {
        const p = AppState.currentResumeData.personal;
        ['fullname', 'title', 'email', 'phone', 'linkedin', 'github', 'address', 'summary'].forEach(id => {
            const el = document.getElementById(`b-${id}`);
            if (el) {
                // Determine object key mapping safely
                let key = id === 'fullname' ? 'fullName' : id;
                el.value = p[key] || '';
            }
        });

        // Avatar
        if (p.avatar) {
            bAvatarPreview.src = p.avatar;
            bAvatarPreview.style.display = 'block';
            bAvatarUploadArea.querySelector('.material-symbols-rounded').style.display = 'none';
        } else {
            bAvatarPreview.style.display = 'none';
            bAvatarPreview.src = '';
            bAvatarUploadArea.querySelector('.material-symbols-rounded').style.display = 'block';
        }

        renderExperienceList();
        renderEducationList();
        renderProjectsList();
        renderCertsList();
        renderSkillsPills();
    }

    // Avatar Upload Logic
    bAvatarUploadArea.addEventListener('click', () => bAvatarInput.click());
    bAvatarInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                AppState.currentResumeData.personal.avatar = event.target.result;
                populateBuilderForm();
                updatePreview();
            };
            reader.readAsDataURL(file);
        }
    });

    // Personal Data Sync
    ['fullname', 'title', 'email', 'phone', 'linkedin', 'github', 'address', 'summary'].forEach(id => {
        document.getElementById(`b-${id}`).addEventListener('input', (e) => {
            let key = id === 'fullname' ? 'fullName' : id;
            AppState.currentResumeData.personal[key] = e.target.value;
            updatePreview();
        });
    });

    // Auto-resizing textareas
    document.addEventListener('input', function (e) {
        if (e.target.tagName.toLowerCase() === 'textarea') {
            e.target.style.height = 'auto';
            e.target.style.height = (e.target.scrollHeight) + 'px';
        }
    }, false);

    // Dynamic Lists System (Using explicit renders)

    window.updateDynamicItem = function (key, index, field, value) {
        AppState.currentResumeData[key][index][field] = value;
        updatePreview();
    };
    function reRenderList(key) {
        if (key === 'experience') renderExperienceList();
        if (key === 'education') renderEducationList();
        if (key === 'projects') renderProjectsList();
        if (key === 'certs') renderCertsList();
    }
    window.removeDynamicItem = function (key, index) {
        AppState.currentResumeData[key].splice(index, 1);
        reRenderList(key);
        updatePreview();
    };
    window.moveDynamicItem = function (key, index, direction) {
        const arr = AppState.currentResumeData[key];
        if (direction === -1 && index > 0) {
            [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
        } else if (direction === 1 && index < arr.length - 1) {
            [arr[index + 1], arr[index]] = [arr[index], arr[index + 1]];
        }
        reRenderList(key);
        updatePreview();
    };

    // Experience
    let renderExperienceList;
    function renderExp() {
        experienceList.innerHTML = ''; AppState.currentResumeData.experience.forEach((e, i) => {
            const div = document.createElement('div'); div.className = 'entry-form form-grid';
            div.innerHTML = `<div class="entry-actions">
                ${i > 0 ? `<span class="material-symbols-rounded action-icon" onclick="window.moveDynamicItem('experience', ${i}, -1)">arrow_upward</span>` : ''}
                ${i < AppState.currentResumeData.experience.length - 1 ? `<span class="material-symbols-rounded action-icon" onclick="window.moveDynamicItem('experience', ${i}, 1)">arrow_downward</span>` : ''}
                <span class="material-symbols-rounded action-icon remove-entry" onclick="window.removeDynamicItem('experience', ${i})">close</span>
            </div>
            <div class="input-group"><input type="text" placeholder=" " value="${escapeHtml(e.company)}" oninput="window.updateDynamicItem('experience', ${i}, 'company', this.value)"><label>Company Name</label></div>
            <div class="input-group"><input type="text" placeholder=" " value="${escapeHtml(e.position)}" oninput="window.updateDynamicItem('experience', ${i}, 'position', this.value)"><label>Job Title</label></div>
            <div class="input-group form-col-full"><input type="text" placeholder=" " value="${escapeHtml(e.duration)}" oninput="window.updateDynamicItem('experience', ${i}, 'duration', this.value)"><label>Duration</label></div>
            <div class="input-group form-col-full"><textarea placeholder=" " oninput="window.updateDynamicItem('experience', ${i}, 'desc', this.value)">${escapeHtml(e.desc)}</textarea><label>Responsibilities (new line for bullet)</label></div>`;
            experienceList.appendChild(div);
        });
    } renderExperienceList = renderExp;
    btnAddExperience.addEventListener('click', () => { AppState.currentResumeData.experience.push({ company: '', position: '', duration: '', desc: '' }); renderExperienceList(); updatePreview(); });

    // Education
    function renderEdu() {
        educationList.innerHTML = ''; AppState.currentResumeData.education.forEach((e, i) => {
            const div = document.createElement('div'); div.className = 'entry-form form-grid';
            div.innerHTML = `<div class="entry-actions">
                ${i > 0 ? `<span class="material-symbols-rounded action-icon" onclick="window.moveDynamicItem('education', ${i}, -1)">arrow_upward</span>` : ''}
                ${i < AppState.currentResumeData.education.length - 1 ? `<span class="material-symbols-rounded action-icon" onclick="window.moveDynamicItem('education', ${i}, 1)">arrow_downward</span>` : ''}
                <span class="material-symbols-rounded action-icon remove-entry" onclick="window.removeDynamicItem('education', ${i})">close</span>
            </div>
            <div class="input-group"><input type="text" placeholder=" " value="${escapeHtml(e.degree)}" oninput="window.updateDynamicItem('education', ${i}, 'degree', this.value)"><label>Degree / Course</label></div>
            <div class="input-group"><input type="text" placeholder=" " value="${escapeHtml(e.school)}" oninput="window.updateDynamicItem('education', ${i}, 'school', this.value)"><label>Institution</label></div>
            <div class="input-group"><input type="text" placeholder=" " value="${escapeHtml(e.year)}" oninput="window.updateDynamicItem('education', ${i}, 'year', this.value)"><label>Year</label></div>
            <div class="input-group"><input type="text" placeholder=" " value="${escapeHtml(e.cgpa)}" oninput="window.updateDynamicItem('education', ${i}, 'cgpa', this.value)"><label>CGPA / Grade</label></div>`;
            educationList.appendChild(div);
        });
    } renderEducationList = renderEdu;
    btnAddEducation.addEventListener('click', () => { AppState.currentResumeData.education.push({ school: '', degree: '', year: '', cgpa: '' }); renderEducationList(); updatePreview(); });

    // Projects
    function renderProj() {
        projectsList.innerHTML = ''; AppState.currentResumeData.projects.forEach((e, i) => {
            const div = document.createElement('div'); div.className = 'entry-form form-grid';
            div.innerHTML = `<div class="entry-actions">
                ${i > 0 ? `<span class="material-symbols-rounded action-icon" onclick="window.moveDynamicItem('projects', ${i}, -1)">arrow_upward</span>` : ''}
                ${i < AppState.currentResumeData.projects.length - 1 ? `<span class="material-symbols-rounded action-icon" onclick="window.moveDynamicItem('projects', ${i}, 1)">arrow_downward</span>` : ''}
                <span class="material-symbols-rounded action-icon remove-entry" onclick="window.removeDynamicItem('projects', ${i})">close</span>
            </div>
            <div class="input-group form-col-full"><input type="text" placeholder=" " value="${escapeHtml(e.title)}" oninput="window.updateDynamicItem('projects', ${i}, 'title', this.value)"><label>Project Title</label></div>
            <div class="input-group"><input type="text" placeholder=" " value="${escapeHtml(e.tech)}" oninput="window.updateDynamicItem('projects', ${i}, 'tech', this.value)"><label>Tech Stack</label></div>
            <div class="input-group"><input type="text" placeholder=" " value="${escapeHtml(e.link)}" oninput="window.updateDynamicItem('projects', ${i}, 'link', this.value)"><label>Live/GitHub Link</label></div>
            <div class="input-group form-col-full"><textarea placeholder=" " oninput="window.updateDynamicItem('projects', ${i}, 'desc', this.value)">${escapeHtml(e.desc)}</textarea><label>Description</label></div>`;
            projectsList.appendChild(div);
        });
    } renderProjectsList = renderProj;
    btnAddProject.addEventListener('click', () => { AppState.currentResumeData.projects.push({ title: '', tech: '', link: '', desc: '' }); renderProjectsList(); updatePreview(); });

    // Certs
    function renderCerts() {
        certsList.innerHTML = ''; AppState.currentResumeData.certs.forEach((e, i) => {
            const div = document.createElement('div'); div.className = 'entry-form form-grid';
            div.innerHTML = `<div class="entry-actions">
                ${i > 0 ? `<span class="material-symbols-rounded action-icon" onclick="window.moveDynamicItem('certs', ${i}, -1)">arrow_upward</span>` : ''}
                ${i < AppState.currentResumeData.certs.length - 1 ? `<span class="material-symbols-rounded action-icon" onclick="window.moveDynamicItem('certs', ${i}, 1)">arrow_downward</span>` : ''}
                <span class="material-symbols-rounded action-icon remove-entry" onclick="window.removeDynamicItem('certs', ${i})">close</span>
            </div>
            <div class="input-group form-col-full"><input type="text" placeholder=" " value="${escapeHtml(e.name)}" oninput="window.updateDynamicItem('certs', ${i}, 'name', this.value)"><label>Certification Name</label></div>
            <div class="input-group"><input type="text" placeholder=" " value="${escapeHtml(e.issuer)}" oninput="window.updateDynamicItem('certs', ${i}, 'issuer', this.value)"><label>Issuer</label></div>
            <div class="input-group"><input type="text" placeholder=" " value="${escapeHtml(e.year)}" oninput="window.updateDynamicItem('certs', ${i}, 'year', this.value)"><label>Year</label></div>`;
            certsList.appendChild(div);
        });
    } renderCertsList = renderCerts;
    btnAddCert.addEventListener('click', () => { AppState.currentResumeData.certs.push({ name: '', issuer: '', year: '' }); renderCertsList(); updatePreview(); });

    // Skills System
    document.getElementById('b-skills-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.target.value.trim() !== '') {
            const skill = e.target.value.trim();
            if (!AppState.currentResumeData.skills.includes(skill)) {
                AppState.currentResumeData.skills.push(skill);
                e.target.value = '';
                renderSkillsPills();
                updatePreview();
            }
        }
    });
    function renderSkillsPills() {
        document.getElementById('skillsPills').innerHTML = '';
        AppState.currentResumeData.skills.forEach((skill, index) => {
            document.getElementById('skillsPills').innerHTML += `<div class="skill-pill">${skill} <span class="material-symbols-rounded" onclick="window.removeSkill(${index})">close</span></div>`;
        });
    }
    window.removeSkill = function (index) {
        AppState.currentResumeData.skills.splice(index, 1); renderSkillsPills(); updatePreview();
    };

    // --- Premium Live Preview ---
    function formatBullets(text) {
        if (!text) return '';
        const lines = text.split('\n').filter(l => l.trim().length > 0);
        if (lines.length === 1 && !text.includes('\n')) return escapeHtml(text);
        return `<ul class="r-bullets">${lines.map(l => `<li>${escapeHtml(l.trim())}</li>`).join('')}</ul>`;
    }

    function generateExecutiveTemplate(data) {
        const p = data.personal;
        return `
        <div class="template-executive">
            <div class="r-header-strip"></div>
            <div class="r-header">
                <div class="r-header-left">
                    <h1>${escapeHtml(p.fullName) || 'John Doe'}</h1>
                    <div class="r-title">${escapeHtml(p.title) || 'Senior Professional'}</div>
                    <div class="r-contact">
                        ${p.phone ? `<span><i class="material-symbols-rounded r-contact-icon">call</i> ${escapeHtml(p.phone)}</span>` : ''}
                        ${p.email ? `<span><i class="material-symbols-rounded r-contact-icon">mail</i> ${escapeHtml(p.email)}</span>` : ''}
                        ${p.address ? `<span><i class="material-symbols-rounded r-contact-icon">location_on</i> ${escapeHtml(p.address)}</span>` : ''}
                        ${p.linkedin ? `<span><i class="material-symbols-rounded r-contact-icon">link</i> LinkedIn</span>` : ''}
                        ${p.github ? `<span><i class="material-symbols-rounded r-contact-icon">code</i> GitHub</span>` : ''}
                    </div>
                </div>
                ${p.avatar ? `<img src="${p.avatar}" class="r-avatar">` : ''}
            </div>
            <div class="r-body">
            ${p.summary ? `<div class="r-sec"><h2 class="r-sec-title">Profile</h2><div class="r-desc">${escapeHtml(p.summary)}</div></div>` : ''}

            ${data.experience.length ? `<div class="r-sec"><h2 class="r-sec-title">Experience</h2>
                ${data.experience.map(exp => `
                    <div class="r-item">
                        <div class="r-item-header">
                            <span class="r-item-title">${escapeHtml(exp.position)}</span>
                            <span class="r-item-meta">${escapeHtml(exp.duration)}</span>
                        </div>
                        <div class="r-item-sub">${escapeHtml(exp.company)}</div>
                        ${formatBullets(exp.desc)}
                    </div>
                `).join('')}
            </div>` : ''}

            ${data.projects.length ? `<div class="r-sec"><h2 class="r-sec-title">Key Projects</h2>
                ${data.projects.map(proj => `
                    <div class="r-item">
                        <div class="r-item-header">
                            <span class="r-item-title">${escapeHtml(proj.title)}</span>
                            <span class="r-item-meta">${escapeHtml(proj.link)}</span>
                        </div>
                        <div class="r-item-sub">Tech: ${escapeHtml(proj.tech)}</div>
                        ${formatBullets(proj.desc)}
                    </div>
                `).join('')}
            </div>` : ''}

            ${data.education.length ? `<div class="r-sec"><h2 class="r-sec-title">Education</h2>
                ${data.education.map(edu => `
                    <div class="r-item">
                        <div class="r-item-header">
                            <span class="r-item-title">${escapeHtml(edu.degree)}</span>
                            <span class="r-item-meta">${escapeHtml(edu.year)}</span>
                        </div>
                        <div class="r-item-sub">${escapeHtml(edu.school)} ${edu.cgpa ? `| CGPA/Grade: ${escapeHtml(edu.cgpa)}` : ''}</div>
                    </div>
                `).join('')}
            </div>` : ''}

            ${data.skills.length ? `<div class="r-sec"><h2 class="r-sec-title">Technical Skills</h2>
                <div class="r-skills-grid">${data.skills.map(s => `<span class="r-skill-tag">${escapeHtml(s)}</span>`).join('')}</div>
            </div>` : ''}

            ${data.certs.length ? `<div class="r-sec"><h2 class="r-sec-title">Certifications</h2>
                ${data.certs.map(cert => `
                    <div class="r-item">
                        <span style="font-weight:600; font-size:13px; color:var(--resume-text);">${escapeHtml(cert.name)}</span> - 
                        <span style="color:#888; font-size:13px;">${escapeHtml(cert.issuer)} (${escapeHtml(cert.year)})</span>
                    </div>
                `).join('')}
            </div>` : ''}
        </div></div>`;
    }

    function generateModernTemplate(data) {
        const p = data.personal;
        return `
        <div class="template-modern">
            <div class="r-left-col">
                ${p.avatar ? `<img src="${p.avatar}" class="r-avatar">` : ''}
                <h1 class="r-name">${escapeHtml(p.fullName) || 'John Doe'}</h1>
                <div class="r-title">${escapeHtml(p.title) || 'Profession'}</div>
                
                <h2 class="r-sec-title" style="margin-top:20px;">Contact</h2>
                <div class="r-contact">
                    ${p.phone ? `<span><i class="material-symbols-rounded r-contact-icon">call</i> ${escapeHtml(p.phone)}</span>` : ''}
                    ${p.email ? `<span><i class="material-symbols-rounded r-contact-icon">mail</i> <span style="word-break:break-all;">${escapeHtml(p.email)}</span></span>` : ''}
                    ${p.address ? `<span><i class="material-symbols-rounded r-contact-icon">location_on</i> <span style="word-break:break-all;">${escapeHtml(p.address)}</span></span>` : ''}
                    ${p.linkedin ? `<span><i class="material-symbols-rounded r-contact-icon">link</i> LinkedIn</span>` : ''}
                    ${p.github ? `<span><i class="material-symbols-rounded r-contact-icon">code</i> GitHub</span>` : ''}
                </div>

                ${data.skills.length ? `
                <h2 class="r-sec-title" style="margin-top:20px;">Core Skills</h2>
                <div class="r-skills-col">
                    ${data.skills.map(skill => `
                        <div>
                            <div class="r-skill-text"><span>${escapeHtml(skill)}</span></div>
                            <div class="r-skill-bar"><div class="r-skill-fill"></div></div>
                        </div>
                    `).join('')}
                </div>` : ''}

                ${data.certs.length ? `
                <h2 class="r-sec-title" style="margin-top:20px;">Certs</h2>
                <div class="r-contact">
                    ${data.certs.map(cert => `<span>• ${escapeHtml(cert.name)} (${escapeHtml(cert.year)})</span>`).join('')}
                </div>
                ` : ''}
            </div>
            
            <div class="r-right-col">
                ${p.summary ? `<div style="margin-bottom: 32px;"><h2 class="r-sec-title">Profile</h2><p style="font-size:13px; line-height:1.6; color:#aaa;">${escapeHtml(p.summary)}</p></div>` : ''}

                ${data.experience.length ? `<div style="margin-bottom: 32px;"><h2 class="r-sec-title">Experience</h2>
                    ${data.experience.map(exp => `
                        <div class="r-item">
                            <div class="r-item-title">${escapeHtml(exp.position)} <span style="font-weight:400; color:#888;">at ${escapeHtml(exp.company)}</span></div>
                            <div class="r-item-meta">${escapeHtml(exp.duration)}</div>
                            ${formatBullets(exp.desc)}
                        </div>
                    `).join('')}
                </div>` : ''}

                ${data.projects.length ? `<div style="margin-bottom: 32px;"><h2 class="r-sec-title">Projects</h2>
                    ${data.projects.map(proj => `
                        <div class="r-item">
                            <div class="r-item-title">${escapeHtml(proj.title)}</div>
                            <div class="r-item-meta">Tech: ${escapeHtml(proj.tech)} | ${escapeHtml(proj.link)}</div>
                            ${formatBullets(proj.desc)}
                        </div>
                    `).join('')}
                </div>` : ''}

                ${data.education.length ? `<div><h2 class="r-sec-title">Education</h2>
                    ${data.education.map(edu => `
                        <div class="r-item" style="margin-bottom: 16px;">
                            <div class="r-item-title">${escapeHtml(edu.degree)}</div>
                            <div class="r-item-meta">${escapeHtml(edu.school)} | ${escapeHtml(edu.year)}</div>
                            ${edu.cgpa ? `<div style="font-size:12px; color:#aaa;">CGPA: ${escapeHtml(edu.cgpa)}</div>` : ''}
                        </div>
                    `).join('')}
                </div>` : ''}
            </div>
        </div>`;
    }

    function updatePreview() {
        if (AppState.currentTemplate === 'executive') {
            resumePreview.innerHTML = generateExecutiveTemplate(AppState.currentResumeData);
            document.documentElement.style.setProperty('--resume-bg', '#121212');
            document.documentElement.style.setProperty('--resume-text', '#e0e0e0');
        } else {
            resumePreview.innerHTML = generateModernTemplate(AppState.currentResumeData);
            // Black bg for modern right container is hardcoded in template style
        }
    }

    // --- Action Handlers ---
    btnSaveResume.addEventListener('click', () => {
        const titleRaw = AppState.currentResumeData.personal.fullName;
        const title = titleRaw ? `${titleRaw}'s Premium Resume` : 'Untitled Resume';

        const existingIndex = AppState.resumes.findIndex(r => r.id === AppState.currentResumeId);
        const resumeObj = {
            id: AppState.currentResumeId,
            title: title,
            updatedAt: Date.now(),
            data: AppState.currentResumeData
        };

        if (existingIndex >= 0) AppState.resumes[existingIndex] = resumeObj;
        else AppState.resumes.push(resumeObj);

        localStorage.setItem('resumes', JSON.stringify(AppState.resumes));
        showToast('Resume saved securely!', 'success');
    });

    // ✅ declare ONLY once in whole file
    async function generatePDF() {
    const element = document.getElementById('resumePreview');
    if (!element) return;

    const p = AppState.currentResumeData?.personal || {};
    const safeName = (p.fullName || "User").replace(/[^a-zA-Z0-9]/g, "_");

    const opt = {
        margin: 0,
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: '#0b0b0b'
        },
        jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait'
        }
    };

    try {
        const worker = html2pdf().set(opt).from(element);
        const pdfBlob = await worker.outputPdf('blob');

        // 🔥 CRITICAL FIX: convert blob → real File
        const file = new File([pdfBlob], `Resume_${safeName}.pdf`, {
            type: 'application/pdf'
        });

        const url = URL.createObjectURL(file);

        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;

        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);

    } catch (err) {
        console.error(err);
    }
}


if (btnDownloadPDF) {
    btnDownloadPDF.addEventListener('click', generatePDF);
}
});