// ===========================
// إعدادات Supabase
// ===========================
const SUPABASE_URL = 'https://nnlhkfeybyhvlinbqqfa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ubGhrZmV5YnlodmxpbmJxcWZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1ODIyODcsImV4cCI6MjA4NDE1ODI4N30.VhQgdxHt6YOQu8IJ-eni6_9qIeua1ZM3hx8hVe3YgZg';

let supabaseClient;
if (typeof window.supabase !== 'undefined') {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// ===========================
// وظائف العدادات
// ===========================
async function incrementStat(statType) {
    if (!supabaseClient) return;
    try {
        const { data, error } = await supabaseClient.rpc('increment_stat', {
            p_stat_type: statType
        });
        if (error) throw error;
        return data;
    } catch (err) {
        console.error('خطأ في تحديث العداد:', err);
    }
}

async function loadStats() {
    if (!supabaseClient) return;
    try {
        const { data, error } = await supabaseClient
            .from('stats')
            .select('stat_type, count');
        
        if (error) throw error;
        
        data.forEach(stat => {
            if (stat.stat_type === 'visitors') {
                animateCounter('visitorsCount', stat.count);
            } else if (stat.stat_type === 'downloads') {
                animateCounter('downloadsCount', stat.count);
            }
        });
    } catch (err) {
        console.error('خطأ في تحميل الإحصائيات:', err);
    }
}

function animateCounter(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const counter = element.querySelector('.counter');
    if (!counter) return;
    
    const duration = 2000;
    const start = 0;
    const increment = targetValue / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= targetValue) {
            counter.textContent = targetValue.toLocaleString('ar-SA');
            clearInterval(timer);
        } else {
            counter.textContent = Math.floor(current).toLocaleString('ar-SA');
        }
    }, 16);
}

// تسجيل زيارة عند تحميل الصفحة
let visitorRecorded = false;
async function recordVisitor() {
    if (visitorRecorded) return;
    visitorRecorded = true;

    const newCount = await incrementStat('visitors');
    if (newCount) {
        animateCounter('visitorsCount', newCount);
    }
}

// ===========================
// التاريخ الهجري الديناميكي
// ===========================
function populateHijriDate() {
    try {
        const now = new Date();
        const full = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        }).format(now);
        const compact = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
            day: 'numeric', month: 'long', year: 'numeric'
        }).format(now);

        const topEl  = document.querySelector('#hijriDateTopbar span');
        const heroEl = document.getElementById('hijriDateHero');
        if (topEl)  topEl.textContent  = compact;
        if (heroEl) heroEl.textContent = full;
    } catch (e) {
        console.warn('Hijri date unavailable in this browser', e);
        const topEl  = document.querySelector('#hijriDateTopbar span');
        const heroEl = document.getElementById('hijriDateHero');
        if (topEl)  topEl.textContent  = '';
        if (heroEl) heroEl.textContent = '';
    }
}

