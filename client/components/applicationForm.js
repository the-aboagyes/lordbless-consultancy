/* =========================================================
   LORDBLESS CONSULTANCY
   APPLICATION DETAILS ENGINE

   Builds a short, intelligent application form from the
   services selected for the client's transaction.

   Principles:
   - Client-level information is collected once.
   - Questions are service-specific.
   - Duplicate questions are removed.
   - Multiple services are intelligently blended.
   - Conditional questions can be added later.
   ========================================================= */


/* =========================================================
   QUESTION LIBRARY
   ========================================================= */

const LORDBLESS_QUESTION_LIBRARY = {


    /* -----------------------------------------------------
       CLIENT / IDENTITY
       ----------------------------------------------------- */

    identity: [

        {
            id: "date_of_birth",
            type: "date",
            label: "Date of birth",
            required: true,
            scope: "client"
        },

        {
            id: "passport_number",
            type: "text",
            label: "Passport number",
            required: true,
            scope: "client"
        },

        {
            id: "passport_issue_date",
            type: "date",
            label: "Passport issue date",
            required: true,
            scope: "client"
        },

        {
            id: "passport_expiry_date",
            type: "date",
            label: "Passport expiry date",
            required: true,
            scope: "client"
        }

    ],


    /* -----------------------------------------------------
       EDUCATION
       ----------------------------------------------------- */

    education: [

        {
            id: "highest_qualification",
            type: "select",
            label: "Highest / latest educational qualification",
            required: true,
            options: [
                "WASSCE / High School",
                "Certificate",
                "Diploma",
                "Higher National Diploma",
                "Bachelor's Degree",
                "Postgraduate Diploma",
                "Master's Degree",
                "Doctorate / PhD",
                "Other"
            ]
        },

        {
            id: "field_of_study",
            type: "text",
            label: "Field of study",
            required: true
        },

        {
            id: "institution",
            type: "text",
            label: "Institution attended",
            required: true
        },

        {
            id: "institution_country",
            type: "text",
            label: "Country of institution",
            required: true
        },

        {
            id: "year_completed",
            type: "number",
            label: "Year completed",
            required: true,
            min: 1950,
            max: 2100
        },

        {
            id: "preferred_programme",
            type: "text",
            label: "Preferred study programme",
            required: true
        },

        {
            id: "preferred_intake",
            type: "text",
            label: "Preferred intake",
            required: false,
            placeholder: "e.g. September 2027"
        }

    ],


    /* -----------------------------------------------------
       CAREERS
       ----------------------------------------------------- */

    careers: [

        {
            id: "profession",
            type: "text",
            label: "Current profession",
            required: true
        },

        {
            id: "professional_qualification",
            type: "text",
            label: "Professional qualification",
            required: true
        },

        {
            id: "years_experience",
            type: "number",
            label: "Years of relevant experience",
            required: true,
            min: 0,
            max: 70
        },

        {
            id: "target_position",
            type: "text",
            label: "Type of position you are seeking",
            required: true
        },

        {
            id: "professional_registration",
            type: "text",
            label: "Professional registration / licence",
            required: false,
            placeholder: "If applicable"
        }

    ],


    /* -----------------------------------------------------
       TRAVEL
       ----------------------------------------------------- */

    travel: [

        {
            id: "travel_purpose",
            type: "select",
            label: "Purpose of travel",
            required: true,
            options: [
                "Tourism",
                "Business",
                "Education",
                "Visiting family / friends",
                "Conference / Event",
                "Medical",
                "Other"
            ]
        },

        {
            id: "travel_period",
            type: "text",
            label: "Intended travel period",
            required: true,
            placeholder: "e.g. November 2026"
        },

        {
            id: "traveller_count",
            type: "number",
            label: "Number of travellers",
            required: true,
            min: 1,
            max: 50
        },

        {
            id: "accommodation_required",
            type: "select",
            label: "Do you require accommodation assistance?",
            required: true,
            options: [
                "Yes",
                "No"
            ]
        }

    ],


    /* -----------------------------------------------------
       BUSINESS
       ----------------------------------------------------- */

    business: [

        {
            id: "business_name",
            type: "text",
            label: "Business / organisation name",
            required: true
        },

        {
            id: "business_activity",
            type: "text",
            label: "Main business activity",
            required: true
        },

        {
            id: "business_purpose",
            type: "textarea",
            label: "Purpose of the business engagement",
            required: true
        },

        {
            id: "business_destination",
            type: "text",
            label: "Business destination",
            required: true
        },

        {
            id: "business_travel_period",
            type: "text",
            label: "Expected business travel period",
            required: false
        }

    ],


    /* -----------------------------------------------------
       GOLD SERVICES / MOBILITY
       ----------------------------------------------------- */

    mobility: [

        {
            id: "mobility_objective",
            type: "textarea",
            label: "What would you like LORDBLESS to help you achieve?",
            required: true
        },

        {
            id: "mobility_destination",
            type: "text",
            label: "Preferred destination",
            required: true
        }

    ]

};


