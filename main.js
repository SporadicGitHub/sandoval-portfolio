(() => {
  const body = document.body;
  const menuToggle = document.getElementById('menu-toggle');
  const siteNav = document.getElementById('site-nav');
  const lightbox = document.getElementById('lightbox');
  const dialog = lightbox?.querySelector('.lightbox-dialog');
  const mediaHost = document.getElementById('lightbox-media');
  const titleHost = document.getElementById('lightbox-title');
  const descriptionHost = document.getElementById('lightbox-description');
  const controlsHost = document.getElementById('lightbox-controls');
  let activeTrigger = null;
  let activeImages = [];
  let activeIndex = 0;

  body.classList.add('js-ready');

  // Mobile navigation: close on selection, outside click, Escape, or return to desktop.
  const closeMenu = () => {
    if (!menuToggle || !siteNav) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
    siteNav.classList.remove('is-open');
  };
  menuToggle?.addEventListener('click', () => {
    const willOpen = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(willOpen));
    menuToggle.setAttribute('aria-label', willOpen ? 'Close navigation' : 'Open navigation');
    siteNav?.classList.toggle('is-open', willOpen);
  });
  siteNav?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 760) closeMenu();
  }, { passive: true });

  // Gradual, non-essential reveal animation. Content stays visible if JS is unavailable.
  const revealTargets = document.querySelectorAll('.section-heading, .featured-project, .project-card, .case-study-intro, .process-steps, .about-heading, .about-copy');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal');
          instance.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    revealTargets.forEach(el => observer.observe(el));
  }

  // Expand secondary video projects only on request; no-JS visitors still see all work.
  document.querySelectorAll('.expand-button[data-grid]').forEach(button => {
    const grid = document.getElementById(button.dataset.grid);
    if (!grid) return;
    grid.classList.add('is-collapsed');
    button.addEventListener('click', () => {
      const expanded = grid.classList.toggle('is-expanded');
      button.setAttribute('aria-expanded', String(expanded));
      button.innerHTML = expanded ? 'Show fewer video projects <span aria-hidden="true">↑</span>' : 'View more video work <span aria-hidden="true">↓</span>';
    });
  });

  const optimizeImageUrl = url => {
    if (!url || !url.includes('res.cloudinary.com') || !url.includes('/image/upload/')) return url;
    return url.replace('/image/upload/', '/image/upload/f_auto,q_auto,w_1600,c_limit/');
  };

  const clearMedia = () => {
    if (!mediaHost) return;
    mediaHost.querySelectorAll('video').forEach(video => {
      video.pause();
      video.removeAttribute('src');
      video.load();
    });
    mediaHost.replaceChildren();
    controlsHost?.replaceChildren();
  };

  const makeCounter = () => {
    const counter = document.createElement('span');
    counter.className = 'lightbox-counter';
    counter.textContent = `${activeIndex + 1} / ${activeImages.length}`;
    return counter;
  };

  const showImage = index => {
    if (!activeImages.length || !mediaHost) return;
    activeIndex = Math.max(0, Math.min(index, activeImages.length - 1));
    clearMedia();
    const image = document.createElement('img');
    image.alt = `${titleHost?.textContent || 'Project'} — image ${activeIndex + 1}`;
    image.decoding = 'async';
    image.loading = 'eager';
    image.src = optimizeImageUrl(activeImages[activeIndex]);
    image.addEventListener('error', () => {
      const error = document.createElement('p');
      error.className = 'lightbox-error';
      error.textContent = 'This image could not be loaded. Check the original asset URL.';
      mediaHost.append(error);
    }, { once: true });
    mediaHost.append(image);

    if (activeImages.length > 1 && controlsHost) {
      const previous = document.createElement('button');
      previous.type = 'button';
      previous.textContent = '← Previous';
      previous.disabled = activeIndex === 0;
      previous.addEventListener('click', () => showImage(activeIndex - 1));
      const next = document.createElement('button');
      next.type = 'button';
      next.textContent = 'Next →';
      next.disabled = activeIndex === activeImages.length - 1;
      next.addEventListener('click', () => showImage(activeIndex + 1));
      controlsHost.append(previous, next, makeCounter());
    }
  };

  const showVideo = trigger => {
    clearMedia();
    const video = document.createElement('video');
    video.controls = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.src = trigger.dataset.src || '';
    mediaHost?.append(video);
    // Do not force autoplay; users should choose when playback starts.
  };

  const openLightbox = trigger => {
    if (!lightbox || !dialog || !mediaHost) return;
    activeTrigger = trigger;
    const isVideo = trigger.dataset.type === 'video';
    titleHost.textContent = trigger.dataset.title || 'Project preview';
    descriptionHost.textContent = trigger.dataset.desc || '';
    activeImages = [];
    activeIndex = 0;

    if (isVideo) {
      showVideo(trigger);
    } else {
      try {
        activeImages = JSON.parse(trigger.dataset.images || '[]').filter(url => typeof url === 'string' && url.length);
      } catch (error) {
        activeImages = [];
      }
      if (activeImages.length) showImage(0);
      else {
        clearMedia();
        const error = document.createElement('p');
        error.className = 'lightbox-error';
        error.textContent = 'No preview images are available for this project.';
        mediaHost.append(error);
      }
    }
    lightbox.hidden = false;
    body.classList.add('modal-open');
    dialog.focus();
    const closeButton = lightbox.querySelector('.lightbox-close');
    closeButton?.focus();
  };

  const closeLightbox = () => {
    if (!lightbox || lightbox.hidden) return;
    lightbox.hidden = true;
    body.classList.remove('modal-open');
    clearMedia();
    activeImages = [];
    const focusTarget = activeTrigger;
    activeTrigger = null;
    focusTarget?.focus();
  };

  document.querySelectorAll('.lightbox-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => openLightbox(trigger));
  });
  lightbox?.querySelectorAll('[data-close-lightbox]').forEach(button => button.addEventListener('click', closeLightbox));

  document.addEventListener('keydown', event => {
    if (!lightbox || lightbox.hidden) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeLightbox();
      return;
    }
    if (event.key === 'ArrowLeft' && activeImages.length > 1) {
      event.preventDefault();
      showImage(activeIndex - 1);
    }
    if (event.key === 'ArrowRight' && activeImages.length > 1) {
      event.preventDefault();
      showImage(activeIndex + 1);
    }
    if (event.key === 'Tab' && dialog) {
      const focusable = [...dialog.querySelectorAll('button:not([disabled]), a[href], video[controls]')].filter(el => el.offsetParent !== null);
      if (!focusable.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
})();
