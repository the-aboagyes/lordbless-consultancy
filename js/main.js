/* ============================================================
   LORDBLESS CONSULTANCY
   MAIN JAVASCRIPT
   Universal Intelligent Enquiry System
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    /* =========================================================
       MOBILE NAVIGATION
       ========================================================= */

    const mobileMenuButton = document.querySelector(
        ".mobile-menu-button"
    );

    const mainNavigation = document.querySelector(
        ".main-navigation"
    );

    if (mobileMenuButton && mainNavigation) {

        mobileMenuButton.addEventListener("click", () => {

            const isOpen =
                mobileMenuButton.getAttribute("aria-expanded") === "true";

            mobileMenuButton.setAttribute(
                "aria-expanded",
                String(!isOpen)
            );

            mainNavigation.classList.toggle(
                "is-open",
                !isOpen
            );

        });


        /* Close mobile menu after selecting a navigation link */

        mainNavigation
            .querySelectorAll("a")
            .forEach(link => {

                link.addEventListener("click", () => {

                    mobileMenuButton.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                    mainNavigation.classList.remove(
                        "is-open"
                    );

                });

            });

    }



    /* =========================================================
       INTELLIGENT ENQUIRY SYSTEM
       ========================================================= */

    const enquiryForm = document.querySelector(
        "#lordbless-enquiry-form"
    );

    if (!enquiryForm) {
        return;
    }


    const serviceCheckboxes = enquiryForm.querySelectorAll(
        'input[name="services"]'
    );


    const servicePanels = enquiryForm.querySelectorAll(
        "[data-service-panel]"
    );


    /* =========================================================
       SERVICE PANEL CONTROL
       ========================================================= */

    function updateServicePanels() {

        const selectedServices = Array.from(
            serviceCheckboxes
        )
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);


        /*
         * If "Not Sure Yet" is selected,
         * hide all other service-specific panels.
         */

        if (selectedServices.includes("unsure")) {

            servicePanels.forEach(panel => {

                panel.hidden =
                    panel.dataset.servicePanel !== "unsure";

            });

            return;
        }


        /*
         * Otherwise display the panels corresponding
         * to the selected services.
         */

        servicePanels.forEach(panel => {

            const service =
                panel.dataset.servicePanel;

            panel.hidden =
                !selectedServices.includes(service);

        });

    }



    /* =========================================================
       SERVICE SELECTION EVENTS
       ========================================================= */

    serviceCheckboxes.forEach(checkbox => {

        checkbox.addEventListener(
            "change",
            () => {

                /*
                 * "Not Sure Yet" is mutually exclusive
                 * with the specific service options.
                 */

                if (
                    checkbox.value === "unsure" &&
                    checkbox.checked
                ) {

                    serviceCheckboxes.forEach(otherCheckbox => {

                        if (
                            otherCheckbox !== checkbox
                        ) {

                            otherCheckbox.checked = false;

                        }

                    });

                }


                /*
                 * If a specific service is selected,
                 * automatically remove "Not Sure Yet".
                 */

                if (
                    checkbox.value !== "unsure" &&
                    checkbox.checked
                ) {

                    const unsureCheckbox =
                        enquiryForm.querySelector(
                            'input[name="services"][value="unsure"]'
                        );

                    if (unsureCheckbox) {
                        unsureCheckbox.checked = false;
                    }

                }


                updateServicePanels();

            }
        );

    });

/* =========================================================
   ENHANCED SERVICE EXPERIENCE
   PHASE 2C
   ========================================================= */

const enhancedServiceLinks =
    document.querySelectorAll(
        "[data-enhanced-service]"
    );

const enhancedServicePanels =
    document.querySelectorAll(
        "[data-service-experience]"
    );


/*
 * Display one enhanced service panel
 * and hide all other service panels.
 */

function showEnhancedService(service) {

    if (!service) {
        return;
    }


    let targetPanel = null;


    enhancedServicePanels.forEach(panel => {

        const panelService =
            panel.dataset.serviceExperience;


        const isTarget =
            panelService === service;


        if (isTarget) {

            targetPanel = panel;

            panel.hidden = false;

            requestAnimationFrame(() => {

                panel.classList.add(
                    "is-active"
                );

            });

        } else {

            panel.classList.remove(
                "is-active"
            );

            panel.hidden = true;

        }

    });


    /*
     * Stop if no matching service panel exists.
     */

    if (!targetPanel) {
        return;
    }


    /*
     * Update the URL hash without
     * causing a browser page reload.
     */

    if (
        window.history &&
        window.history.replaceState
    ) {

        window.history.replaceState(
            null,
            "",
            "#service-experience"
        );

    }


    /*
     * Give the browser a moment to render
     * the panel before scrolling to it.
     */

    requestAnimationFrame(() => {

        targetPanel.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    });

}