/* =========================================================
   SERVICE LABELS
   ========================================================= */

const LORDBLESS_SERVICE_LABELS = {

    education:
        "LORDBLESS GLOBAL EDUCATION",

    careers:
        "LORDBLESS GLOBAL CAREERS",

    travel:
        "LORDBLESS TRAVEL",

    business:
        "LORDBLESS BUSINESS",

    mobility:
        "LORDBLESS GOLD SERVICES"

};


/* =========================================================
   NORMALISE SERVICES
   ========================================================= */

function normaliseApplicationServices(
    services
) {

    if (!Array.isArray(services)) {
        return [];
    }


    return services
        .map(service => {

            if (
                typeof service === "string"
            ) {
                return service.toLowerCase();
            }

            return service?.key
                ? service.key.toLowerCase()
                : null;

        })
        .filter(Boolean)
        .filter(
            (service, index, array) =>
                array.indexOf(service) === index
        );

}


/* =========================================================
   BUILD QUESTION SET
   ========================================================= */

function buildApplicationQuestionSet(
    services
) {

    const selectedServices =
        normaliseApplicationServices(
            services
        );


    const questions = [];

    const usedQuestionIds =
        new Set();


    /* ---------------------------------------------
       Identity is always considered once.
       --------------------------------------------- */

    LORDBLESS_QUESTION_LIBRARY.identity
        .forEach(question => {

            if (
                !usedQuestionIds.has(
                    question.id
                )
            ) {

                questions.push({
                    ...question,
                    group: "personal"
                });

                usedQuestionIds.add(
                    question.id
                );

            }

        });


    /* ---------------------------------------------
       Add service questions.
       --------------------------------------------- */

    selectedServices
        .forEach(service => {

            const serviceQuestions =
                LORDBLESS_QUESTION_LIBRARY[
                    service
                ] || [];


            serviceQuestions
                .forEach(question => {

                    /*
                     * If two services require the same
                     * question ID, it appears only once.
                     */

                    if (
                        usedQuestionIds.has(
                            question.id
                        )
                    ) {
                        return;
                    }


                    questions.push({
                        ...question,
                        group: service
                    });


                    usedQuestionIds.add(
                        question.id
                    );

                });

        });


    return questions;

}


/* =========================================================
   GROUP QUESTIONS
   ========================================================= */

function groupApplicationQuestions(
    questions
) {

    const groups = {};

    questions.forEach(question => {

        if (!groups[question.group]) {

            groups[question.group] = [];

        }

        groups[question.group].push(
            question
        );

    });


    return groups;

}


/* =========================================================
   FORM HTML
   ========================================================= */

function renderApplicationForm(
    services,
    existingData = {}
) {

    const questions =
        buildApplicationQuestionSet(
            services
        );


    const groups =
        groupApplicationQuestions(
            questions
        );


    const groupOrder = [
        "personal",
        "education",
        "careers",
        "travel",
        "business",
        "mobility"
    ];


    let html = "";


    groupOrder.forEach(group => {

        if (!groups[group]?.length) {
            return;
        }


        const title =
            group === "personal"
                ? "Personal & Passport Information"
                : LORDBLESS_SERVICE_LABELS[group];


        html += `

            <section
                class="application-form-group"
                data-form-group="${group}"
            >

                <div class="application-group-heading">

                    <p class="portal-eyebrow">
                        ${escapeHTML(title)}
                    </p>

                    <h3>
                        ${getGroupDescription(group)}
                    </h3>

                </div>

                <div class="application-fields">

        `;


        groups[group].forEach(question => {

            html += renderApplicationQuestion(
                question,
                existingData[
                    question.id
                ]
            );

        });


        html += `

                </div>

            </section>

        `;

    });


    return html;

}


/* =========================================================
   QUESTION HTML
   ========================================================= */

