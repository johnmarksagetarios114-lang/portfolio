document.addEventListener('DOMContentLoaded', () => {
    // Dynamically calculate fixed header height for scroll-margin-top
    const header = document.querySelector('header');

    function updateHeaderHeight() {
        if (header) {
            const height = header.offsetHeight;
            document.documentElement.style.setProperty('--header-height', `${height}px`);
        }
    }
    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);

    // Active navigation links scroll logic
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    function changeActiveLink() {
        let index = sections.length;
        const headerHeight = header ? header.offsetHeight : 72;

        // Loop backwards to find the current visible section
        while (--index && window.scrollY + headerHeight + 10 < sections[index].offsetTop) { }

        navLinks.forEach((link) => link.classList.remove('active'));
        if (index >= 0 && index < navLinks.length) {
            navLinks[index].classList.add('active');
        }
    }

    changeActiveLink();
    window.addEventListener('scroll', changeActiveLink);

    // Scroll Reveal Animation Logic
    const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Run animation only once
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    reveals.forEach(reveal => {
        revealObserver.observe(reveal);
    });

    // Contact Form submission logic
    const contactForm = document.getElementById('portfolio-contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Basic validation for the placeholder access key
            const accessKey = contactForm.querySelector('input[name="access_key"]').value;
            if (accessKey === 'YOUR_ACCESS_KEY_HERE') {
                Swal.fire({
                    title: 'Error!',
                    text: 'Please configure your Web3Forms access key first.',
                    icon: 'error',
                    confirmButtonColor: '#374151'
                });
                return;
            }

            // Confirm submission with SweetAlert
            Swal.fire({
                title: 'Send Message?',
                text: 'Do you want to send this message?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#374151',
                cancelButtonColor: '#ef4444',
                confirmButtonText: 'Yes, send it!',
                cancelButtonText: 'No, cancel'
            }).then((result) => {
                if (result.isConfirmed) {
                    sendMessage();
                }
            });

            function sendMessage() {
                // Show sending loading modal
                Swal.fire({
                    title: 'Sending...',
                    text: 'Please wait while your message is being sent.',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                const submitBtn = contactForm.querySelector('.contact-form-btn');
                submitBtn.disabled = true;
                submitBtn.textContent = 'Sending...';

                const formData = new FormData(contactForm);
                const object = Object.fromEntries(formData);
                const json = JSON.stringify(object);

                fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: json
                })
                    .then(async (response) => {
                        let resJson = await response.json();
                        if (response.status === 200) {
                            // Show success alert
                            Swal.fire({
                                title: 'Sent!',
                                text: 'Your message has been sent successfully.',
                                icon: 'success',
                                confirmButtonColor: '#374151'
                            });

                            contactForm.reset();
                        } else {
                            // Show error alert
                            Swal.fire({
                                title: 'Failed!',
                                text: resJson.message || 'Something went wrong. Please try again.',
                                icon: 'error',
                                confirmButtonColor: '#374151'
                            });
                        }
                    })
                    .catch((error) => {
                        console.error(error);
                        // Show error alert
                        Swal.fire({
                            title: 'Error!',
                            text: 'Failed to connect to the server. Please try again later.',
                            icon: 'error',
                            confirmButtonColor: '#374151'
                        });
                    })
                    .finally(() => {
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Send Message';
                    });
            }
        });
    }

    // Projects Slider Logic
    const wrapper = document.querySelector('.projects-wrapper');
    const cards = document.querySelectorAll('.project-card');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    if (wrapper && cards.length > 0 && prevBtn && nextBtn) {
        let currentIndex = 0;

        function getVisibleCardsCount() {
            const sliderWindow = document.querySelector('.projects-window');
            if (!sliderWindow) return 1;
            const windowWidth = sliderWindow.clientWidth;
            const cardWidth = cards[0].offsetWidth;

            // Query dynamic gap from computed CSS styles
            const style = window.getComputedStyle(wrapper);
            const gap = parseFloat(style.columnGap || style.gap) || 40;

            if (windowWidth >= (cardWidth * 2 + gap - 10)) {
                return 2;
            }
            return 1;
        }

        function updateSlider() {
            const cardWidth = cards[0].offsetWidth;
            const style = window.getComputedStyle(wrapper);
            const gap = parseFloat(style.columnGap || style.gap) || 40;
            const visibleCards = getVisibleCardsCount();

            const maxIndex = Math.max(0, cards.length - visibleCards);

            if (currentIndex > maxIndex) {
                currentIndex = maxIndex;
            }
            if (currentIndex < 0) {
                currentIndex = 0;
            }

            const translateValue = -currentIndex * (cardWidth + gap);
            wrapper.style.transform = `translateX(${translateValue}px)`;

            prevBtn.disabled = currentIndex === 0;
            nextBtn.disabled = currentIndex === maxIndex;
        }

        prevBtn.addEventListener('click', () => {
            currentIndex--;
            updateSlider();
        });

        nextBtn.addEventListener('click', () => {
            currentIndex++;
            updateSlider();
        });

        // Initialize and handle window resize
        updateSlider();
        window.addEventListener('resize', updateSlider);
    }
});
