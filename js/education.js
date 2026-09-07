/**
 * =========================================================
 * LORDBLESS CONSULTANCY
 * GLOBAL EDUCATION PATHWAY
 * =========================================================
 *
 * Handles:
 * - Education pathway selection
 * - Phase 1 validation
 * - Phase 2 assessment display
 * - Selected pathway transfer
 * - Destination-specific assessment logic
 * - Form validation
 * - Document validation
 * - WhatsApp follow-up
 * - Future backend submission
 *
 * NOTE:
 * The submission endpoint is intentionally empty until
 * the final secure data-collection backend is selected.
 * =========================================================
 */


document.addEventListener("DOMContentLoaded", () => {


    /* =========================================================
       CONFIGURATION
       ========================================================= */

    const WHATSAPP_URL =
        "https://wa.me/4915754780010";


    /*
     * Add the final secure submission endpoint here later.
     *
     * Example:
     *
     * const SUBMISSION_ENDPOINT =
     *     "https://formspree.io/f/XXXXXXXX";
     *
     * Until a backend is selected, applicant files are NOT
     * transmitted or stored by this frontend.
     */

    const SUBMISSION_ENDPOINT = "";



    /* =========================================================
       PHASE 1 ELEMENTS
       ========================================================= */

    const educationPathway =
        document.getElementById(
            "education-pathway"
        );


    const educationTrigger =
        document.querySelector(
            ".education-trigger"
        );


    const destination =
        document.getElementById(
            "education-destination"
        );


    const studyArea =
        document.getElementById(
            "education-study-area"
        );


    const studyLevel =
        document.getElementById(
            "education-study-level"
        );


    const status =
        document.getElementById(
            "education-status"
        );


    const assessmentButton =
        document.getElementById(
            "education-assessment-button"
        );



    /* =========================================================
       PHASE 2 ELEMENTS
       ========================================================= */

    const assessmentPhase =
        document.getElementById(
            "education-assessment"
        );


    const selectedPathway =
        document.getElementById(
            "selected-pathway"
        );


    const changeSelection =
        document.getElementById(
            "change-education-selection"
        );


    const assessmentForm =
        document.getElementById(
            "education-assessment-form"
        );


    const submitButton =
        document.getElementById(
            "submit-education-assessment"
        );


    const formMessage =
        document.getElementById(
            "assessment-form-message"
        );



    /* =========================================================
       CONDITIONAL DESTINATION ASSESSMENT
       ========================================================= */

    const germanyAssessment =
        document.getElementById(
            "germany-assessment"
        );



    /* =========================================================
       REQUIRED ELEMENT CHECK
       ========================================================= */

    if (
        !educationPathway ||
        !educationTrigger ||
        !destination ||
        !studyArea ||
        !studyLevel ||
        !status ||
        !assessmentButton ||
        !assessmentPhase ||
        !selectedPathway ||
        !changeSelection ||
        !assessmentForm ||
        !submitButton ||
        !formMessage
    ) {

        console.error(
            "LORDBLESS Education: required elements are missing."
        );

        return;
    }



    /* =========================================================
       HELPERS
       ========================================================= */

    function isComplete() {

        return Boolean(
            destination.value.trim() &&
            studyArea.value.trim() &&
            studyLevel.value.trim()
        );

    }



    function getCurrentPathway() {

        return {

            destination:
                destination.value.trim(),

            studyArea:
                studyArea.value.trim(),

            studyLevel:
                studyLevel.value.trim()

        };

    }



    function scrollToElement(element) {

        window.setTimeout(() => {

            element.scrollIntoView({

                behavior: "smooth",

                block: "start"

            });

        }, 30);

    }



    function clearMessage() {

        formMessage.className =
            "assessment-form-message";

        formMessage.innerHTML =
            "";

    }



    function showMessage(
        type,
        message
    ) {

        formMessage.className =
            `assessment-form-message is-visible ${type}`;

        formMessage.innerHTML =
            message;

    }



    /* =========================================================
       OPEN EDUCATION PATHWAY
       ========================================================= */

    function openEducationPathway(event) {

        if (event) {
            event.preventDefault();
        }


        educationPathway.hidden =
            false;


        scrollToElement(
            educationPathway
        );

    }


    educationTrigger.addEventListener(
        "click",
        openEducationPathway
    );



    /*
     * Allow:
     * index.html#education-pathway
     */

    if (
        window.location.hash ===
        "#education-pathway"
    ) {

        educationPathway.hidden =
            false;

    }



    /* =========================================================
       PHASE 1 STATUS
       ========================================================= */

    function updateEducationStatus() {

        if (!isComplete()) {

            assessmentButton.disabled =
                true;


            assessmentButton.classList.remove(
                "is-ready"
            );


            status.textContent =
                "Select your destination, study area and study level to continue.";


            return;

        }


        assessmentButton.disabled =
            false;


        assessmentButton.classList.add(
            "is-ready"
        );


        const pathway =
            getCurrentPathway();


        status.textContent =
            `Pathway selected: ${pathway.destination} • ${pathway.studyArea} • ${pathway.studyLevel}. Continue to your LORDBLESS Education Assessment.`;

    }



    destination.addEventListener(
        "change",
        updateEducationStatus
    );


    studyArea.addEventListener(
        "change",
        updateEducationStatus
    );


    studyLevel.addEventListener(
        "change",
        updateEducationStatus
    );



    /* =========================================================
       DESTINATION-SPECIFIC QUESTIONS
       =========================================================
       
       At present, only Germany has additional questions.
       
       This structure allows us to add other destination rules
       later without rewriting the entire education system.
       ========================================================= */

    function updateConditionalQuestions() {

        const country =
            destination.value;


        const isGermany =
            country === "Germany";


        if (germanyAssessment) {

            germanyAssessment.classList.toggle(
                "is-visible",
                isGermany
            );

        }

    }



    destination.addEventListener(
        "change",
        updateConditionalQuestions
    );



    /* =========================================================
       OPEN PHASE 2
       ========================================================= */

    assessmentButton.addEventListener(
        "click",
        () => {

            if (!isComplete()) {
                return;
            }


            const pathway =
                getCurrentPathway();


            /*
             * Display the selections made in Phase 1.
             */

            selectedPathway.textContent =
                `${pathway.destination} • ${pathway.studyArea} • ${pathway.studyLevel}`;


            /*
             * Update any relevant destination-specific
             * questions.
             */

            updateConditionalQuestions();


            clearMessage();


            assessmentPhase.hidden =
                false;


            scrollToElement(
                assessmentPhase
            );

        }
    );



    /* =========================================================
       CHANGE SELECTION
       ========================================================= */

    changeSelection.addEventListener(
        "click",
        () => {

            assessmentPhase.hidden =
                true;


            clearMessage();


            scrollToElement(
                educationPathway
            );

        }
    );



    /* =========================================================
       FORM ERROR HANDLING
       ========================================================= */

    function clearFieldErrors() {

        assessmentForm
            .querySelectorAll(
                ".has-error"
            )
            .forEach(
                (field) => {

                    field.classList.remove(
                        "has-error"
                    );

                }
            );


        assessmentForm
            .querySelectorAll(
                ".assessment-field-error"
            )
            .forEach(
                (error) => {

                    error.remove();

                }
            );

    }



    function addFieldError(
        input,
        message
    ) {

        const field =
            input.closest(
                ".assessment-form-field"
            );


        if (!field) {
            return;
        }


        field.classList.add(
            "has-error"
        );


        const error =
            document.createElement(
                "div"
            );


        error.className =
            "assessment-field-error";


        error.textContent =
            message;


        field.appendChild(
            error
        );

    }



    /* =========================================================
       FORM VALIDATION
       ========================================================= */

    function validateForm() {

        clearFieldErrors();


        let valid = true;


        const requiredFields =
            assessmentForm.querySelectorAll(
                "[required]"
            );


        requiredFields.forEach(
            (field) => {


                /*
                 * Checkbox
                 */

                if (
                    field.type ===
                    "checkbox"
                ) {

                    if (!field.checked) {

                        addFieldError(
                            field,
                            "Please confirm this before submitting."
                        );


                        valid =
                            false;

                    }


                    return;
                }



                /*
                 * Standard fields
                 */

                if (
                    !String(
                        field.value
                    ).trim()
                ) {

                    addFieldError(
                        field,
                        "This field is required."
                    );


                    valid =
                        false;

                }

            }
        );



        /* =====================================================
           EMAIL VALIDATION
           ===================================================== */

        const email =
            document.getElementById(
                "email"
            );


        if (
            email &&
            email.value.trim()
        ) {

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (
                !emailPattern.test(
                    email.value.trim()
                )
            ) {

                addFieldError(
                    email,
                    "Please enter a valid email address."
                );


                valid =
                    false;

            }

        }



        /* =====================================================
           YEAR VALIDATION
           ===================================================== */

        const year =
            document.getElementById(
                "year-completed"
            );


        if (
            year &&
            year.value
        ) {

            const yearNumber =
                Number(
                    year.value
                );


            if (
                yearNumber < 1950 ||
                yearNumber > 2035
            ) {

                addFieldError(
                    year,
                    "Please enter a valid year."
                );


                valid =
                    false;

            }

        }


        return valid;

    }



    /* =========================================================
       FILE VALIDATION
       ========================================================= */

    const allowedExtensions = [

        "pdf",
        "doc",
        "docx",
        "jpg",
        "jpeg",
        "png"

    ];


    const maximumFileSize =
        5 * 1024 * 1024;


    function validateFile(input) {

        if (
            !input.files ||
            !input.files.length
        ) {

            return true;

        }


        const file =
            input.files[0];


        const extension =
            file.name
                .split(".")
                .pop()
                .toLowerCase();



        /*
         * File type check
         */

        if (
            !allowedExtensions.includes(
                extension
            )
        ) {

            addFieldError(
                input,
                "Please choose a PDF, DOC, DOCX, JPG or PNG file."
            );


            return false;

        }



        /*
         * File size check
         */

        if (
            file.size >
            maximumFileSize
        ) {

            addFieldError(
                input,
                "This file is larger than 5 MB."
            );


            return false;

        }


        return true;

    }



    [
        "cv",
        "academic-document",
        "other-document"

    ].forEach(
        (id) => {

            const input =
                document.getElementById(
                    id
                );


            if (!input) {
                return;
            }


            input.addEventListener(
                "change",
                () => {

                    /*
                     * Only clear the errors associated
                     * with the current document stage.
                     */

                    const field =
                        input.closest(
                            ".assessment-form-field"
                        );


                    if (field) {

                        field.classList.remove(
                            "has-error"
                        );


                        field
                            .querySelectorAll(
                                ".assessment-field-error"
                            )
                            .forEach(
                                (error) => {

                                    error.remove();

                                }
                            );

                    }


                    validateFile(
                        input
                    );

                }
            );

        }
    );



    /* =========================================================
       WHATSAPP MESSAGE
       ========================================================= */

    function buildWhatsAppUrl() {

        const formData =
            new FormData(
                assessmentForm
            );


        const pathway =
            getCurrentPathway();


        const name =
            formData.get(
                "fullName"
            ) || "";


        const funding =
            formData.get(
                "fundingInterest"
            ) || "Not specified";


        const message =
            "Hello LORDBLESS CONSULTANCY.%0A%0A" +

            "I have completed my LORDBLESS Education Assessment.%0A%0A" +

            `Name: ${encodeURIComponent(name)}%0A` +

            `Pathway: ${encodeURIComponent(
                pathway.destination
            )}%20%7C%20${encodeURIComponent(
                pathway.studyArea
            )}%20%7C%20${encodeURIComponent(
                pathway.studyLevel
            )}%0A` +

            `Funding Interest: ${encodeURIComponent(
                funding
            )}%0A%0A` +

            "Please advise me on the next steps.";


        return `${WHATSAPP_URL}?text=${message}`;

    }



    /* =========================================================
       FORM SUBMISSION
       ========================================================= */

    assessmentForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            clearMessage();


            /* =================================================
               VALIDATE FORM
               ================================================= */

            if (!validateForm()) {

                showMessage(
                    "error",
                    "Please review the highlighted fields and complete the required information."
                );


                const firstError =
                    assessmentForm.querySelector(
                        ".has-error"
                    );


                if (firstError) {

                    firstError.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });

                }


                return;

            }



            /* =================================================
               VALIDATE UPLOADED DOCUMENTS
               ================================================= */

            const fileInputs = [

                "cv",
                "academic-document",
                "other-document"

            ];


            let filesValid =
                true;


            fileInputs.forEach(
                (id) => {

                    const input =
                        document.getElementById(
                            id
                        );


                    if (
                        input &&
                        !validateFile(input)
                    ) {

                        filesValid =
                            false;

                    }

                }
            );


            if (!filesValid) {

                showMessage(
                    "error",
                    "Please review the uploaded files. Each file must be an accepted type and no larger than 5 MB."
                );


                return;

            }



            /* =================================================
               PREPARE FORM DATA
               ================================================= */

            const formData =
                new FormData(
                    assessmentForm
                );


            const pathway =
                getCurrentPathway();


            /*
             * Explicitly attach Phase 1 selections.
             */

            formData.set(
                "destination",
                pathway.destination
            );


            formData.set(
                "studyArea",
                pathway.studyArea
            );


            formData.set(
                "studyLevel",
                pathway.studyLevel
            );



            /* =================================================
               SECURE BACKEND SUBMISSION
               ================================================= */

            if (
                SUBMISSION_ENDPOINT
            ) {

                try {

                    submitButton.disabled =
                        true;


                    submitButton.textContent =
                        "Submitting...";


                    const response =
                        await fetch(
                            SUBMISSION_ENDPOINT,
                            {
                                method: "POST",
                                body: formData
                            }
                        );


                    if (
                        !response.ok
                    ) {

                        throw new Error(
                            `Submission failed with status ${response.status}`
                        );

                    }


                    /*
                     * Successful submission.
                     */

                    showMessage(
                        "success",
                        `
                            <strong>Assessment received.</strong><br><br>

                            Thank you for submitting your
                            LORDBLESS Education Assessment.

                            <div class="assessment-success-actions">

                                <a
                                    href="${WHATSAPP_URL}"
                                    class="button button-primary"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Chat With LORDBLESS
                                </a>

                            </div>
                        `
                    );


                    assessmentForm.reset();


                    assessmentPhase.hidden =
                        false;


                    updateEducationStatus();


                    updateConditionalQuestions();


                } catch (error) {

                    console.error(
                        "LORDBLESS Education Assessment submission error:",
                        error
                    );


                    showMessage(
                        "error",
                        `
                            We could not complete the online submission.

                            <br><br>

                            Please try again or contact LORDBLESS
                            directly on WhatsApp.

                            <div class="assessment-success-actions">

                                <a
                                    href="${WHATSAPP_URL}"
                                    class="button button-primary"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Contact LORDBLESS
                                </a>

                            </div>
                        `
                    );

                } finally {

                    submitButton.disabled =
                        false;


                    submitButton.textContent =
                        "Submit Education Assessment";

                }


                return;

            }



            /* =================================================
               CURRENT STAGE BEFORE BACKEND CONNECTION
               =================================================

               We do NOT falsely tell the applicant their documents
               have been submitted.

               The browser has only validated the data locally.

               We therefore offer a WhatsApp continuation.
               ================================================= */

            const whatsappUrl =
                buildWhatsAppUrl();


            showMessage(
                "success",
                `
                    <strong>Your assessment has been prepared.</strong><br><br>

                    The LORDBLESS Education Assessment has been
                    completed and validated on this device.

                    The secure submission system is not connected yet,
                    so your uploaded documents have <strong>not</strong>
                    been transmitted or stored.

                    Please continue with LORDBLESS on WhatsApp.

                    <div class="assessment-success-actions">

                        <a
                            href="${whatsappUrl}"
                            class="button button-primary"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Continue on WhatsApp
                        </a>

                    </div>
                `
            );


            submitButton.disabled =
                false;


            submitButton.textContent =
                "Submit Education Assessment";

        }
    );



    /* =========================================================
       INITIALISE
       ========================================================= */

    updateEducationStatus();

    updateConditionalQuestions();

});