document.addEventListener('DOMContentLoaded', () => {
    const currentYearSpan = document.getElementById('current-year');
    const navLinks = document.querySelectorAll('header nav ul li a');
    const sections = document.querySelectorAll('main .page-section, main .hero'); // Include hero for accurate nav
    const header = document.querySelector('header');
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    // Set current year in footer
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- Smooth Scrolling for Nav Links & CTAs ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                let headerOffset = header.offsetHeight;
                // Add more offset if the target is the first section after hero, to avoid being too close
                if (targetId === '#about' || targetId === '#featured-projects') {
                    headerOffset += 20; 
                } else {
                    headerOffset += 10;
                }
                
                const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- Active Nav Link Highlighting on Scroll (Scroll Spy) ---
    function highlightNavOnScroll() {
        let currentSectionId = '';
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        const bodyHeight = document.body.offsetHeight;
        
        // Determine header offset more dynamically for scroll spy accuracy
        const headerHeight = header.offsetHeight + 30; // A bit more generous offset

        sections.forEach(section => {
            const sectionTop = section.offsetTop - headerHeight;
            const sectionBottom = sectionTop + section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                currentSectionId = section.getAttribute('id');
            }
        });
        
        // If scrolled to the very bottom, make sure 'contact' is active
        if (scrollPosition + windowHeight >= bodyHeight - 50) { // 50px tolerance
             const contactSection = document.getElementById('contact');
             if(contactSection) currentSectionId = 'contact';
        }
        // If at the very top, make 'home' active
        else if (scrollPosition < headerHeight) { // Check if scroll position is less than the first section's top
            currentSectionId = 'home';
        }


        navLinks.forEach(link => {
            link.classList.remove('active');
            const linkHref = link.getAttribute('href');
            if (linkHref === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', highlightNavOnScroll);
    window.addEventListener('load', highlightNavOnScroll);

    // --- Contact Form Submission ---
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(contactForm);
            const object = {};
            formData.forEach((value, key) => {
                object[key] = value;
            });
            const json = JSON.stringify(object);
            
            if (formStatus) formStatus.innerHTML = "Sending...";
            formStatus.className = '';


            // IMPORTANT: Replace 'YOUR_WEB3FORMS_ACCESS_KEY_HERE' in your HTML action
            // with your actual Web3Forms access key from https://web3forms.com/
            // For example: action="https://api.web3forms.com/submit" method="POST"
            // Then, in the form, add: <input type="hidden" name="access_key" value="YOUR_KEY">
            
            // The default form action will handle the submission if configured correctly.
            // This fetch is an alternative if you want more control or to use a different backend.
            // If using the form's `action` attribute with Web3Forms, this fetch part can be simplified
            // or just used for showing success/error messages based on their redirect parameters.

            fetch('https://api.web3forms.com/submit', { // This URL is standard for Web3Forms
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: json
            })
            .then(async (response) => {
                let jsonResponse = await response.json();
                if (response.status == 200 && jsonResponse.success) {
                    if (formStatus) {
                        formStatus.innerHTML = jsonResponse.message || "Form submitted successfully!";
                        formStatus.classList.add('success');
                    }
                    contactForm.reset();
                } else {
                    if (formStatus) {
                        formStatus.innerHTML = jsonResponse.message || "Something went wrong!";
                        formStatus.classList.add('error');
                    }
                }
            })
            .catch(error => {
                console.error('Error submitting form:', error);
                if (formStatus) {
                    formStatus.innerHTML = "An error occurred. Please try again.";
                    formStatus.classList.add('error');
                }
            })
            .finally(() => {
                setTimeout(() => {
                    if (formStatus) formStatus.innerHTML = '';
                }, 5000); // Clear status message after 5 seconds
            });
        });
    }
});