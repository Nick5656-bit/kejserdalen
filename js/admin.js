/* ============================================
   FAM Kejserdalen – Admin Panel
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ---- CONFIG ----
    // Simple credentials for hobby use (NOT production-safe)
    const ADMIN_USER = 'admin';
    const ADMIN_PASS = 'fam2026';

    // ---- DOM ELEMENTS ----
    const adminToggle = document.getElementById('adminToggle');
    const loginModal = document.getElementById('loginModal');
    const loginBackdrop = document.getElementById('loginBackdrop');
    const loginClose = document.getElementById('loginClose');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const adminPanel = document.getElementById('adminPanel');
    const adminLogout = document.getElementById('adminLogout');
    const newsForm = document.getElementById('newsForm');
    const newsEditId = document.getElementById('newsEditId');
    const newsTitle = document.getElementById('newsTitle');
    const newsContent = document.getElementById('newsContent');
    const newsImage = document.getElementById('newsImage');
    const newsSubmitBtn = document.getElementById('newsSubmitBtn');
    const newsCancelEdit = document.getElementById('newsCancelEdit');
    const adminNewsList = document.getElementById('adminNewsList');

    let isLoggedIn = sessionStorage.getItem('fam_admin') === 'true';

    // ---- INIT ----
    if (isLoggedIn) {
        showAdminPanel();
    }

    // ---- ADMIN TOGGLE BUTTON ----
    adminToggle.addEventListener('click', () => {
        if (isLoggedIn) {
            // If already logged in, toggle admin panel visibility
            adminPanel.style.display = adminPanel.style.display === 'none' ? 'block' : 'none';
        } else {
            // Show login modal
            loginModal.classList.add('active');
            loginError.textContent = '';
            document.getElementById('adminUser').focus();
        }
    });

    // ---- CLOSE LOGIN MODAL ----
    loginClose.addEventListener('click', closeLoginModal);
    loginBackdrop.addEventListener('click', closeLoginModal);

    function closeLoginModal() {
        loginModal.classList.remove('active');
        loginForm.reset();
        loginError.textContent = '';
    }

    // ---- LOGIN FORM SUBMIT ----
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const user = document.getElementById('adminUser').value.trim();
        const pass = document.getElementById('adminPass').value;

        if (user === ADMIN_USER && pass === ADMIN_PASS) {
            isLoggedIn = true;
            sessionStorage.setItem('fam_admin', 'true');
            closeLoginModal();
            showAdminPanel();
        } else {
            loginError.textContent = 'Forkert brugernavn eller adgangskode.';
            document.getElementById('adminPass').value = '';
            document.getElementById('adminPass').focus();
        }
    });

    // ---- LOGOUT ----
    if (adminLogout) {
        adminLogout.addEventListener('click', () => {
            isLoggedIn = false;
            sessionStorage.removeItem('fam_admin');
            location.reload(); // Reload the page to clear states securely
        });
    }

    // ---- SHOW ADMIN PANEL ----
    function showAdminPanel() {
        // Subpage check: index.html has adminPanel, but subpages don't
        if (!adminPanel) return;
        
        adminPanel.style.display = 'flex';
        adminToggle.classList.add('logged-in');
        renderAdminNewsList();
        
        if (typeof initAdminPdfs === 'function') {
            initAdminPdfs();
        }
    }

    // ---- NEWS FORM SUBMIT ----
    newsForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const news = JSON.parse(localStorage.getItem('fam_news') || '[]');
        const editId = newsEditId.value;

        if (editId) {
            // Editing existing news
            const index = news.findIndex(n => n.id === editId);
            if (index !== -1) {
                news[index].title = newsTitle.value.trim();
                news[index].content = newsContent.value.trim();
                news[index].image = newsImage.value.trim();
            }
            newsEditId.value = '';
            newsSubmitBtn.textContent = 'Tilføj nyhed';
            newsCancelEdit.style.display = 'none';
        } else {
            // Adding new news
            const newItem = {
                id: Date.now().toString(),
                title: newsTitle.value.trim(),
                date: new Date().toISOString().split('T')[0],
                content: newsContent.value.trim(),
                image: newsImage.value.trim()
            };
            news.unshift(newItem);
        }

        localStorage.setItem('fam_news', JSON.stringify(news));
        newsForm.reset();
        renderAdminNewsList();

        // Re-render the public news section
        if (typeof window.renderNews === 'function') {
            window.renderNews();
        }
    });

    // ---- CANCEL EDIT ----
    newsCancelEdit.addEventListener('click', () => {
        newsForm.reset();
        newsEditId.value = '';
        newsSubmitBtn.textContent = 'Tilføj nyhed';
        newsCancelEdit.style.display = 'none';
    });

    // ---- RENDER ADMIN NEWS LIST ----
    function renderAdminNewsList() {
        const news = JSON.parse(localStorage.getItem('fam_news') || '[]');
        news.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (news.length === 0) {
            adminNewsList.innerHTML = '<p style="color: var(--color-text-muted); padding: 1rem;">Ingen nyheder endnu. Tilføj den første!</p>';
            return;
        }

        adminNewsList.innerHTML = news.map(item => `
            <div class="admin-news-item">
                <div>
                    <div class="admin-news-item__title">${escapeHtml(item.title)}</div>
                    <div class="admin-news-item__date">${item.date}</div>
                </div>
                <div class="admin-news-item__actions">
                    <button class="admin-news-item__edit" data-id="${item.id}">Rediger</button>
                    <button class="admin-news-item__delete" data-id="${item.id}">Slet</button>
                </div>
            </div>
        `).join('');
    }

    // ---- EVENT DELEGATION FOR EDIT & DELETE NEWS ----
    if (adminNewsList) {
        adminNewsList.addEventListener('click', (e) => {
            if (e.target.classList.contains('admin-news-item__edit')) {
                const id = e.target.getAttribute('data-id');
                const news = JSON.parse(localStorage.getItem('fam_news') || '[]');
                const item = news.find(n => n.id === id);
                if (!item) return;

                newsEditId.value = item.id;
                newsTitle.value = item.title;
                newsContent.value = item.content;
                newsImage.value = item.image || '';
                newsSubmitBtn.textContent = 'Gem ændringer';
                newsCancelEdit.style.display = 'inline-flex';
                newsTitle.focus();
            } else if (e.target.classList.contains('admin-news-item__delete')) {
                const id = e.target.getAttribute('data-id');
                if (!confirm('Er du sikker på du vil slette denne nyhed?')) return;

                let news = JSON.parse(localStorage.getItem('fam_news') || '[]');
                news = news.filter(n => n.id !== id);
                localStorage.setItem('fam_news', JSON.stringify(news));

                renderAdminNewsList();

                if (typeof window.renderNews === 'function') {
                    window.renderNews();
                }
            }
        });
    }

    // ---- HELPER: Escape HTML ----
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    // =====================================
    // PDF URLs CRUD
    // =====================================
    const pdfUrlKalender = document.getElementById('pdfUrlKalender');
    const pdfUrlVedtaegterFhmck = document.getElementById('pdfUrlVedtaegterFhmck');
    const pdfUrlVedtaegterFam = document.getElementById('pdfUrlVedtaegterFam');
    const pdfUrlReferatFhmck = document.getElementById('pdfUrlReferatFhmck');
    const pdfUrlReferatFam = document.getElementById('pdfUrlReferatFam');
    const pdfUrlNyhedsbrev = document.getElementById('pdfUrlNyhedsbrev');
    
    const btnSavePdfs = document.getElementById('btnSavePdfs');
    const pdfSaveStatus = document.getElementById('pdfSaveStatus');

    function initAdminPdfs() {
        if (!pdfUrlKalender) return; // Guard clause in case elements aren't loaded

        pdfUrlKalender.value = localStorage.getItem('fam_pdf_kalender') || '';
        pdfUrlVedtaegterFhmck.value = localStorage.getItem('fam_pdf_vedtaegter_fhmck') || '';
        pdfUrlVedtaegterFam.value = localStorage.getItem('fam_pdf_vedtaegter_fam') || '';
        pdfUrlReferatFhmck.value = localStorage.getItem('fam_pdf_referat_fhmck') || '';
        pdfUrlReferatFam.value = localStorage.getItem('fam_pdf_referat_fam') || '';
        pdfUrlNyhedsbrev.value = localStorage.getItem('fam_pdf_nyhedsbrev') || '';

        btnSavePdfs.addEventListener('click', () => {
            // Save to localStorage
            savePdfUrl('fam_pdf_kalender', pdfUrlKalender.value);
            savePdfUrl('fam_pdf_vedtaegter_fhmck', pdfUrlVedtaegterFhmck.value);
            savePdfUrl('fam_pdf_vedtaegter_fam', pdfUrlVedtaegterFam.value);
            savePdfUrl('fam_pdf_referat_fhmck', pdfUrlReferatFhmck.value);
            savePdfUrl('fam_pdf_referat_fam', pdfUrlReferatFam.value);
            savePdfUrl('fam_pdf_nyhedsbrev', pdfUrlNyhedsbrev.value);

            // Show status
            pdfSaveStatus.style.display = 'inline';
            setTimeout(() => {
                pdfSaveStatus.style.display = 'none';
            }, 3000);
        });
    }

    function savePdfUrl(key, value) {
        const val = value.trim();
        if (val === '') {
            localStorage.removeItem(key);
        } else {
            localStorage.setItem(key, val);
        }
    }

});
