// Check if we're in development mode
function isDevelopment() {
  return (
    window.location.protocol === "file:" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === ""
  );
}

// Safe analytics tracking function
function trackEvent(eventName, data = null) {
  if (isDevelopment()) {
    console.log(
      "🚫 Development mode - Analytics event blocked:",
      eventName,
      data
    );
    return;
  }

  if (typeof Lit !== "undefined") {
    if (data) {
      Lit.event(eventName, data);
    } else {
      Lit.event(eventName);
    }
  }
}

// FAQ Toggle Function
function toggleFaq(element, faqId) {
  const faqItem = element.parentElement;
  const answer = faqItem.querySelector(".faq-answer");
  const toggle = element.querySelector(".faq-toggle");

  if (answer.style.display === "none" || answer.style.display === "") {
    answer.style.display = "block";
    toggle.textContent = "−";
    faqItem.classList.add("active");
    // Track FAQ interaction
    trackEvent("faq_opened_" + faqId);
  } else {
    answer.style.display = "none";
    toggle.textContent = "+";
    faqItem.classList.remove("active");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // Initialize FAQs as collapsed
  const faqAnswers = document.querySelectorAll(".faq-answer");
  faqAnswers.forEach((answer) => {
    answer.style.display = "none";
  });

  // EU Countries list for multiselect
  const euCountries = [
    "Austria",
    "Belgium",
    "Bulgaria",
    "Croatia",
    "Cyprus",
    "Czech Republic",
    "Denmark",
    "Estonia",
    "Finland",
    "France",
    "Germany",
    "Greece",
    "Hungary",
    "Ireland",
    "Italy",
    "Latvia",
    "Lithuania",
    "Luxembourg",
    "Malta",
    "Netherlands",
    "Poland",
    "Portugal",
    "Romania",
    "Slovakia",
    "Slovenia",
    "Spain",
    "Sweden",
  ];

  // Modal elements
  const modal = document.getElementById("waitlistModal");
  const modalForm = document.getElementById("modalForm");
  const thankYouMessage = document.getElementById("thankYouMessage");
  const closeBtn = document.querySelector(".close");
  const form = document.getElementById("waitlistForm");

  // Multiselect elements
  const sellTodayDropdown = document.getElementById("sellTodayDropdown");
  const sellTodaySelected = document.getElementById("sellTodaySelected");
  const sellTodayOptions = document.getElementById("sellTodayOptions");
  const sellTodayHidden = document.getElementById("sellToday");

  let selectedCountries = [];
  let otherTextInput = null;

  // Initialize multiselect
  function initializeMultiselect() {
    // Populate options
    sellTodayOptions.innerHTML = "";

    euCountries.forEach((country) => {
      const option = document.createElement("div");
      option.className = "multiselect-option";
      option.innerHTML = `
                <input type="checkbox" id="country-${country}" value="${country}">
                <label for="country-${country}">${country}</label>
            `;
      sellTodayOptions.appendChild(option);
    });

    // Add "Other" option
    const otherOption = document.createElement("div");
    otherOption.className = "multiselect-option";
    otherOption.innerHTML = `
            <input type="checkbox" id="country-other" value="other">
            <label for="country-other">Other</label>
        `;
    sellTodayOptions.appendChild(otherOption);

    // Add event listeners to checkboxes
    sellTodayOptions.addEventListener("change", handleCountrySelection);
  }

  function handleCountrySelection(e) {
    if (e.target.type === "checkbox") {
      const value = e.target.value;
      const isChecked = e.target.checked;

      if (value === "other") {
        if (isChecked) {
          // Add text input for "Other"
          if (!otherTextInput) {
            otherTextInput = document.createElement("input");
            otherTextInput.type = "text";
            otherTextInput.placeholder = "Specify other countries...";
            otherTextInput.style.cssText = `
                            width: 100%;
                            padding: 8px 12px;
                            border: 1px solid #e5e7eb;
                            border-radius: 4px;
                            margin-top: 8px;
                            font-size: 14px;
                        `;
            e.target.closest(".multiselect-option").appendChild(otherTextInput);
          }
          if (!selectedCountries.includes("other")) {
            selectedCountries.push("other");
          }
        } else {
          // Remove text input and value
          if (otherTextInput) {
            otherTextInput.remove();
            otherTextInput = null;
          }
          selectedCountries = selectedCountries.filter((c) => c !== "other");
        }
      } else {
        if (isChecked) {
          selectedCountries.push(value);
        } else {
          selectedCountries = selectedCountries.filter((c) => c !== value);
        }
      }

      updateSelectedDisplay();
    }
  }

  function updateSelectedDisplay() {
    const selectedDiv = sellTodaySelected;
    selectedDiv.innerHTML = "";

    if (selectedCountries.length === 0) {
      selectedDiv.innerHTML =
        '<span class="multiselect-placeholder">Select countries...</span>';
    } else {
      selectedCountries.forEach((country) => {
        const tag = document.createElement("span");
        tag.className = "multiselect-tag";
        tag.innerHTML = `
                    ${country === "other" ? "Other" : country}
                    <span class="remove" data-country="${country}">×</span>
                `;
        selectedDiv.appendChild(tag);
      });
    }

    // Update hidden input
    let finalValue = selectedCountries.filter((c) => c !== "other");
    if (
      selectedCountries.includes("other") &&
      otherTextInput &&
      otherTextInput.value.trim()
    ) {
      finalValue.push(otherTextInput.value.trim());
    }
    sellTodayHidden.value = finalValue.join(", ");
  }

  // Handle tag removal
  sellTodaySelected.addEventListener("click", function (e) {
    if (e.target.classList.contains("remove")) {
      const country = e.target.dataset.country;
      selectedCountries = selectedCountries.filter((c) => c !== country);

      // Uncheck the corresponding checkbox
      const checkbox = document.getElementById(`country-${country}`);
      if (checkbox) {
        checkbox.checked = false;
      }

      if (country === "other" && otherTextInput) {
        otherTextInput.remove();
        otherTextInput = null;
      }

      updateSelectedDisplay();
    }
  });

  // Toggle dropdown
  sellTodayDropdown.addEventListener("click", function (e) {
    e.stopPropagation();
    const isOpen = sellTodayOptions.classList.contains("show");

    if (isOpen) {
      sellTodayOptions.classList.remove("show");
      sellTodayDropdown.classList.remove("open");
    } else {
      sellTodayOptions.classList.add("show");
      sellTodayDropdown.classList.add("open");
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", function () {
    sellTodayOptions.classList.remove("show");
    sellTodayDropdown.classList.remove("open");
  });

  // Prevent dropdown close when clicking inside options
  sellTodayOptions.addEventListener("click", function (e) {
    e.stopPropagation();
  });

  // Modal functionality
  function openModal() {
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
    modalForm.style.display = "block";
    thankYouMessage.style.display = "none";
  }

  function closeModal() {
    modal.classList.remove("show");
    document.body.style.overflow = "";
    form.reset();
    selectedCountries = [];
    updateSelectedDisplay();
    if (otherTextInput) {
      otherTextInput.remove();
      otherTextInput = null;
    }
    // Uncheck all checkboxes
    sellTodayOptions
      .querySelectorAll('input[type="checkbox"]')
      .forEach((cb) => {
        cb.checked = false;
      });
  }

  // Event listeners for modal
  document.querySelectorAll(".cta-button").forEach((button) => {
    button.addEventListener("click", function (e) {
      if (
        this.getAttribute("href") === "#" ||
        this.getAttribute("href") === "#waitlist"
      ) {
        e.preventDefault();
        openModal();
      }
    });
  });

  closeBtn.addEventListener("click", closeModal);

  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Form submission
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const submitButton = form.querySelector(".submit-button");
    const originalText = submitButton.textContent;

    // Disable button and show loading state
    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";

    try {
      // Collect form data
      const formData = new FormData(form);

      // Add the multiselect value (already includes other text from updateSelectedDisplay)
      formData.set("sellToday", sellTodayHidden.value);

      // Convert to JSON
      const data = {};
      for (let [key, value] of formData.entries()) {
        data[key] = value;
      }

      // Submit to Netlify function
      const NETLIFY_FUNCTION_URL =
        "https://fastidious-crisp-5ad56d.netlify.app/submit-waitlist";

      const response = await fetch(NETLIFY_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        // Show thank you message
        modalForm.style.display = "none";
        thankYouMessage.style.display = "block";

        // Auto-close modal after 5 seconds
        setTimeout(() => {
          closeModal();
        }, 5000);
      } else {
        throw new Error("Submission failed");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(
        "There was an error submitting your application. Please try again."
      );
    } finally {
      // Re-enable button
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  });

  // Initialize everything
  initializeMultiselect();

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href !== "#" && href !== "#waitlist") {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }
    });
  });

  // Add scroll effect to header
  const header = document.querySelector(".header");
  window.addEventListener("scroll", function () {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > 100) {
      header.style.boxShadow = "0 2px 20px rgba(0, 0, 0, 0.1)";
    } else {
      header.style.boxShadow = "none";
    }
  });

  // Add entrance animations on scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, observerOptions);

  // Observe sections for animations
  const sections = document.querySelectorAll(
    ".section, .step, .outcome, .faq-item"
  );
  sections.forEach((section) => {
    section.style.opacity = "0";
    section.style.transform = "translateY(20px)";
    section.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(section);
  });

  // Add hover effects to cards
  const cards = document.querySelectorAll(
    ".step, .outcome, .partner, .detail, .faq-item"
  );
  cards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-4px)";
      this.style.transition = "transform 0.3s ease";
    });

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0)";
    });
  });

  // Track scroll progress
  const progressBar = document.createElement("div");
  progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, #2563eb, #1d4ed8);
        z-index: 1000;
        transition: width 0.2s ease;
    `;
  document.body.appendChild(progressBar);

  window.addEventListener("scroll", function () {
    const scrolled =
      (window.scrollY /
        (document.documentElement.scrollHeight - window.innerHeight)) *
      100;
    progressBar.style.width = Math.min(scrolled, 100) + "%";
  });

  // Keyboard accessibility
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.classList.contains("show")) {
      closeModal();
    }
  });
});
