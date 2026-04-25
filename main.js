document.addEventListener('DOMContentLoaded', () => {
    const focusableElementsString = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';
    let lastFocusedElement = null;
    let firstFocusableElement;
    let lastFocusableElement;

    const mobileMenuBtn = document.getElementById('mobile-menu-trigger');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    const toggleNav = () => {
        const isHidden = mobileMenu.classList.contains('hidden');
        mobileMenu.classList.toggle('hidden', !isHidden);
        mobileMenuBtn.setAttribute('aria-expanded', (!isHidden).toString());
        document.body.style.overflow = isHidden ? 'hidden' : ''; 
    };

    mobileMenuBtn.addEventListener('click', toggleNav);
    mobileLinks.forEach(link => link.addEventListener('click', toggleNav));

    document.querySelectorAll('.grid-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const gridId = btn.getAttribute('data-target');
            const textShow = btn.getAttribute('data-text-show');
            const textHide = btn.getAttribute('data-text-hide');
            const grid = document.getElementById(gridId);
            const hiddenItems = grid.querySelectorAll('.toggle-item');
            const isExpanded = grid.dataset.expanded === "true";

            if (isExpanded) {
                hiddenItems.forEach(item => item.classList.add('hidden'));
                grid.dataset.expanded = "false";
                btn.setAttribute('aria-expanded', 'false');
                btn.innerHTML = `${textShow} <span class="indicator">↓</span>`;
            } else {
                hiddenItems.forEach(item => item.classList.remove('hidden'));
                grid.dataset.expanded = "true";
                btn.setAttribute('aria-expanded', 'true');
                btn.innerHTML = `${textHide} <span class="indicator">↑</span>`;
            }
        });
    });

    const lightbox = document.getElementById('lightbox');
    const lightboxContent = document.getElementById('lightbox-content');
    const closeBtn = document.getElementById('lightbox-close');
    const overlay = document.querySelector('.lightbox-overlay');

    const trapTabKey = (e) => {
        const isTabPressed = e.key === 'Tab' || e.keyCode === 9;
        if (!isTabPressed) return;

        if (e.shiftKey) { 
            if (document.activeElement === firstFocusableElement) {
                lastFocusableElement.focus();
                e.preventDefault();
            }
        } else { 
            if (document.activeElement === lastFocusableElement) {
                firstFocusableElement.focus();
                e.preventDefault();
            }
        }
    };

    const closeLightbox = () => {
        lightbox.classList.remove('visible');
        document.removeEventListener('keydown', trapTabKey);
        
        setTimeout(() => {
            lightbox.classList.add('hidden');
            lightboxContent.innerHTML = ''; 
            document.body.style.overflow = ''; 
            if (lastFocusedElement) lastFocusedElement.focus();
        }, 300);
    };

    closeBtn.addEventListener('click', closeLightbox);
    overlay.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape" && lightbox.classList.contains('visible')) closeLightbox();
    });

    document.querySelectorAll('.lightbox-trigger').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const type = btn.getAttribute('data-type');
            const src = btn.getAttribute('data-src');
            const title = btn.getAttribute('data-title');
            const desc = btn.getAttribute('data-desc');
            const imagesRaw = btn.getAttribute('data-images');
            const templateId = btn.getAttribute('data-template');
            
            lastFocusedElement = btn;
            lightboxContent.innerHTML = ''; 
            
            const container = document.createElement('div');
            container.className = 'w-full flex flex-col items-center py-8 focus:outline-none';
            container.tabIndex = -1; 

            if (type === 'img') {
                const img = document.createElement('img');
                img.src = src;
                img.alt = title || "Expanded Portfolio View";
                img.className = 'w-auto h-auto max-h-[70vh] max-w-full rounded-md shadow-2xl border border-white/5';
                container.appendChild(img);
            } 
            else if (type === 'youtube') {
                const iframeWrapper = document.createElement('div');
                iframeWrapper.className = 'w-full aspect-video max-w-5xl';
                iframeWrapper.innerHTML = `<iframe src="https://www.youtube.com/embed/${src}?rel=0" title="${title || 'Video player'}" frameborder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="w-full h-full rounded-md shadow-2xl border border-white/5"></iframe>`;
                container.appendChild(iframeWrapper);
            }
            else if (type === 'video') {
                const video = document.createElement('video');
                video.src = src;
                video.controls = true;
                video.autoplay = true;
                video.className = 'w-auto h-auto max-h-[70vh] max-w-full rounded-md shadow-2xl border border-white/5 outline-none bg-black';
                container.appendChild(video);
            }
            else if (type === 'article') {
                if (imagesRaw) {
                    try {
                        const images = JSON.parse(imagesRaw);
                        if (images.length > 0) {
                            const carouselWrap = document.createElement('div');
                            carouselWrap.className = 'relative w-full max-w-4xl mx-auto aspect-video md:aspect-[16/9] max-h-[70vh] mb-8 bg-black rounded-xl overflow-hidden border border-white/5 group flex items-center justify-center';
                            
                            const cImg = document.createElement('img');
                            cImg.src = images[0];
                            cImg.className = 'w-full h-full object-contain transition-opacity duration-300';
                            carouselWrap.appendChild(cImg);

                            if (images.length > 1) {
                                let cIndex = 0;
                                
                                const updateImg = (idx) => {
                                    cImg.style.opacity = 0;
                                    setTimeout(() => {
                                        cImg.src = images[idx];
                                        cImg.style.opacity = 1;
                                    }, 200);
                                };

                                const createBtn = (html, positionClass, step) => {
                                    const cb = document.createElement('button');
                                    cb.innerHTML = html;
                                    cb.className = `absolute ${positionClass} top-1/2 -translate-y-1/2 bg-black/60 hover:bg-brand-accent text-white w-12 h-12 rounded-full flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-white z-10 backdrop-blur-md border border-white/10`;
                                    cb.addEventListener('click', (ev) => {
                                        ev.stopPropagation();
                                        const newIndex = cIndex + step;
                                        if (newIndex >= 0 && newIndex < images.length) {
                                            cIndex = newIndex;
                                            updateImg(cIndex);
                                            updateButtonVisibility();
                                        }
                                    });
                                    return cb;
                                };

                                const btnPrev = createBtn('&#10094;', 'left-4', -1);
                                const btnNext = createBtn('&#10095;', 'right-4', 1);
                                carouselWrap.appendChild(btnPrev);
                                carouselWrap.appendChild(btnNext);

                                const updateButtonVisibility = () => {
                                    btnPrev.style.display = cIndex === 0 ? 'none' : 'flex';
                                    btnNext.style.display = cIndex === images.length - 1 ? 'none' : 'flex';
                                };
                                
                                updateButtonVisibility();
                            }
                            container.appendChild(carouselWrap);
                        }
                    } catch (err) {
                        console.error('Carousel JSON parse error', err);
                    }
                }
                
                if (templateId) {
                    const tmpl = document.querySelector(templateId);
                    if (tmpl) {
                        const contentDiv = document.createElement('div');
                        contentDiv.className = 'w-full max-w-4xl mx-auto px-4 md:px-0';
                        contentDiv.innerHTML = tmpl.innerHTML;
                        container.appendChild(contentDiv);
                    }
                }
            }

            if (title || desc) {
                const textDiv = document.createElement('div');
                textDiv.className = 'mt-6 text-center max-w-2xl px-4';
                if (title) textDiv.innerHTML += `<h3 class="text-2xl text-white font-medium mb-2">${title}</h3>`;
                if (desc) textDiv.innerHTML += `<p class="text-muted text-base leading-relaxed">${desc}</p>`;
                container.appendChild(textDiv);
            }
            
            lightboxContent.appendChild(container);
            lightbox.classList.remove('hidden');
            
            setTimeout(() => {
                lightbox.classList.add('visible');
                document.body.style.overflow = 'hidden'; 
                
                const focusableElements = lightbox.querySelectorAll(focusableElementsString);
                if (focusableElements.length) {
                    firstFocusableElement = focusableElements[0];
                    lastFocusableElement = focusableElements[focusableElements.length - 1];
                    document.addEventListener('keydown', trapTabKey);
                }
                closeBtn.focus();
            }, 10);
        });
    });
});