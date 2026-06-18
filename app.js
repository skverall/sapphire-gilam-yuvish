document.addEventListener("DOMContentLoaded", () => {
  const menuTrigger = document.getElementById("menu-trigger");
  const mobileNav = document.getElementById("mobile-nav");
  const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");
  const bookingDialog = document.getElementById("booking-dialog");
  const openBookingBtns = document.querySelectorAll(".open-booking-btn");
  const closeDialogBtn = document.querySelector(".close-dialog-btn");
  const bookingDateInput = document.getElementById("book-date");
  const toastContainer = document.getElementById("toast-container");

  const setMobileNav = (open) => {
    if (!menuTrigger || !mobileNav) return;
    menuTrigger.setAttribute("aria-expanded", String(open));
    mobileNav.setAttribute("aria-hidden", String(!open));
    mobileNav.classList.toggle("is-active", open);
    document.body.classList.toggle("nav-open", open);
  };

  menuTrigger?.addEventListener("click", () => {
    const isOpen = menuTrigger.getAttribute("aria-expanded") === "true";
    setMobileNav(!isOpen);
  });

  mobileNavLinks.forEach((link) => {
    link.addEventListener("click", () => setMobileNav(false));
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) setMobileNav(false);
  });

  if (bookingDateInput) {
    bookingDateInput.min = new Date().toISOString().split("T")[0];
  }

  openBookingBtns.forEach((button) => {
    button.addEventListener("click", () => {
      setMobileNav(false);
      if (bookingDialog?.showModal) {
        bookingDialog.showModal();
      }
    });
  });

  closeDialogBtn?.addEventListener("click", () => {
    bookingDialog?.close();
  });

  bookingDialog?.addEventListener("click", (event) => {
    if (event.target === bookingDialog) bookingDialog.close();
  });

  // Sticky header shadow on scroll
  const siteHeader = document.getElementById("site-header");
  const updateHeader = () => {
    if (!siteHeader) return;
    siteHeader.classList.toggle("scrolled", window.scrollY > 12);
  };
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  // Scroll-reveal animations
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            // small stagger for grouped siblings
            const delay = el.dataset.delay ? `${el.dataset.delay}ms` : null;
            if (delay) el.style.transitionDelay = delay;
            el.classList.add("is-visible");
            revealObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  // Animated counters (count-up when scrolled into view)
  const counters = document.querySelectorAll(".counter");
  const runCounter = (el) => {
    const target = parseFloat(el.dataset.target) || 0;
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const suffix = el.dataset.suffix || "";
    const duration = 1600;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = value.toLocaleString("uz-UZ", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if ("IntersectionObserver" in window && counters.length) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((c) => counterObserver.observe(c));
  } else {
    counters.forEach((c) => {
      const target = parseFloat(c.dataset.target) || 0;
      const decimals = parseInt(c.dataset.decimals || "0", 10);
      c.textContent = target.toLocaleString("uz-UZ", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }) + (c.dataset.suffix || "");
    });
  }

  // Parallax glow following cursor in hero
  const heroGlow = document.querySelector(".hero-glow");
  const heroSection = document.querySelector(".hero-section");
  if (heroGlow && heroSection && window.matchMedia("(pointer:fine)").matches) {
    heroSection.addEventListener("mousemove", (e) => {
      const rect = heroSection.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      heroGlow.style.transform = `translate(${x * 40}px, ${y * 40}px)`;
    });
  }

  const calcAreaInput = document.getElementById("calc-area");
  const calcAreaValue = document.getElementById("calc-area-value");
  const calculatedPriceText = document.getElementById("calculated-price");
  const formArea = document.getElementById("form-area");
  const formCarpetType = document.getElementById("form-carpet-type");
  const formOptions = document.getElementById("form-options");
  const formTotalPrice = document.getElementById("form-total-price");
  const stainCheckbox = document.getElementById("opt-stain");
  const antiCheckbox = document.getElementById("opt-anti");
  const deodCheckbox = document.getElementById("opt-deod");
  const typeCards = document.querySelectorAll(".carpet-type-grid .type-card");

  const basePrices = {
    standard: 15000,
    wool: 20000,
    shaggy: 22000,
    silk: 35000
  };

  const calculateCost = () => {
    if (!calcAreaInput || !calcAreaValue || !calculatedPriceText) return;

    const area = Number.parseInt(calcAreaInput.value, 10) || 25;
    const selectedType = document.querySelector('input[name="carpet-type"]:checked')?.value || "standard";
    const activeOptions = [];
    let additionalPricePerMeter = 0;

    if (stainCheckbox?.checked) {
      additionalPricePerMeter += Number.parseInt(stainCheckbox.value, 10);
      activeOptions.push("Dog'larni ketkazish");
    }

    if (antiCheckbox?.checked) {
      additionalPricePerMeter += Number.parseInt(antiCheckbox.value, 10);
      activeOptions.push("Antibakterial ishlov");
    }

    if (deodCheckbox?.checked) {
      additionalPricePerMeter += Number.parseInt(deodCheckbox.value, 10);
      activeOptions.push("Dezinfeksiya");
    }

    const total = area * ((basePrices[selectedType] || basePrices.standard) + additionalPricePerMeter);

    calcAreaValue.textContent = `${area} m²`;
    calculatedPriceText.textContent = `${total.toLocaleString("uz-UZ")} UZS`;
    if (formArea) formArea.value = String(area);
    if (formCarpetType) formCarpetType.value = selectedType;
    if (formOptions) formOptions.value = activeOptions.join(", ");
    if (formTotalPrice) formTotalPrice.value = String(total);

    // Update slider progress fill
    if (calcAreaInput) {
      const min = Number(calcAreaInput.min) || 0;
      const max = Number(calcAreaInput.max) || 100;
      const progress = ((area - min) / (max - min)) * 100;
      calcAreaInput.style.setProperty("--slider-progress", `${progress}%`);
    }
  };

  typeCards.forEach((card) => {
    card.addEventListener("click", () => {
      typeCards.forEach((item) => item.classList.remove("active"));
      card.classList.add("active");
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
      calculateCost();
    });
  });

  [calcAreaInput, stainCheckbox, antiCheckbox, deodCheckbox].forEach((control) => {
    control?.addEventListener("input", calculateCost);
    control?.addEventListener("change", calculateCost);
  });

  calculateCost();

  document.querySelectorAll(".phone-field").forEach((input) => {
    input.addEventListener("input", (event) => {
      let value = event.target.value.replace(/\D/g, "").substring(0, 9);
      let formatted = "";

      if (value.length > 0) formatted += `(${value.substring(0, 2)}`;
      if (value.length > 2) formatted += `) ${value.substring(2, 5)}`;
      if (value.length > 5) formatted += `-${value.substring(5, 7)}`;
      if (value.length > 7) formatted += `-${value.substring(7, 9)}`;

      event.target.value = formatted;
    });
  });

  const showToast = (message) => {
    if (!toastContainer) return;

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m20 6-11 11-5-5"></path>
      </svg>
      <span>${message}</span>
    `;

    toastContainer.appendChild(toast);
    window.setTimeout(() => toast.classList.add("show"), 10);
    window.setTimeout(() => {
      toast.classList.remove("show");
      toast.addEventListener("transitionend", () => toast.remove(), { once: true });
    }, 4200);
  };

  const bookingForm = document.getElementById("booking-form");
  bookingForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const priceFormatted = calculatedPriceText?.textContent || "";
    showToast(`Buyurtma qabul qilindi. Taxminiy summa: ${priceFormatted}. Operator tez orada bog'lanadi.`);
    bookingForm.reset();
    bookingDialog?.close();

    if (calcAreaInput) calcAreaInput.value = "25";
    if (stainCheckbox) stainCheckbox.checked = false;
    if (antiCheckbox) antiCheckbox.checked = false;
    if (deodCheckbox) deodCheckbox.checked = false;

    typeCards.forEach((card) => card.classList.remove("active"));
    const defaultCard = document.querySelector('.type-card input[value="standard"]')?.closest(".type-card");
    defaultCard?.classList.add("active");
    const defaultRadio = document.querySelector('.type-card input[value="standard"]');
    if (defaultRadio) defaultRadio.checked = true;

    calculateCost();
  });
});
