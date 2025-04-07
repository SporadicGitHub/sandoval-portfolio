// Portfolio Filter Functionality
document.addEventListener('DOMContentLoaded', function() {
  // Initialize filter buttons
  const filterButtons = document.querySelectorAll('.filter-btn');
  const masonryItems = document.querySelectorAll('.masonry-item');

  // Add click event to each filter button
  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all buttons
      filterButtons.forEach(btn => btn.classList.remove('active'));
      // Add active class to clicked button
      this.classList.add('active');
      
      const filter = this.getAttribute('data-filter');
      
      // Filter items
      masonryItems.forEach(item => {
        if (filter === 'reset' || item.getAttribute('data-category') === filter) {
          item.style.display = 'block';
          // Add fade-in animation
          setTimeout(() => {
            item.style.opacity = '1';
          }, 50);
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // Image Modal Functionality
  const modal = document.getElementById('imgModal');
  const modalImg = document.getElementById('modalImg');
  const closeBtn = document.getElementById('closeModal');
  const masonryImages = document.querySelectorAll('.masonry-img');

  // Function to open modal
  function openModal(imgElement) {
    modal.style.display = 'flex';
    modalImg.src = imgElement.src;
    modalImg.alt = imgElement.alt;
    document.body.style.overflow = 'hidden';
  }

  // Function to close modal
  function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  // Add click event to all portfolio images
  masonryImages.forEach(img => {
    img.addEventListener('click', function() {
      openModal(this);
    });
  });

  // Close modal when clicking the close button
  closeBtn.addEventListener('click', closeModal);

  // Close modal when clicking outside the image
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Close modal with Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeModal();
    }
  });
});

// Lazy loading for images
document.addEventListener("DOMContentLoaded", function() {
  const lazyImages = document.querySelectorAll("img[data-src]");
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute("data-src");
        observer.unobserve(img);
      }
    });
  });

  lazyImages.forEach(img => imageObserver.observe(img));
});
