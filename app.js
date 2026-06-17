document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================
     THEME TOGGLER (LIGHT / DARK)
     ========================================== */
  const themeToggleBtn = document.getElementById('theme-toggle');
  const htmlElement = document.documentElement;

  // Retrieve theme preference or default to system preference
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme) {
    htmlElement.setAttribute('data-theme', savedTheme);
  } else if (systemPrefersDark) {
    htmlElement.setAttribute('data-theme', 'dark');
  }

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Add brief micro-rotation to SVG icons
    const svgIcon = themeToggleBtn.querySelector('svg:not([style*="display: none"])');
    if (svgIcon) {
      svgIcon.style.transform = 'rotate(360deg)';
      setTimeout(() => svgIcon.style.transform = '', 300);
    }
  });


  /* ==========================================
     MOBILE NAVIGATION DRAWER
     ========================================== */
  const menuTrigger = document.getElementById('menu-trigger');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  const toggleMobileNav = (open) => {
    menuTrigger.setAttribute('aria-expanded', open);
    mobileNav.setAttribute('aria-hidden', !open);
    if (open) {
      mobileNav.classList.add('is-active');
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    } else {
      mobileNav.classList.remove('is-active');
      document.body.style.overflow = '';
    }
  };

  menuTrigger.addEventListener('click', () => {
    const isOpen = menuTrigger.getAttribute('aria-expanded') === 'true';
    toggleMobileNav(!isOpen);
  });

  // Close nav on link click
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => toggleMobileNav(false));
  });

  // Also close drawer if window is resized above tablet breakpoint
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && menuTrigger.getAttribute('aria-expanded') === 'true') {
      toggleMobileNav(false);
    }
  });


  /* ==========================================
     INTERSECTION OBSERVER FOR ANIMATED REVEAL
     ========================================== */
  const animatedSections = document.querySelectorAll('.fade-in-section');

  const sectionObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target); // Trigger only once
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px' // Trigger slightly before it fully rolls in
  });

  animatedSections.forEach(section => {
    sectionObserver.observe(section);
  });


  /* ==========================================
     NATIVE DIALOG MODAL CONTROLLER
     ========================================== */
  const bookingDialog = document.getElementById('booking-dialog');
  const openBookingBtns = document.querySelectorAll('.open-booking-btn');
  const closeDialogBtn = bookingDialog.querySelector('.close-dialog-btn');
  const bookingDateInput = document.getElementById('book-date');

  // Set minimum booking date to today
  if (bookingDateInput) {
    const today = new Date().toISOString().split('T')[0];
    bookingDateInput.min = today;
  }

  // Open modal
  openBookingBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // If mobile drawer was active, close it first
      toggleMobileNav(false);
      bookingDialog.showModal();
    });
  });

  // Close modal
  closeDialogBtn.addEventListener('click', () => {
    bookingDialog.close();
  });

  /* Modern Web Guidance Fallback: 
     Light Dismiss backdrop click for browsers that don't support closedby="any" */
  if (!('closedBy' in HTMLDialogElement.prototype)) {
    bookingDialog.addEventListener('click', (event) => {
      // 1. Check if the click target is the dialog tag itself (the backdrop is generated as part of dialog)
      if (event.target !== bookingDialog) return;

      // 2. Check if click falls within the content container's bounding rectangle
      const rect = bookingDialog.getBoundingClientRect();
      const isDialogContent = (
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width
      );

      // If click was on the actual dialog card content, ignore. If it was outside on backdrop, close.
      if (!isDialogContent) {
        bookingDialog.close();
      }
    });
  }


  /* ==========================================
     CARPET CLEANING COST CALCULATOR
     ========================================== */
  const calcAreaInput = document.getElementById('calc-area');
  const calcAreaValue = document.getElementById('calc-area-value');
  const calculatedPriceText = document.getElementById('calculated-price');
  
  // Hidden fields inside Form
  const formArea = document.getElementById('form-area');
  const formCarpetType = document.getElementById('form-carpet-type');
  const formOptions = document.getElementById('form-options');
  const formTotalPrice = document.getElementById('form-total-price');

  // Pricing constants (UZS per sq. meter)
  const basePrices = {
    standard: 15000,
    wool: 20000,
    shaggy: 22000,
    silk: 35000
  };

  // Type Selector click handlers
  const typeCards = document.querySelectorAll('.carpet-type-grid .type-card');
  typeCards.forEach(card => {
    card.addEventListener('click', (e) => {
      // Prevent double trigger if label triggers click twice (radio + wrapper)
      typeCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      
      const radio = card.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;
        formCarpetType.value = radio.value;
        calculateCost();
      }
    });
  });

  // Checkboxes
  const stainCheckbox = document.getElementById('opt-stain');
  const antiCheckbox = document.getElementById('opt-anti');
  const deodCheckbox = document.getElementById('opt-deod');

  // Perform Calculation
  const calculateCost = () => {
    const area = parseInt(calcAreaInput.value, 10);
    calcAreaValue.textContent = `${area} m²`;
    formArea.value = area;

    // Get selected type
    const selectedType = document.querySelector('input[name="carpet-type"]:checked').value;
    let pricePerMeter = basePrices[selectedType] || 15000;

    // Additional options sum
    let additionalPricePerMeter = 0;
    const activeOptions = [];

    if (stainCheckbox.checked) {
      additionalPricePerMeter += parseInt(stainCheckbox.value, 10);
      activeOptions.push("Dog'larni ketkazish");
    }
    if (antiCheckbox.checked) {
      additionalPricePerMeter += parseInt(antiCheckbox.value, 10);
      activeOptions.push("Antibakterial ishlov");
    }
    if (deodCheckbox.checked) {
      additionalPricePerMeter += parseInt(deodCheckbox.value, 10);
      activeOptions.push("Dezinfeksiya");
    }

    formOptions.value = activeOptions.join(', ');

    // Total Cost
    const total = area * (pricePerMeter + additionalPricePerMeter);
    formTotalPrice.value = total;

    // Format UZS
    calculatedPriceText.textContent = `${total.toLocaleString('uz-UZ')} UZS`;
  };

  // Event Listeners for calculator inputs
  calcAreaInput.addEventListener('input', calculateCost);
  stainCheckbox.addEventListener('change', calculateCost);
  antiCheckbox.addEventListener('change', calculateCost);
  deodCheckbox.addEventListener('change', calculateCost);

  // Run initial calculation
  calculateCost();


  /* ==========================================
     PHONE INPUT FORMATTER
     ========================================== */
  const phoneInputs = document.querySelectorAll('.phone-field');

  phoneInputs.forEach(input => {
    input.addEventListener('input', (e) => {
      // Clear non-digit chars
      let x = e.target.value.replace(/\D/g, '');
      
      // Keep only up to 9 digits (prefix is static +998)
      x = x.substring(0, 9);
      
      let formatted = '';
      if (x.length > 0) {
        formatted += '(' + x.substring(0, 2);
      }
      if (x.length > 2) {
        formatted += ') ' + x.substring(2, 5);
      }
      if (x.length > 5) {
        formatted += '-' + x.substring(5, 7);
      }
      if (x.length > 7) {
        formatted += '-' + x.substring(7, 9);
      }
      
      e.target.value = formatted;
    });
  });


  /* ==========================================
     TOAST NOTIFICATIONS
     ========================================== */
  const toastContainer = document.getElementById('toast-container');

  const showToast = (message) => {
    const toast = document.createElement('div');
    toast.className = 'toast';
    
    // Custom checkmark icon
    toast.innerHTML = `
      <svg class="toast-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span>${message}</span>
    `;

    toastContainer.appendChild(toast);

    // Fade-in
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      // Remove element after transition finishes
      toast.addEventListener('transitionend', () => {
        toast.remove();
      });
    }, 4000);
  };


  /* ==========================================
     FORM SUBMISSIONS
     ========================================== */
  const landingForm = document.getElementById('landing-contact-form');
  const bookingForm = document.getElementById('booking-form');

  // Handle contact form submit
  if (landingForm) {
    landingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('contact-name').value;
      const phone = document.getElementById('contact-phone').value;
      
      // Simulate API call success
      showToast(`Rahmat, ${name}! So'rovingiz qabul qilindi. Operator tez orada bog'lanadi.`);
      landingForm.reset();
    });
  }

  // Handle booking form submit
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('book-name').value;
      const priceFormatted = calculatedPriceText.textContent;
      
      // Simulate API call success
      showToast(`Buyurtma muvaffaqiyatli topshirildi! Taxminiy summa: ${priceFormatted}. Aloqada bo'ling.`);
      
      // Reset forms and close modal
      bookingForm.reset();
      bookingDialog.close();
      
      // Reset calculator state
      calcAreaInput.value = 25;
      stainCheckbox.checked = false;
      antiCheckbox.checked = false;
      deodCheckbox.checked = false;
      
      // Reset type active card
      typeCards.forEach(c => c.classList.remove('active'));
      const defaultCard = document.querySelector('.type-card input[value="standard"]').closest('.type-card');
      defaultCard.classList.add('active');
      document.querySelector('.type-card input[value="standard"]').checked = true;
      formCarpetType.value = 'standard';
      
      calculateCost();
    });
  }

});
