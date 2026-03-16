/* ============================================
   FAM Kejserdalen – Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ---- THEME TOGGLE ----
    const THEME_KEY = 'fam_theme';
    const themeToggle = document.getElementById('themeToggle');

    const applyTheme = (theme) => {
        const resolvedTheme = theme === 'light' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', resolvedTheme);

        if (themeToggle) {
            const nextTheme = resolvedTheme === 'light' ? 'dark' : 'light';
            themeToggle.setAttribute('aria-label', nextTheme === 'light' ? 'Skift til lyst tema' : 'Skift til morkt tema');
            themeToggle.setAttribute('title', nextTheme === 'light' ? 'Skift til lyst tema' : 'Skift til morkt tema');
        }
    };

    applyTheme(localStorage.getItem(THEME_KEY) || 'dark');

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isLight = document.body.getAttribute('data-theme') === 'light';
            const nextTheme = isLight ? 'dark' : 'light';
            applyTheme(nextTheme);
            localStorage.setItem(THEME_KEY, nextTheme);
        });
    }

    // ---- NAVBAR SCROLL EFFECT ----
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.navbar__link');

    const handleNavbarScroll = () => {
        if (window.scrollY > 50) {
            navbar.classList.add('navbar--scrolled');

            // Fade out the scroll indicator
            const heroScroll = document.querySelector('.hero__scroll-indicator');
            if (heroScroll) {
                heroScroll.style.opacity = '0';
                heroScroll.style.visibility = 'hidden';
            }
        } else {
            navbar.classList.remove('navbar--scrolled');

            // Fade in the scroll indicator
            const heroScroll = document.querySelector('.hero__scroll-indicator');
            if (heroScroll) {
                heroScroll.style.opacity = '1';
                heroScroll.style.visibility = 'visible';
            }
        }
    };

    window.addEventListener('scroll', handleNavbarScroll);
    handleNavbarScroll(); // run on load

    // ---- ACTIVE NAV LINK ON SCROLL ----
    const sections = document.querySelectorAll('section[id]');

    const highlightNavLink = () => {
        const scrollPos = window.scrollY + 150;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    };

    window.addEventListener('scroll', highlightNavLink);

    // ---- HAMBURGER MENU ----
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navMenu = document.getElementById('navMenu');

    const syncMenuState = () => {
        const isOpen = navMenu.classList.contains('active');
        document.body.classList.toggle('menu-open', isOpen);
    };

    hamburgerBtn.addEventListener('click', () => {
        hamburgerBtn.classList.toggle('active');
        navMenu.classList.toggle('active');
        syncMenuState();
    });

    // Close mobile menu when clicking a real navigation link (not dropdown toggles)
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (link.classList.contains('dropdown__toggle')) return;
            hamburgerBtn.classList.remove('active');
            navMenu.classList.remove('active');
            syncMenuState();
        });
    });

    // Mobile dropdown toggle support on front page
    const dropdownToggles = document.querySelectorAll('.dropdown__toggle');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                const menu = toggle.nextElementSibling;
                if (!menu) return;

                const isOpen = menu.style.display === 'block';
                menu.style.display = isOpen ? 'none' : 'block';
            }
        });
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            navMenu.classList.remove('active');
            hamburgerBtn.classList.remove('active');
            document.body.classList.remove('menu-open');
            document.querySelectorAll('.dropdown__menu').forEach(menu => {
                menu.style.display = '';
            });
        }
    });

    // ---- SCROLL REVEAL ANIMATIONS ----
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // ---- SMOOTH SCROLL ----
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // ---- RENDER NEWS ----
    window.renderNews = function () {
        const newsGrid = document.getElementById('newsGrid');
        const newsEmpty = document.getElementById('newsEmpty');
        const news = JSON.parse(localStorage.getItem('fam_news') || '[]');

        // Sort by date descending
        news.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Show max 6 news items on the front page
        const displayNews = news.slice(0, 6);

        if (displayNews.length === 0) {
            newsGrid.innerHTML = '';
            newsEmpty.style.display = 'block';
            return;
        }

        newsEmpty.style.display = 'none';
        newsGrid.innerHTML = displayNews.map(item => `
            <article class="news-card reveal visible" onclick="openNewsDetail('${item.id}')" style="cursor:pointer;">
                ${item.image ? `<img src="${item.image}" alt="${escapeHtml(item.title)}" class="news-card__image">` : `
                    <div class="news-card__image" style="background: linear-gradient(135deg, var(--color-primary-dark), var(--color-bg-card)); display: flex; align-items: center; justify-content: center; font-size: 2.5rem;">🏁</div>
                `}
                <div class="news-card__body">
                    <span class="news-card__date">${formatDate(item.date)}</span>
                    <h3 class="news-card__title">${escapeHtml(item.title)}</h3>
                    <p class="news-card__excerpt">${escapeHtml(item.content)}</p>
                </div>
            </article>
        `).join('');
    };

    // ---- NEWS DETAIL POPUP ----
    const newsModal = document.getElementById('newsModal');
    const newsModalBackdrop = document.getElementById('newsModalBackdrop');
    const newsModalClose = document.getElementById('newsModalClose');

    window.openNewsDetail = function (id) {
        const news = JSON.parse(localStorage.getItem('fam_news') || '[]');
        const item = news.find(n => n.id === id);
        if (!item) return;

        document.getElementById('newsModalDate').textContent = formatDate(item.date);
        document.getElementById('newsModalTitle').textContent = item.title;
        document.getElementById('newsModalText').textContent = item.content;

        const imgEl = document.getElementById('newsModalImage');
        if (item.image) {
            imgEl.src = item.image;
            imgEl.alt = item.title;
            imgEl.style.display = 'block';
        } else {
            imgEl.style.display = 'none';
        }

        newsModal.classList.add('active');
    };

    function closeNewsModal() {
        newsModal.classList.remove('active');
    }

    newsModalClose.addEventListener('click', closeNewsModal);
    newsModalBackdrop.addEventListener('click', closeNewsModal);

    // Close any modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeNewsModal();
        }
    });

    // ---- HELPER: Format date ----
    function formatDate(dateString) {
        const date = new Date(dateString);
        const months = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
        return `${date.getDate()}. ${months[date.getMonth()]} ${date.getFullYear()}`;
    }

    // ---- HELPER: Escape HTML ----
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Seed some default news if localStorage is empty
    if (!localStorage.getItem('fam_news')) {
        const defaultNews = [
            {
                id: '1',
                title: 'Nyhedsbrev – 24 februar',
                date: '2026-03-02',
                content: 'Hej alle. Som et nyt tiltag vil bestyrelsen udsende nyhedsbrev løbende gennem sæsonen. Håber I vil tage godt i mod det 😊 Bestyrelsen.',
                image: ''
            },
            {
                id: '2',
                title: 'Støt FAM – Kejserdalen, hver gang du tanker med OK',
                date: '2023-05-25',
                content: 'Vi har indgået en sponsoraftale med OK fra 1. juni 2023, så du kan støtte FAM - Kejserdalen hver gang du tanker. Det vigtigste af alt det...',
                image: ''
            },
            {
                id: '3',
                title: 'Sæsonstart 2026',
                date: '2026-02-15',
                content: 'Vi glæder os til at byde jer velkommen til en ny sæson i Kejserdalen! Banen er klar og vi ser frem til et fantastisk år med motocross.',
                image: ''
            }
        ];
        localStorage.setItem('fam_news', JSON.stringify(defaultNews));
    }

    // Render news on page load
    window.renderNews();

});