/*
 * Homepage service-card interactions.
 */

enhancedServiceLinks.forEach(link => {

    link.addEventListener(
        "click",
        event => {

            event.preventDefault();


            const service =
                link.dataset.enhancedService;


            showEnhancedService(
                service
            );

        }
    );

});

    /* =========================================================
       SERVICE CARD → ENQUIRY FORM
       ========================================================= */

    const serviceLinks = document.querySelectorAll(
        "[data-service-select]"
    );


    serviceLinks.forEach(link => {

        link.addEventListener("click", () => {

            const service =
                link.dataset.serviceSelect;


            const checkbox =
                enquiryForm.querySelector(
                    `input[name="services"][value="${service}"]`
                );


            if (!checkbox) {
                return;
            }


            /*
             * Clear "Not Sure Yet".
             */

            const unsureCheckbox =
                enquiryForm.querySelector(
                    'input[name="services"][value="unsure"]'
                );

            if (unsureCheckbox) {
                unsureCheckbox.checked = false;
            }


            /*
             * Select requested service.
             */

            checkbox.checked = true;


            updateServicePanels();

        });

    });



    /* =========================================================
       INITIAL FORM STATE
       ========================================================= */

    updateServicePanels();



    /* =========================================================
       FORM VALIDATION HELPERS
       ========================================================= */

    function showFieldError(
        field,
        message
    ) {

        clearFieldError(field);


        field.classList.add(
            "field-error"
        );


        const errorMessage =
            document.createElement("small");


        errorMessage.className =
            "form-error-message";


        errorMessage.textContent =
            message;


        field.parentElement.appendChild(
            errorMessage
        );

    }



    function clearFieldError(field) {

        field.classList.remove(
            "field-error"
        );


        const existingError =
            field.parentElement.querySelector(
                ".form-error-message"
            );


        if (existingError) {
            existingError.remove();
        }

    }



    /* =========================================================
       CLEAR ERRORS WHEN USER CORRECTS A FIELD
       ========================================================= */

    enquiryForm
        .querySelectorAll(
            "input, select, textarea"
        )
        .forEach(field => {

            field.addEventListener(
                "input",
                () => clearFieldError(field)
            );


            field.addEventListener(
                "change",
                () => clearFieldError(field)
            );

        });



    /* =========================================================
       EMAIL VALIDATION
       ========================================================= */

    function isValidEmail(email) {

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            email
        );

    }



    /* =========================================================
       SERVICE SELECTION VALIDATION
       ========================================================= */

    function validateServices() {

        const selectedServices =
            Array.from(
                serviceCheckboxes
            )
            .filter(
                checkbox => checkbox.checked
            );


        if (selectedServices.length === 0) {

            const serviceSelection =
                enquiryForm.querySelector(
                    ".service-selection"
                );


            if (serviceSelection) {

                serviceSelection.classList.add(
                    "selection-error"
                );

            }


            return false;
        }


        const serviceSelection =
            enquiryForm.querySelector(
                ".service-selection"
            );


        if (serviceSelection) {

            serviceSelection.classList.remove(
                "selection-error"
            );

        }


        return true;

    }



    /* =========================================================
       CONSENT VALIDATION
       ========================================================= */

    function validateConsent() {

        const consent =
            document.querySelector(
                "#enquiry-consent"
            );


        if (!consent) {
            return true;
        }


        if (!consent.checked) {

            consent.classList.add(
                "field-error"
            );


            return false;

        }


        consent.classList.remove(
            "field-error"
        );


        return true;

    }



    /* =========================================================
       BASIC FORM VALIDATION
       ========================================================= */

    function validateBasicFields() {

        let isValid = true;


        const requiredFields =
            enquiryForm.querySelectorAll(
                "[required]"
            );


        requiredFields.forEach(field => {

            /*
             * Ignore required fields inside hidden
             * service panels.
             */

            const parentPanel =
                field.closest(
                    "[data-service-panel]"
                );


            if (
                parentPanel &&
                parentPanel.hidden
            ) {

                return;

            }


            clearFieldError(field);


            if (
                field.type === "checkbox" &&
                !field.checked
            ) {

                isValid = false;

                return;

            }


            if (
                field.value.trim() === ""
            ) {

                showFieldError(
                    field,
                    "Please complete this field."
                );


                isValid = false;

                return;

            }


            if (
                field.type === "email" &&
                !isValidEmail(field.value.trim())
            ) {

                showFieldError(
                    field,
                    "Please enter a valid email address."
                );


                isValid = false;

            }

        });


        return isValid;

    }



    /* =========================================================
       FORM SUBMISSION
       ========================================================= */

    enquiryForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const basicFieldsValid =
                validateBasicFields();


            const servicesValid =
                validateServices();


            const consentValid =
                validateConsent();


            if (
                !basicFieldsValid ||
                !servicesValid ||
                !consentValid
            ) {

                /*
                 * Move the user to the first visible
                 * validation problem.
                 */

                const firstError =
                    enquiryForm.querySelector(
                        ".field-error, .selection-error"
                    );


                if (firstError) {

                    firstError.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });

                }


                return;

            }


            /*
             * At this stage the form is valid.
             *
             * Backend submission will be connected later.
             *
             * For now we generate a structured enquiry
             * object so the frontend architecture is ready.
             */

            const formData =
                new FormData(
                    enquiryForm
                );


            const enquiryData =
                buildEnquiryData(
                    formData
                );


            /*
             * Temporary development behaviour.
             *
             * We do NOT send the information anywhere yet.
             */

            console.log(
                "LORDBLESS ENQUIRY:",
                enquiryData
            );


            showSubmissionMessage(
                enquiryData
            );

        }
    );



    /* =========================================================
       BUILD STRUCTURED ENQUIRY DATA
       ========================================================= */

    function buildEnquiryData(formData) {

        const selectedServices =
            formData.getAll(
                "services"
            );


        return {

            submittedAt:
                new Date().toISOString(),


            client: {

                fullName:
                    formData.get("full_name") || "",

                whatsapp:
                    formData.get("whatsapp") || "",

                email:
                    formData.get("email") || "",

                currentCountry:
                    formData.get("current_country") || "",

                nationality:
                    formData.get("nationality") || ""

            },


            services:
                selectedServices,


            education: {

                destination:
                    formData.get("education_destination") || "",

                studyArea:
                    formData.get("study_area") || "",

                studyLevel:
                    formData.get("study_level") || "",

                firstProgramme:
                    formData.get("first_programme") || "",

                secondProgramme:
                    formData.get("second_programme") || "",

                timeframe:
                    formData.get("education_timeframe") || ""

            },


            careers: {

                profession:
                    formData.get("profession") || "",

                qualification:
                    formData.get(
                        "professional_qualification"
                    ) || "",

                experience:
                    formData.get(
                        "work_experience"
                    ) || "",

                destination:
                    formData.get(
                        "career_destination"
                    ) || "",

                interest:
                    formData.get(
                        "career_interest"
                    ) || ""

            },


            travel: {

                purpose:
                    formData.get(
                        "travel_purpose"
                    ) || "",

                destination:
                    formData.get(
                        "travel_destination"
                    ) || "",

                travelPeriod:
                    formData.get(
                        "travel_period"
                    ) || "",

                travellers:
                    formData.get(
                        "travellers"
                    ) || "",

                services:
                    formData.getAll(
                        "travel_services"
                    )

            },


            business: {

                businessType:
                    formData.get(
                        "business_type"
                    ) || "",

                services:
                    formData.getAll(
                        "business_services"
                    ),

                productCategory:
                    formData.get(
                        "product_category"
                    ) || "",

                estimatedQuantity:
                    formData.get(
                        "estimated_quantity"
                    ) || "",

                source:
                    formData.get(
                        "business_source"
                    ) || ""

            },


            mobility: {

                destination:
                    formData.get(
                        "mobility_destination"
                    ) || "",

                purpose:
                    formData.get(
                        "mobility_purpose"
                    ) || "",

                arrivalDate:
                    formData.get(
                        "arrival_date"
                    ) || "",

                services:
                    formData.getAll(
                        "mobility_services"
                    )

            },


            general: {

                unsureRequest:
                    formData.get(
                        "unsure_request"
                    ) || "",

                additionalInformation:
                    formData.get(
                        "additional_information"
                    ) || "",

                preferredContact:
                    formData.get(
                        "preferred_contact"
                    ) || ""

            }

        };

    }



    /* =========================================================
       SUBMISSION CONFIRMATION
       ========================================================= */

    function showSubmissionMessage(
        enquiryData
    ) {

        const formContainer =
            enquiryForm.parentElement;


        /*
         * Get the client's first name.
         */

        const fullName =
            enquiryData.client.fullName
                .trim();


        const firstName =
            fullName
                ? fullName.split(/\s+/)[0]
                : "there";


        /*
         * Determine the selected services.
         */

        const serviceLabels = {

            education:
                "GLOBAL EDUCATION",

            careers:
                "GLOBAL CAREERS",

            travel:
                "TRAVEL",

            business:
                "BUSINESS & SOURCING",

            mobility:
                "GLOBAL MOBILITY",

            unsure:
                "GENERAL ENQUIRY"

        };


        const selectedLabels =
            enquiryData.services
                .map(
                    service =>
                        serviceLabels[service] ||
                        service
                );


        const confirmation =
            document.createElement(
                "div"
            );


        confirmation.className =
            "enquiry-success";


        confirmation.setAttribute(
            "role",
            "status"
        );


        confirmation.innerHTML = `

            <p class="eyebrow">
                JOURNEY STARTED
            </p>

            <h2>
                Thank You, ${escapeHtml(firstName)}.
            </h2>

            <p>
                Your enquiry has been prepared
                for the LORDBLESS CONSULTANCY team.
            </p>

            <div class="enquiry-success-services">

                <strong>
                    Your selected pathway
                </strong>

                <p>
                    ${escapeHtml(
                        selectedLabels.join(", ")
                    )}
                </p>

            </div>

            <div class="enquiry-next-steps">

                <h3>
                    What happens next?
                </h3>

                <ol>

                    <li>
                        We review your enquiry.
                    </li>

                    <li>
                        We identify the appropriate
                        service pathway.
                    </li>

                    <li>
                        A LORDBLESS consultant contacts
                        you regarding the next step.
                    </li>

                </ol>

            </div>

            <div class="enquiry-success-actions">

                <a
                    href="https://wa.me/4915754780010"
                    class="button button-primary"
                    target="_blank"
                    rel="noopener"
                >
                    Chat With Us on WhatsApp
                </a>

                <button
                    type="button"
                    class="button button-secondary"
                    data-reset-enquiry
                >
                    Start Another Enquiry
                </button>

            </div>

        `;


        enquiryForm.hidden = true;


        formContainer.appendChild(
            confirmation
        );


        confirmation
            .querySelector(
                "[data-reset-enquiry]"
            )
            .addEventListener(
                "click",
                () => {

                    confirmation.remove();

                    enquiryForm.reset();

                    enquiryForm.hidden = false;

                    updateServicePanels();

                    enquiryForm
                        .scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });

                }
            );


        confirmation.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }



    /* =========================================================
       HTML ESCAPE
       ========================================================= */

    function escapeHtml(value) {

        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");

    }



    /* =========================================================
       AUTO-SCROLL TO SERVICE QUESTIONS
       ========================================================= */

    serviceCheckboxes.forEach(checkbox => {

        checkbox.addEventListener(
            "change",
            () => {

                /*
                 * Give the browser a moment to update
                 * the hidden panels before scrolling.
                 */

                window.setTimeout(
                    () => {

                        const selected =
                            Array.from(
                                serviceCheckboxes
                            )
                            .filter(
                                item =>
                                    item.checked
                            );


                        if (
                            selected.length !== 1
                        ) {

                            return;

                        }


                        const selectedService =
                            selected[0].value;


                        const panel =
                            enquiryForm.querySelector(
                                `[data-service-panel="${selectedService}"]`
                            );


                        if (
                            panel &&
                            !panel.hidden
                        ) {

                            panel.scrollIntoView({
                                behavior: "smooth",
                                block: "nearest"
                            });

                        }

                    },
                    100
                );

            }
        );

    });



    /* =========================================================
       ACCESSIBILITY
       ========================================================= */

    /*
     * Keep hidden service panels inaccessible to keyboard
     * navigation and assistive technology.
     */

    function updatePanelAccessibility() {

        servicePanels.forEach(panel => {

            const isHidden =
                panel.hidden;


            panel.setAttribute(
                "aria-hidden",
                String(isHidden)
            );


            panel.querySelectorAll(
                "input, select, textarea"
            ).forEach(field => {

                /*
                 * Do not disable fields automatically.
                 * The hidden state itself controls visibility.
                 */

                field.setAttribute(
                    "tabindex",
                    isHidden
                        ? "-1"
                        : "0"
                );

            });

        });

    }


    /*
     * Extend panel update to accessibility.
     */

    const originalUpdateServicePanels =
        updateServicePanels;


    function refreshServiceInterface() {

        originalUpdateServicePanels();

        updatePanelAccessibility();

    }


    serviceCheckboxes.forEach(checkbox => {

        checkbox.addEventListener(
            "change",
            refreshServiceInterface
        );

    });


    refreshServiceInterface();

});