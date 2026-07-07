// ============================================
// AI VISIBILITY AUDIT TOOL - MAIN SCRIPT
// ============================================

(function () {
    'use strict';

    // ── DOM ELEMENTS ──────────────────────
    const auditBtn = document.getElementById('runAuditBtn');
    const urlInput = document.getElementById('websiteUrl');
    const resultsSection = document.getElementById('resultsSection');
    const resultsGrid = document.getElementById('resultsGrid');
    const resultsCta = document.getElementById('resultsCta');
    const contactForm = document.getElementById('contactForm');
    const successMessage = document.getElementById('successMessage');
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.getElementById('mobileMenu');

    // ── HAMBURGER MENU ────────────────────
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', function () {
            const isOpen = mobileMenu.classList.contains('active');
            if (isOpen) {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            } else {
                hamburger.classList.add('active');
                mobileMenu.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });

        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // ── AUDIT FUNCTION ────────────────────
    function runAudit() {
        const url = urlInput.value.trim();

        if (!url) {
            urlInput.classList.add('error');
            urlInput.focus();
            setTimeout(() => urlInput.classList.remove('error'), 2000);
            return;
        }

        // Simulate audit results
        const results = [
            {
                icon: '📱',
                title: 'Mobile-Friendly',
                status: 'pass',
                score: 92,
                scoreClass: 'good',
                description: 'Your site appears to be mobile-responsive.'
            },
            {
                icon: '⚡',
                title: 'Page Speed',
                status: 'warn',
                score: 68,
                scoreClass: 'warning',
                description: 'Load time could be improved for better AI ranking.'
            },
            {
                icon: '🏷️',
                title: 'Meta Tags',
                status: 'pass',
                score: 95,
                scoreClass: 'good',
                description: 'Title and description tags are properly configured.'
            },
            {
                icon: '♿',
                title: 'Accessibility',
                status: 'warn',
                score: 72,
                scoreClass: 'warning',
                description: 'Some accessibility improvements recommended.'
            },
            {
                icon: '🤖',
                title: 'AI Readiness',
                status: 'fail',
                score: 45,
                scoreClass: 'bad',
                description: 'Your content needs optimization for AI search engines.'
            },
            {
                icon: '🔗',
                title: 'Structured Data',
                status: 'fail',
                score: 30,
                scoreClass: 'bad',
                description: 'Schema markup missing. Critical for AI mentions.'
            }
        ];

        // Calculate overall score
        const overall = Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length);

        // Build results HTML
        let html = `
            <div class="overall-score">
                <span class="big-number">${overall}%</span>
                <p>Overall AI Visibility Score for <strong>${escapeHTML(url)}</strong></p>
            </div>
        `;

        results.forEach(r => {
            html += `
                <div class="result-card ${r.status}">
                    <div class="result-icon">${r.icon}</div>
                    <h3>${r.title}</h3>
                    <div class="result-score ${r.scoreClass}">${r.score}%</div>
                    <p>${r.description}</p>
                </div>
            `;
        });

        resultsGrid.innerHTML = html;

        // Build CTA
        resultsCta.innerHTML = `
            <p style="margin-bottom: 1rem; color: var(--text-muted);">
                Want a full AI visibility report with actionable fixes?
            </p>
            <a href="#contact" class="audit-btn">Get Full Report →</a>
        `;

        // Show results
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ── EVENT LISTENERS ───────────────────
    if (auditBtn) {
        auditBtn.addEventListener('click', runAudit);
    }

    if (urlInput) {
        urlInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') runAudit();
        });
    }

    // ── CONTACT FORM ──────────────────────
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const name = document.getElementById('name');
            const email = document.getElementById('email');
            const companyUrl = document.getElementById('companyUrl');
            let isValid = true;

            [name, email, companyUrl].forEach(field => {
                if (!field.value.trim()) {
                    field.classList.add('error');
                    isValid = false;
                } else {
                    field.classList.remove('error');
                }
            });

            if (email.value && !email.value.includes('@')) {
                email.classList.add('error');
                isValid = false;
            }

            if (!isValid) {
                const firstError = contactForm.querySelector('.error');
                if (firstError) firstError.focus();
                return;
            }

            // Save to localStorage
            const submissions = JSON.parse(localStorage.getItem('ai_audit_contacts') || '[]');
            submissions.push({
                name: name.value,
                email: email.value,
                companyUrl: companyUrl.value,
                message: document.getElementById('message')?.value || '',
                date: new Date().toISOString()
            });
            localStorage.setItem('ai_audit_contacts', JSON.stringify(submissions));

            contactForm.reset();
            successMessage.classList.add('show');
            successMessage.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => successMessage.classList.remove('show'), 5000);
        });
    }

    // ── FOOTER ────────────────────────────
    const yearSpan = document.getElementById('year');
    const modifiedSpan = document.getElementById('modified');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
    if (modifiedSpan) {
        const lm = new Date(document.lastModified);
        modifiedSpan.textContent = lm.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    // ── SMOOTH SCROLL ─────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    console.log('✅ AI Visibility Audit Tool initialized');
})();