// ===========================
// حقن الخرفان والنجوم في الهيرو
// ===========================
function populateHeroParticles() {
    const container = document.querySelector('.hero-particles');
    if (!container) return;

    // خروف/كبش silhouette - جسم سحابي مع قرون وأرجل
    const sheepSvg = `<svg viewBox="0 0 70 50" xmlns="http://www.w3.org/2000/svg" fill="currentColor" aria-hidden="true">
        <ellipse cx="32" cy="28" rx="20" ry="13"/>
        <circle cx="18" cy="22" r="7"/>
        <circle cx="26" cy="18" r="8"/>
        <circle cx="36" cy="18" r="8"/>
        <circle cx="46" cy="22" r="7"/>
        <ellipse cx="56" cy="30" rx="8" ry="6.5"/>
        <path d="M53 25 Q49 19 53 16 Q56 18 56 24 Z" opacity="0.92"/>
        <path d="M59 25 Q63 19 59 16 Q56 18 56 24 Z" opacity="0.92"/>
        <rect x="22" y="38" width="3" height="9" rx="1"/>
        <rect x="30" y="40" width="3" height="8" rx="1"/>
        <rect x="40" y="40" width="3" height="8" rx="1"/>
        <rect x="48" y="38" width="3" height="9" rx="1"/>
        <circle cx="60" cy="29" r="1" fill="#0a1f4d"/>
        <path d="M62 32 Q64 32 64 34" stroke="#0a1f4d" stroke-width="0.8" fill="none"/>
    </svg>`;

    const starSvg = `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor" aria-hidden="true"><path d="M8 0 L9.5 6.5 L16 8 L9.5 9.5 L8 16 L6.5 9.5 L0 8 L6.5 6.5 Z"/></svg>`;

    // مواضع الخرفان: منتشرة في النصف السفلي قبل الـ skyline
    const sheepPositions = [
        {t:'60%', l:'6%',  d:'0s',   s:1.0 },
        {t:'66%', l:'80%', d:'4s',   s:0.9 },
        {t:'72%', l:'22%', d:'2s',   s:1.1 },
        {t:'70%', l:'58%', d:'6s',   s:0.85},
        {t:'62%', l:'42%', d:'8s',   s:0.95},
        {t:'76%', l:'12%', d:'3s',   s:0.95}
    ];

    // النجوم في النصف العلوي
    const starPositions = [
        {t:'6%',  l:'30%'}, {t:'10%', l:'58%'}, {t:'18%', l:'22%'},
        {t:'24%', l:'82%'}, {t:'14%', l:'45%'}, {t:'30%', l:'8%'},
        {t:'22%', l:'72%'}, {t:'8%',  l:'12%'}, {t:'34%', l:'90%'},
        {t:'40%', l:'4%'},  {t:'28%', l:'52%'}, {t:'42%', l:'68%'},
        {t:'46%', l:'18%'}, {t:'48%', l:'85%'}
    ];

    sheepPositions.forEach(p => {
        const el = document.createElement('div');
        el.className = 'sheep';
        el.style.cssText = `top:${p.t};left:${p.l};animation-delay:${p.d};transform:scale(${p.s});`;
        el.innerHTML = sheepSvg;
        container.appendChild(el);
    });

    starPositions.forEach((p, i) => {
        const el = document.createElement('div');
        el.className = 'star-twinkle';
        el.style.cssText = `top:${p.t};left:${p.l};animation-delay:${(i * 0.20).toFixed(2)}s;`;
        el.innerHTML = starSvg;
        container.appendChild(el);
    });
}

