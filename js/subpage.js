/* ============================================
   FAM Kejserdalen – Subpage JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    
    // ---- MOBILE MENU TOGGLE ----
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when a link is clicked
        const navLinks = document.querySelectorAll('.navbar__link:not(.dropdown__toggle)');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // ---- DROPDOWN TOGGLE (Mobile) ----
    const dropdownToggles = document.querySelectorAll('.dropdown__toggle');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                const menu = toggle.nextElementSibling;
                if (menu) {
                    menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
                }
            }
        });
    });

    // ---- SET ACTIVE NAV LINK ----
    const currentPath = window.location.pathname;
    const allLinks = document.querySelectorAll('.navbar__link, .dropdown__link');
    
    allLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        
        // Very simple active state matching
        if (href && currentPath.includes(href.replace('../', '').replace('./', ''))) {
            link.classList.add('active');
            
            // If it's a dropdown link, also highlight the parent
            if (link.classList.contains('dropdown__link')) {
                const parentDropdown = link.closest('.navbar__dropdown');
                if (parentDropdown) {
                    const toggle = parentDropdown.querySelector('.dropdown__toggle');
                    if (toggle) toggle.classList.add('active');
                }
            }
        }
    });

    // ---- LOAD PDF URLS (Admin override support) ----
    // We check if admin has set custom URLs for PDFs in localStorage
    // If not, we fall back to the defaults uploaded to assets/pdf/
    
    function loadPdf(elementId, localStorageKey, defaultPath) {
        const iframe = document.getElementById(elementId);
        if (iframe) {
            const savedUrl = localStorage.getItem(localStorageKey);
            iframe.src = savedUrl || defaultPath;
        }
    }

    // Load Kalender
    loadPdf('pdfKalender', 'fam_pdf_kalender', '../assets/pdf/kalender.pdf');
    
    // Load Vedtægter
    loadPdf('pdfVedtaegterFam', 'fam_pdf_vedtaegter_fam', '../assets/pdf/vedtaegter-fam.pdf');
    loadPdf('pdfVedtaegterFhmck', 'fam_pdf_vedtaegter_fhmck', '../assets/pdf/vedtaegter-fhmck.pdf');
    
    // Load Referater (Assuming nyhedsbrev is also handled here)
    loadPdf('pdfReferatFam', 'fam_pdf_referat_fam', '../assets/pdf/generalforsamling-fam.pdf');
    loadPdf('pdfReferatFhmck', 'fam_pdf_referat_fhmck', '../assets/pdf/generalforsamling-fhmck.pdf');
    loadPdf('pdfNyhedsbrev', 'fam_pdf_nyhedsbrev', '../assets/pdf/nyhedsbrev-februar.pdf');

});