function renderApplicationQuestion(
    question,
    value
) {

    const required =
        question.required
            ? "required"
            : "";


    const requiredLabel =
        question.required
            ? `<span class="required-mark">*</span>`
            : "";


    const safeValue =
        escapeHTML(
            value ?? ""
        );


    let fieldHTML = "";


    if (question.type === "select") {

        fieldHTML = `

            <select
                id="application-${question.id}"
                name="${question.id}"
                ${required}
            >

                <option value="">
                    Select an option
                </option>

                ${question.options
                    .map(option => `

                        <option
                            value="${escapeHTML(option)}"
                            ${
                                value === option
                                    ? "selected"
                                    : ""
                            }
                        >
                            ${escapeHTML(option)}
                        </option>

                    `)
                    .join("")
                }

            </select>

        `;

    }


    else if (
        question.type === "textarea"
    ) {

        fieldHTML = `

            <textarea
                id="application-${question.id}"
                name="${question.id}"
                rows="4"
                placeholder="${escapeHTML(
                    question.placeholder || ""
                )}"
                ${required}
            >${safeValue}</textarea>

        `;

    }


    else {

        fieldHTML = `

            <input
                type="${question.type}"
                id="application-${question.id}"
                name="${question.id}"
                value="${safeValue}"
                placeholder="${escapeHTML(
                    question.placeholder || ""
                )}"
                ${
                    question.min !== undefined
                        ? `min="${question.min}"`
                        : ""
                }
                ${
                    question.max !== undefined
                        ? `max="${question.max}"`
                        : ""
                }
                ${required}
            >

        `;

    }


    return `

        <div class="application-field">

            <label
                for="application-${question.id}"
            >

                ${escapeHTML(
                    question.label
                )}

                ${requiredLabel}

            </label>

            ${fieldHTML}

        </div>

    `;

}


/* =========================================================
   GROUP DESCRIPTION
   ========================================================= */

function getGroupDescription(
    group
) {

    const descriptions = {

        personal:
            "A few essential details we need to support your journey.",

        education:
            "Your latest education and intended study plans.",

        careers:
            "A short overview of your professional background and career objective.",

        travel:
            "The key information needed to understand your travel plans.",

        business:
            "Essential information about your business engagement.",

        mobility:
            "Tell us briefly what you would like LORDBLESS to help you achieve."

    };


    return descriptions[group] || "";

}


/* =========================================================
   COLLECT FORM DATA
   ========================================================= */

function collectApplicationFormData(
    form
) {

    const formData =
        new FormData(form);


    const data = {};


    formData.forEach(
        (value, key) => {

            data[key] = value;

        }
    );


    return data;

}


/* =========================================================
   FORM VALIDATION
   ========================================================= */

function validateApplicationData(
    form
) {

    if (!form.checkValidity()) {

        form.reportValidity();

        return false;

    }


    const expiry =
        form.elements[
            "passport_expiry_date"
        ];


    const issue =
        form.elements[
            "passport_issue_date"
        ];


    if (
        issue?.value &&
        expiry?.value &&
        expiry.value <= issue.value
    ) {

        window.alert(
            "Passport expiry date must be later than the issue date."
        );

        expiry.focus();

        return false;

    }


    return true;

}


/* =========================================================
   FORM SUBMISSION
   ========================================================= */

function initialiseApplicationForm(
    container,
    services,
    existingData = {},
    onSubmit = null
) {

    if (!container) {
        return;
    }


    const questionCount =
        buildApplicationQuestionSet(
            services
        ).length;


    container.innerHTML = `

        <form
            class="application-details-form"
            id="application-details-form"
            novalidate
        >

            <div class="application-form-intro">

                <p class="portal-eyebrow">
                    APPLICATION DETAILS
                </p>

                <h2>
                    A few details to move your journey forward
                </h2>

                <p>
                    We've already received your initial enquiry.
                    This form only asks for the additional
                    information needed for your selected service.
                </p>

                <span class="application-question-count">
                    ${questionCount} questions
                </span>

            </div>


            ${renderApplicationForm(
                services,
                existingData
            )}


            <div class="application-form-actions">

                <button
                    type="button"
                    class="application-secondary-button"
                    data-close-application-form
                >
                    Back
                </button>

                <button
                    type="submit"
                    class="portal-primary-button"
                >
                    Save & Continue
                </button>

            </div>

        </form>

    `;


    const form =
        container.querySelector(
            "#application-details-form"
        );


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            if (
                !validateApplicationData(
                    form
                )
            ) {
                return;
            }


            const data =
                collectApplicationFormData(
                    form
                );


            if (
                typeof onSubmit ===
                "function"
            ) {

                onSubmit(data);

            }

        }
    );


    const closeButton =
        container.querySelector(
            "[data-close-application-form]"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            () => {

                container.innerHTML = "";

            }
        );

    }

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(
            /[&<>"']/g,
            character => ({

                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"

            })[character]
        );

}