document.addEventListener('DOMContentLoaded', function () {

    // ===========================
    // العناصر الأساسية
    // ===========================
    const canvas      = document.getElementById('myCanvas');
    const ctx         = canvas.getContext('2d');
    const textInput   = document.getElementById('textInput');
    const clearBtn    = document.getElementById('clearName');
    const downloadBtn = document.getElementById('downloadBtn');

    // Popup container
    const popupContainer = document.createElement('div');
    popupContainer.className = 'popup-container';
    document.body.appendChild(popupContainer);

    // ===========================
    // إعدادات القوالب
    // ===========================
    const templates = {
        'post.jpg': {
            name: 'بصمات',
            type: 'portrait',          // 1080 × 1920
            canvasW: 1080, canvasH: 1920,
            textPosition: { x: 540, y: 1150 },
            textColor: '#1a3a6e',
            fontSize: 70,
            fontStyle: 'bold'
        }
    };

    let currentTemplate = 'post.jpg';
    let backgroundImage = new Image();

    // ===========================
    // تهيئة التطبيق
    // ===========================
    initApp();

    function initApp() {
        loadTemplate(currentTemplate);
        setupNameInput();
        setupDownloadBtn();

        // عناصر العيد
        populateHijriDate();
        populateHeroParticles();
        setupScrollReveal();
        setupParallax();

        // تحميل الإحصائيات وتسجيل الزيارة
        loadStats();
        setTimeout(recordVisitor, 1000);
    }

    // ===========================
    // كشف ظهور العناصر عند Scroll
    // ===========================
    function setupScrollReveal() {
        const revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
        if (!revealEls.length) return;

        if (!('IntersectionObserver' in window)) {
            revealEls.forEach(el => el.classList.add('is-visible'));
            return;
        }

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    obs.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -60px 0px'
        });

        revealEls.forEach(el => observer.observe(el));
    }

    // ===========================
    // Parallax للـ skyline + hero content + scroll indicator
    // ===========================
    function setupParallax() {
        const skyline   = document.querySelector('.hero-skyline');
        const heroContent = document.querySelector('.hero-content');
        const scrollInd = document.querySelector('.hero-scroll-indicator');
        const heroSection = document.querySelector('.hero-section');
        const particles = document.querySelector('.hero-particles');
        const topbar   = document.querySelector('.topbar');

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        let ticking = false;
        let scrollTimer;

        function onScroll() {
            const y = window.pageYOffset || document.documentElement.scrollTop;

            // تبديل خلفية التوب بار حسب موضع الـ scroll
            if (topbar) {
                topbar.classList.toggle('scrolled', y > 30);
            }

            if (!prefersReducedMotion) {
                const heroHeight = heroSection ? heroSection.offsetHeight : 800;
                const progress = Math.min(y / heroHeight, 1);

                if (skyline) {
                    skyline.style.transform = `translateY(${-y * 0.15}px)`;
                }
                if (heroContent && progress < 1.2) {
                    heroContent.style.transform = `translateY(${y * 0.30}px) scale(${1 - progress * 0.06})`;
                    heroContent.style.opacity = `${1 - progress * 0.95}`;
                }
                if (scrollInd) {
                    scrollInd.style.opacity = `${Math.max(0, 1 - progress * 2)}`;
                }
                if (particles) {
                    particles.style.transform = `translateY(${-y * 0.08}px)`;
                }

                document.body.classList.add('is-scrolling');
                clearTimeout(scrollTimer);
                scrollTimer = setTimeout(() => document.body.classList.remove('is-scrolling'), 200);
            }

            ticking = false;
        }

        // تشغيل أولي للتأكد من ضبط حالة التوب بار عند التحميل
        onScroll();

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(onScroll);
                ticking = true;
            }
        }, { passive: true });
    }

    // ===========================
    // تحميل القالب وضبط Canvas
    // ===========================
    function loadTemplate(file) {
        currentTemplate = file;
        const cfg = templates[file];

        // ضبط أبعاد canvas
        canvas.width  = cfg.canvasW;
        canvas.height = cfg.canvasH;

        // ضبط صنف CSS للشكل
        if (cfg.type === 'square') {
            canvas.classList.add('canvas-square');
        } else {
            canvas.classList.remove('canvas-square');
        }

        backgroundImage = new Image();
        backgroundImage.onload = drawCanvas;
        backgroundImage.onerror = function () {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#e8eaf0';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#9d75a8';
            ctx.font = 'bold 60px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('تعذّر تحميل الصورة', canvas.width / 2, canvas.height / 2);
        };
        backgroundImage.src = file;
    }

    // ===========================
    // رسم Canvas
    // ===========================
    function drawCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (backgroundImage.complete && backgroundImage.naturalWidth > 0) {
            ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
        }
        if (textInput.value.trim()) {
            drawText();
        }
    }

    function drawText() {
        const text = textInput.value.trim();
        const cfg   = templates[currentTemplate];

        let fontSize = cfg.fontSize;
        const maxWidth = canvas.width * 0.8;

        // تصغير الخط تلقائياً إن كان الاسم طويلاً
        ctx.textAlign = 'center';
        do {
            ctx.font = `${cfg.fontStyle} ${fontSize}px font`;
            if (ctx.measureText(text).width <= maxWidth || fontSize <= 20) break;
            fontSize -= 2;
        } while (true);

        ctx.fillStyle   = cfg.textColor;
        ctx.shadowColor = 'transparent';
        ctx.fillText(text, cfg.textPosition.x, cfg.textPosition.y);
    }

    // ===========================
    // حقل الاسم
    // ===========================
    function setupNameInput() {
        textInput.addEventListener('input', drawCanvas);

        clearBtn.addEventListener('click', function () {
            textInput.value = '';
            textInput.focus();
            drawCanvas();
        });
    }

    // ===========================
    // تحميل البطاقة
    // ===========================
    function setupDownloadBtn() {
        downloadBtn.addEventListener('click', downloadImage);
    }

    function downloadImage() {
        const cfg       = templates[currentTemplate];
        const nameVal   = textInput.value.trim();
        const fileName  = nameVal
            ? `بطاقة_${cfg.name}_لـ_${nameVal}`
            : `بطاقة_${cfg.name}`;

        downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحميل...';
        downloadBtn.disabled  = true;

        setTimeout(async () => {
            try {
                const dataUrl = canvas.toDataURL('image/png', 1.0);
                const link    = document.createElement('a');
                link.href     = dataUrl;
                link.download = `${fileName}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // تسجيل التحميل في قاعدة البيانات
                const newCount = await incrementStat('downloads');
                if (newCount) {
                    animateCounter('downloadsCount', newCount);
                }
                
                showPopup('success', 'تم تحميل البطاقة بنجاح!');
            } catch (err) {
                showPopup('error', 'حدث خطأ أثناء التحميل: ' + err.message);
            } finally {
                downloadBtn.innerHTML = '<i class="fas fa-download"></i> تحميل البطاقة';
                downloadBtn.disabled  = false;
            }
        }, 400);
    }

    // ===========================
    // Popup
    // ===========================
    function showPopup(type, message, buttons = null, duration = 4500) {
        closePopup();

        const icons = {
            success: '<i class="fas fa-check-circle"></i>',
            error:   '<i class="fas fa-exclamation-circle"></i>',
            info:    '<i class="fas fa-info-circle"></i>',
            confirm: '<i class="fas fa-question-circle"></i>'
        };
        const titles = {
            success: 'تم بنجاح!',
            error:   'حدث خطأ!',
            info:    'تنبيه',
            confirm: 'تأكيد'
        };

        let btnsHTML = '';
        if (buttons && Array.isArray(buttons)) {
            btnsHTML = `<div class="popup-buttons">${buttons.map(b => `<button class="popup-btn ${b.class || ''}">${b.text}</button>`).join('')}</div>`;
        } else {
            btnsHTML = `<div class="popup-buttons"><button class="popup-btn">حسناً</button></div>`;
        }

        const popup = document.createElement('div');
        popup.className = `popup popup-${type}`;
        popup.innerHTML = `
            <div class="popup-content">
                <button class="popup-close">&times;</button>
                <div class="popup-icon">${icons[type] || icons.info}</div>
                <h3>${titles[type] || ''}</h3>
                <p>${message}</p>
                ${btnsHTML}
            </div>`;

        popupContainer.appendChild(popup);
        popupContainer.style.display = 'flex';

        if (buttons && Array.isArray(buttons)) {
            buttons.forEach((b, i) => {
                popup.querySelectorAll('.popup-btn')[i].addEventListener('click', () => { b.action(); closePopup(); });
            });
        } else {
            popup.querySelector('.popup-btn').addEventListener('click', closePopup);
        }

        popup.querySelector('.popup-close').addEventListener('click', closePopup);
        popupContainer.addEventListener('click', e => { if (e.target === popupContainer) closePopup(); });

        if (duration && type !== 'confirm');
    }

    function closePopup() {
        popupContainer.style.display = 'none';
        popupContainer.innerHTML = '';
    }

});
