document.addEventListener('DOMContentLoaded', function () {

    // ===========================
    // العناصر الأساسية
    // ===========================
    const canvas      = document.getElementById('myCanvas');
    const ctx         = canvas.getContext('2d');
    const textInput   = document.getElementById('textInput');
    const clearBtn    = document.getElementById('clearName');
    const downloadBtn = document.getElementById('downloadBtn');
    const visualPicker = document.getElementById('visualPicker');

    // Popup container
    const popupContainer = document.createElement('div');
    popupContainer.className = 'popup-container';
    document.body.appendChild(popupContainer);

    // ===========================
    // إعدادات القوالب
    // ===========================
    const templates = {
        '1.jpg': {
            name: 'تصميم 1',
            type: 'portrait',          // 1080 × 1920
            canvasW: 1080, canvasH: 1920,
            textPosition: { x: 540, y: 1420 },
            textColor: '#7d7bb9',
            fontSize: 70,
            fontStyle: 'bold'
        },
        '2.jpg': {
            name: 'تصميم 2',
            type: 'portrait',
            canvasW: 1080, canvasH: 1920,
            textPosition: { x: 540, y: 1420 },
            textColor: '#fcfdec',
            fontSize: 70,
            fontStyle: 'bold'
        },
        '3.jpg': {
            name: 'تصميم 3',
            type: 'square',            // 1080 × 1080
            canvasW: 1080, canvasH: 1080,
            textPosition: { x: 540, y: 860 },
            textColor: '#7d7bb9',
            fontSize: 55,
            fontStyle: 'bold'
        },
        '4.jpg': {
            name: 'تصميم 4',
            type: 'square',
            canvasW: 1080, canvasH: 1080,
            textPosition: { x: 540, y: 860 },
            textColor: '#fcfdec',
            fontSize: 55,
            fontStyle: 'bold'
        }
    };

    let currentTemplate = '1.jpg';
    let backgroundImage = new Image();

    // ===========================
    // تهيئة التطبيق
    // ===========================
    initApp();

    function initApp() {
        loadTemplate(currentTemplate);
        setupTypeTabs();
        setupVisualPicker();
        setupNameInput();
        setupDownloadBtn();
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
        backgroundImage.crossOrigin = 'anonymous';
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
    // تابات نوع البطاقة (طولي / مربع)
    // ===========================
    function setupTypeTabs() {
        document.querySelectorAll('.type-tab').forEach(tab => {
            tab.addEventListener('click', function () {
                const type = this.dataset.type;

                // تفعيل التاب المحدد
                document.querySelectorAll('.type-tab').forEach(t => t.classList.remove('active'));
                this.classList.add('active');

                // إظهار / إخفاء بطاقات الpicker حسب النوع
                document.querySelectorAll('.vpick-item').forEach(item => {
                    if (item.dataset.type === type) {
                        item.classList.remove('vpick-hidden');
                    } else {
                        item.classList.add('vpick-hidden');
                    }
                });

                // تحديد أول بطاقة من النوع تلقائياً
                const firstOfType = visualPicker.querySelector(`.vpick-item[data-type="${type}"]`);
                if (firstOfType) selectVpick(firstOfType);
            });
        });
    }

    // ===========================
    // Visual Picker
    // ===========================
    function setupVisualPicker() {
        document.querySelectorAll('.vpick-item').forEach(item => {
            item.addEventListener('click', function () {
                selectVpick(this);
            });
        });
    }

    function selectVpick(item) {
        document.querySelectorAll('.vpick-item').forEach(i => i.classList.remove('selected-vpick'));
        item.classList.add('selected-vpick');
        loadTemplate(item.dataset.template);
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

        setTimeout(() => {
            try {
                const dataUrl = canvas.toDataURL('image/png', 1.0);
                const link    = document.createElement('a');
                link.href     = dataUrl;
                link.download = `${fileName}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
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

        if (duration && type !== 'confirm') setTimeout(closePopup, duration);
    }

    function closePopup() {
        popupContainer.style.display = 'none';
        popupContainer.innerHTML = '';
    }

});
