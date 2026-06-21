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

    window.addEventListener('load', () => {
        window.scrollTo(0, 0);
    });

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleNav);
    }
    mobileLinks.forEach(link => link.addEventListener('click', toggleNav));

    document.querySelectorAll('.grid-toggle-btn').forEach(btn => {
        const gridId = btn.getAttribute('data-target');
        const grid = document.getElementById(gridId);
        if (!grid) return;
        const items = grid.querySelectorAll('article');

        if (items.length <= 3) {
            btn.parentElement.style.display = 'none';
        } else {
            items.forEach((item, index) => {
                if (index >= 3) {
                    item.classList.add('hidden', 'toggle-item', 'transition-all', 'duration-500', 'opacity-0', 'transform', 'translate-y-4');
                }
            });
        }

        btn.addEventListener('click', () => {
            const hiddenItems = grid.querySelectorAll('.toggle-item');
            const isExpanded = grid.dataset.expanded === "true";
            const textShow = btn.getAttribute('data-text-show') || 'Show More';
            const textHide = btn.getAttribute('data-text-hide') || 'Show Less';

            if (isExpanded) {
                hiddenItems.forEach(item => {
                    item.classList.add('opacity-0', 'translate-y-4');
                    setTimeout(() => item.classList.add('hidden'), 500);
                });
                grid.dataset.expanded = "false";
                btn.setAttribute('aria-expanded', 'false');
                btn.innerHTML = `${textShow} <span class="indicator transition-transform duration-300">↓</span>`;
            } else {
                hiddenItems.forEach(item => {
                    item.classList.remove('hidden');
                    setTimeout(() => {
                        item.classList.remove('opacity-0', 'translate-y-4');
                    }, 10);
                });
                grid.dataset.expanded = "true";
                btn.setAttribute('aria-expanded', 'true');
                btn.innerHTML = `${textHide} <span class="indicator transition-transform duration-300 rotate-180">↑</span>`;
            }
        });
    });

    const lightbox = document.getElementById('lightbox');
    const lightboxContent = document.getElementById('lightbox-content');

    if (!lightbox || !lightboxContent) return;

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

    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape" && lightbox.classList.contains('visible')) closeLightbox();
    });

    const optimizeCloudinaryUrl = (url) => {
        if (!url || !url.includes('cloudinary.com')) return url;
        if (url.includes('upload/f_auto,q_auto')) return url;
        return url.replace('upload/', 'upload/f_auto,q_auto,w_1400,c_limit/');
    };

    const createLoaderSpinner = () => {
        const spinner = document.createElement('div');
        spinner.className = 'absolute inset-0 flex flex-col items-center justify-center space-y-3 z-10 bg-[#080608]/80 backdrop-blur-sm transition-opacity duration-300';
        spinner.innerHTML = `
            <div class="w-8 h-8 border-2 border-[#C8922A]/20 border-t-[#C8922A] rounded-full animate-spin"></div>
            <span class="text-[10px] uppercase tracking-[0.2em] text-[#9A9290]">Resolving Asset...</span>
        `;
        return spinner;
    };

    const prefetchSingleAsset = (btn) => {
        if (btn.dataset.prefetched === "true") return;
        
        const type = btn.getAttribute('data-type');
        const src = optimizeCloudinaryUrl(btn.getAttribute('data-src'));
        const imagesRaw = btn.getAttribute('data-images');

        if (type === 'img' && src) {
            const cacheImg = new Image();
            cacheImg.src = src;
        } 
        else if (type === 'video' && src) {
            const cacheVideo = document.createElement('video');
            cacheVideo.src = src;
            cacheVideo.preload = 'auto';
        }
        else if (type === 'article' && imagesRaw) {
            try {
                const images = JSON.parse(imagesRaw);
                images.forEach(url => {
                    const img = new Image();
                    img.src = optimizeCloudinaryUrl(url);
                });
            } catch (e) {
                console.error("Prefetch parsing failure", e);
            }
        }
        btn.dataset.prefetched = "true";
    };

    document.querySelectorAll('.lightbox-trigger').forEach(btn => {
        btn.addEventListener('mouseenter', () => prefetchSingleAsset(btn));
        btn.addEventListener('focus', () => prefetchSingleAsset(btn));
    });

    window.addEventListener('load', () => {
        setTimeout(() => {
            document.querySelectorAll('.lightbox-trigger').forEach(btn => {
                prefetchSingleAsset(btn);
            });
        }, 1500);
    });

    document.querySelectorAll('.lightbox-trigger').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const type = btn.getAttribute('data-type');
            const src = optimizeCloudinaryUrl(btn.getAttribute('data-src'));
            const title = btn.getAttribute('data-title');
            const desc = btn.getAttribute('data-desc');
            const imagesRaw = btn.getAttribute('data-images');
            const templateId = btn.getAttribute('data-template');
            
            lastFocusedElement = btn;
            lightboxContent.innerHTML = ''; 
            
            const mainLayout = document.createElement('div');
            mainLayout.className = 'flex flex-row w-full h-full';
            mainLayout.tabIndex = -1;

            // LEFT: fixed-width media pane — content sits centered, letterbox bars fill the rest
            const mediaPane = document.createElement('div');
            mediaPane.style.cssText = 'flex: 0 0 calc(100% - 360px); width: calc(100% - 360px); height: 100%; position: relative; display: flex; align-items: center; justify-content: center; background: #080608; overflow: hidden;';

            // Close button — top-left corner of media pane
            const dynamicCloseBtn = document.createElement('button');
            dynamicCloseBtn.style.cssText = 'position: absolute; top: 12px; left: 12px; z-index: 50; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: rgba(8,6,8,0.7); border: 1px solid rgba(255,255,255,0.2); border-radius: 50%; color: white; font-size: 20px; line-height: 1; cursor: pointer; backdrop-filter: blur(4px); transition: background 0.2s;';
            dynamicCloseBtn.innerHTML = '&times;';
            dynamicCloseBtn.setAttribute('aria-label', 'Close modal');
            dynamicCloseBtn.addEventListener('click', closeLightbox);
            dynamicCloseBtn.addEventListener('mouseenter', () => { dynamicCloseBtn.style.background = '#C8922A'; dynamicCloseBtn.style.color = '#080608'; });
            dynamicCloseBtn.addEventListener('mouseleave', () => { dynamicCloseBtn.style.background = 'rgba(8,6,8,0.7)'; dynamicCloseBtn.style.color = 'white'; });
            mediaPane.appendChild(dynamicCloseBtn);

            // RIGHT: fixed 360px info pane — header on top, body scrolls below
            const infoPane = document.createElement('div');
            infoPane.style.cssText = 'flex: 0 0 360px; width: 360px; height: 100%; display: flex; flex-direction: column; background: #100C14; border-left: 1px solid rgba(255,255,255,0.08); overflow: hidden;';

            if (type === 'img') {
                const img = document.createElement('img');
                img.className = 'w-full h-full object-contain opacity-0 transition-opacity duration-300 block';
                img.alt = title || "Expanded Portfolio View";
                
                const spinner = createLoaderSpinner();
                mediaPane.appendChild(spinner);

                img.onload = () => {
                    img.classList.remove('opacity-0');
                    spinner.classList.add('opacity-0');
                    setTimeout(() => spinner.remove(), 300);
                };
                img.src = src;
                mediaPane.appendChild(img);
            } 
            else if (type === 'youtube') {
                const iframeWrapper = document.createElement('div');
                iframeWrapper.className = 'w-full h-full opacity-0 transition-opacity duration-300';
                iframeWrapper.innerHTML = `<iframe src="https://www.youtube.com/embed/${src}?rel=0" title="${title || 'Video player'}" frameborder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="w-full h-full"></iframe>`;
                
                const spinner = createLoaderSpinner();
                mediaPane.appendChild(spinner);
                mediaPane.appendChild(iframeWrapper);
                
                iframeWrapper.querySelector('iframe').onload = () => {
                    iframeWrapper.classList.remove('opacity-0');
                    spinner.remove();
                };
            }
            else if (type === 'video') {
                const video = document.createElement('video');
                video.src = src;
                video.controls = true;
                video.autoplay = true;
                video.className = 'w-full h-full object-contain outline-none bg-transparent opacity-0 transition-opacity duration-300';
                
                const spinner = createLoaderSpinner();
                mediaPane.appendChild(spinner);

                video.onloadeddata = () => {
                    video.classList.remove('opacity-0');
                    spinner.remove();
                };
                mediaPane.appendChild(video);
            }
            else if (type === 'article') {
                if (imagesRaw) {
                    try {
                        const images = JSON.parse(imagesRaw).map(url => optimizeCloudinaryUrl(url));
                        if (images.length > 0) {
                            const carouselWrap = document.createElement('div');
                            carouselWrap.className = 'relative w-full h-full flex items-center justify-center bg-transparent';
                            
                            const cImg = document.createElement('img');
                            cImg.className = 'w-full h-full object-contain transition-opacity duration-300 opacity-0';
                            
                            const innerSpinner = createLoaderSpinner();
                            carouselWrap.appendChild(innerSpinner);

                            cImg.onload = () => {
                                cImg.classList.remove('opacity-0');
                                innerSpinner.classList.add('opacity-0');
                            };
                            cImg.src = images[0];
                            carouselWrap.appendChild(cImg);

                            if (images.length > 1) {
                                let cIndex = 0;
                                
                                const updateImg = (idx) => {
                                    cImg.classList.add('opacity-0');
                                    innerSpinner.classList.remove('opacity-0');
                                    cImg.onload = () => {
                                        cImg.classList.remove('opacity-0');
                                        innerSpinner.classList.add('opacity-0');
                                    };
                                    cImg.src = images[idx];
                                };

                                const createBtn = (html, positionClass, step) => {
                                    const cb = document.createElement('button');
                                    cb.innerHTML = html;
                                    cb.style.cssText = `position: absolute; ${positionClass} top: 50%; transform: translateY(-50%); width: 44px; height: 44px; border-radius: 50%; background: rgba(8,6,8,0.75); border: 1px solid rgba(200,146,42,0.4); color: #C8922A; display: flex; align-items: center; justify-content: center; font-size: 18px; cursor: pointer; z-index: 10; backdrop-filter: blur(4px); transition: background 0.2s, color 0.2s;`;
                                    cb.addEventListener('mouseenter', () => { cb.style.background = '#C8922A'; cb.style.color = '#080608'; });
                                    cb.addEventListener('mouseleave', () => { cb.style.background = 'rgba(8,6,8,0.75)'; cb.style.color = '#C8922A'; });
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

                                const btnPrev = createBtn('&#10094;', 'left: 16px;', -1);
                                const btnNext = createBtn('&#10095;', 'right: 16px;', 1);
                                carouselWrap.appendChild(btnPrev);
                                carouselWrap.appendChild(btnNext);

                                const updateButtonVisibility = () => {
                                    btnPrev.style.display = cIndex === 0 ? 'none' : 'flex';
                                    btnNext.style.display = cIndex === images.length - 1 ? 'none' : 'flex';
                                };
                                
                                updateButtonVisibility();
                            }
                            mediaPane.appendChild(carouselWrap);
                        }
                    } catch (err) {
                        console.error('Carousel JSON parse error', err);
                    }
                }
            }

            // Info pane: fixed header block (title + desc), then scrollable body for long content
            const infoPaneHeader = document.createElement('div');
            infoPaneHeader.style.cssText = 'flex-shrink: 0; padding: 20px 24px 16px; border-bottom: 1px solid rgba(255,255,255,0.07);';

            if (title) {
                const titleEl = document.createElement('h3');
                titleEl.style.cssText = 'font-size: 15px; font-weight: 400; color: #F2EFE8; letter-spacing: -0.01em; line-height: 1.3; margin-bottom: 8px;';
                titleEl.textContent = title;
                infoPaneHeader.appendChild(titleEl);
            }
            if (desc) {
                const descEl = document.createElement('p');
                descEl.style.cssText = 'font-size: 12px; color: #9A9290; line-height: 1.6; font-weight: 300;';
                descEl.textContent = desc;
                infoPaneHeader.appendChild(descEl);
            }

            infoPane.appendChild(infoPaneHeader);

            // Scrollable body — article template content goes here
            const infoPaneBody = document.createElement('div');
            infoPaneBody.style.cssText = 'flex: 1; overflow-y: auto; padding: 20px 24px; scrollbar-width: thin; scrollbar-color: rgba(200,146,42,0.3) rgba(0,0,0,0.2);';

            if (type === 'article' && templateId) {
                const tmpl = document.querySelector(templateId);
                if (tmpl) {
                    const contentDiv = document.createElement('div');
                    contentDiv.style.cssText = 'font-size: 13px; color: #9A9290; line-height: 1.7;';
                    contentDiv.innerHTML = tmpl.innerHTML;
                    infoPaneBody.appendChild(contentDiv);
                }
            }

            infoPane.appendChild(infoPaneBody);
            
            mainLayout.appendChild(mediaPane);
            mainLayout.appendChild(infoPane);
            lightboxContent.appendChild(mainLayout);
            
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
                dynamicCloseBtn.focus();
            }, 10);
        });
    });
});