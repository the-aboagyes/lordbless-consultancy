/* =========================================================
   LORDBLESS ADMIN
   ENQUIRY DETAIL
   ========================================================= */


/* =========================================================
   STATE
   ========================================================= */

const LORDBLESS_ENQUIRY_DETAIL_STATE = {
    enquiry: null,
    client: null
};


/* =========================================================
   RENDER ENQUIRY DETAIL
   ========================================================= */

function renderEnquiryDetail(
    container,
    enquiry,
    client = null
) {

    if (!container || !enquiry) {
        return;
    }

    LORDBLESS_ENQUIRY_DETAIL_STATE.enquiry = enquiry;
    LORDBLESS_ENQUIRY_DETAIL_STATE.client = client;


    const services = Array.isArray(enquiry.services)
        ? enquiry.services
        : enquiry.service
            ? [enquiry.service]
            : [];


    container.innerHTML = `

        <div class="enquiry-detail">

            <!-- HEADER -->

            <div class="enquiry-detail-header">

                <div>

                    <span class="section-eyebrow">
                        ENQUIRY
                    </span>

                    <h2>
                        ${escapeEnquiryHtml(
                            enquiry.enquiry_reference ||
                            enquiry.id ||
                            "Enquiry"
                        )}
                    </h2>

                    <p>
                        ${escapeEnquiryHtml(
                            enquiry.destination ||
                            "Destination not specified"
                        )}
                    </p>

                </div>


                <span class="badge badge-${escapeEnquiryHtml(
                    enquiry.status || "new"
                )}">
                    ${escapeEnquiryHtml(
                        enquiry.status || "new"
                    ).toUpperCase()}
                </span>

            </div>


            <!-- CLIENT -->

            <div class="detail-section">

                <div class="detail-section-header">

                    <div>
                        <span class="section-eyebrow">
                            CLIENT
                        </span>

                        <h3>
                            Client Information
                        </h3>
                    </div>

                </div>


                <div class="detail-grid">

                    <div>
                        <span>Name</span>
                        <strong>
                            ${escapeEnquiryHtml(
                                enquiry.full_name ||
                                enquiry.client?.fullName ||
                                client?.fullName ||
                                "—"
                            )}
                        </strong>
                    </div>


                    <div>
                        <span>Email</span>
                        <strong>
                            ${escapeEnquiryHtml(
                                enquiry.email ||
                                enquiry.client?.email ||
                                client?.email ||
                                "—"
                            )}
                        </strong>
                    </div>


                    <div>
                        <span>WhatsApp</span>
                        <strong>
                            ${escapeEnquiryHtml(
                                enquiry.whatsapp ||
                                enquiry.client?.whatsapp ||
                                client?.whatsapp ||
                                "—"
                            )}
                        </strong>
                    </div>


                    <div>
                        <span>Current Country</span>
                        <strong>
                            ${escapeEnquiryHtml(
                                enquiry.current_country ||
                                enquiry.client?.currentCountry ||
                                client?.currentCountry ||
                                "—"
                            )}
                        </strong>
                    </div>

                </div>

            </div>


            <!-- JOURNEY -->

            <div class="detail-section">

                <div class="detail-section-header">

                    <div>
                        <span class="section-eyebrow">
                            JOURNEY
                        </span>

                        <h3>
                            Journey Information
                        </h3>
                    </div>

                </div>


                <div class="detail-grid">

                    <div>
                        <span>Service</span>
                        <strong>
                            ${services.length
                                ? services
                                    .map(
                                        service =>
                                            escapeEnquiryHtml(
                                                service
                                            )
                                    )
                                    .join(", ")
                                : "—"
                            }
                        </strong>
                    </div>


                    <div>
                        <span>Destination</span>
                        <strong>
                            ${escapeEnquiryHtml(
                                enquiry.destination ||
                                "—"
                            )}
                        </strong>
                    </div>


                    <div>
                        <span>Timeframe</span>
                        <strong>
                            ${escapeEnquiryHtml(
                                enquiry.timeframe ||
                                "—"
                            )}
                        </strong>
                    </div>


                    <div>
                        <span>Preferred Contact</span>
                        <strong>
                            ${escapeEnquiryHtml(
                                enquiry.preferred_contact ||
                                "—"
                            )}
                        </strong>
                    </div>

                </div>

            </div>


            <!-- REQUIREMENTS -->

            <div class="detail-section">

                <div class="detail-section-header">

                    <div>

                        <span class="section-eyebrow">
                            DOCUMENTS
                        </span>

                        <h3>
                            Requirements
                        </h3>

                    </div>

                </div>


                <div
                    id="enquiry-requirements-container"
                    class="admin-detail-component"
                ></div>

            </div>


            <!-- DOCUMENT REVIEW -->

            <div class="detail-section">

                <div class="detail-section-header">

                    <div>

                        <span class="section-eyebrow">
                            REVIEW
                        </span>

                        <h3>
                            Document Review
                        </h3>

                    </div>

                </div>


                <div
                    id="document-review-container"
                    class="admin-detail-component"
                ></div>

            </div>


            <!-- DOCUMENT REQUEST -->

            <div class="detail-section">

                <div class="detail-section-header">

                    <div>

                        <span class="section-eyebrow">
                            CLIENT ACTION
                        </span>

                        <h3>
                            Document Request
                        </h3>

                    </div>

                </div>


                <div
                    id="document-request-container"
                    class="admin-detail-component"
                ></div>

            </div>


            <!-- ADDITIONAL INFORMATION -->

            ${
                enquiry.additional_information
                    ? `

                        <div class="detail-section">

                            <div class="detail-section-header">

                                <div>

                                    <span class="section-eyebrow">
                                        NOTES
                                    </span>

                                    <h3>
                                        Additional Information
                                    </h3>

                                </div>

                            </div>

                            <p class="detail-text">
                                ${escapeEnquiryHtml(
                                    enquiry.additional_information
                                )}
                            </p>

                        </div>

                    `
                    : ""
            }

        </div>
    `;


    initialiseEnquiryDetailActions(
        container,
        enquiry,
        client
    );

}


/* =========================================================
   INITIALISE COMPONENTS
   ========================================================= */

function initialiseEnquiryDetailActions(
    container,
    enquiry,
    client
) {

    /*
     * The enquiry itself acts as the transaction.
     */

    const transaction =
        normaliseEnquiryTransaction(
            enquiry
        );


    /*
     * Permanent client documents.
     *
     * During the mock stage these can come from the
     * client object. Later they will come directly from
     * Supabase.
     */

    const clientDocuments =
        Array.isArray(
            client?.documents
        )
            ? client.documents
            : Array.isArray(
                enquiry.client?.documents
            )
                ? enquiry.client.documents
                : [];


    /*
     * REQUIREMENTS
     */

    const requirementsContainer =
        container.querySelector(
            "#enquiry-requirements-container"
        );


    if (
        requirementsContainer &&
        window.LORDBLESS_REQUIREMENT_MANAGER
    ) {

        LORDBLESS_REQUIREMENT_MANAGER.render(
            requirementsContainer,
            transaction,
            clientDocuments
        );

    }


    /*
     * DOCUMENT REVIEW
     *
     * No document is selected initially.
     * The review panel will be opened when an uploaded
     * document is selected.
     */

    const reviewContainer =
        container.querySelector(
            "#document-review-container"
        );


    if (reviewContainer) {

        reviewContainer.innerHTML = `

            <div class="empty-state">

                Select an uploaded document
                from the Requirements area to review it.

            </div>

        `;

    }


    /*
     * DOCUMENT REQUEST
     */

    const requestContainer =
        container.querySelector(
            "#document-request-container"
        );


    if (requestContainer) {

        requestContainer.innerHTML = `

            <div class="empty-state">

                Document requests will appear here
                when an Admin requests action from the client.

            </div>

        `;

    }


    /*
     * Listen for document request events.
     */

    window.addEventListener(
        "lordbless:document-request-created",
        handleEnquiryDocumentRequest
    );

}


/* =========================================================
   NORMALISE ENQUIRY → TRANSACTION
   ========================================================= */

function normaliseEnquiryTransaction(
    enquiry
) {

    const services =
        Array.isArray(enquiry.services)
            ? enquiry.services
            : enquiry.serviceKey
                ? [enquiry.serviceKey]
                : [];


    return {

        id:
            enquiry.enquiry_reference ||
            enquiry.id,

        services,

        service:
            enquiry.service,

        title:
            enquiry.title ||
            `${services.join(" + ")} Journey`,

        destination:
            enquiry.destination,

        status:
            enquiry.status || "new",

        createdAt:
            enquiry.created_at,

        updatedAt:
            enquiry.updated_at

    };

}


/* =========================================================
   DOCUMENT REQUEST EVENT
   ========================================================= */

function handleEnquiryDocumentRequest(
    event
) {

    const request =
        event?.detail;


    if (!request) {
        return;
    }


    const currentEnquiry =
        LORDBLESS_ENQUIRY_DETAIL_STATE
            .enquiry;


    if (!currentEnquiry) {
        return;
    }


    const currentTransactionId =
        currentEnquiry.enquiry_reference ||
        currentEnquiry.id;


    if (
        request.transactionId !==
        currentTransactionId
    ) {
        return;
    }


    const requestContainer =
        window.document.getElementById(
            "document-request-container"
        );


    if (!requestContainer) {
        return;
    }


    requestContainer.innerHTML = `

        <div class="document-request-confirmation">

            <strong>
                Document request created
            </strong>

            <span>
                ${escapeEnquiryHtml(
                    request.documentName ||
                    "Document"
                )}
                has been requested from the client.
            </span>

            <small>
                Request ID:
                ${escapeEnquiryHtml(
                    request.id
                )}
            </small>

        </div>

    `;

}


/* =========================================================
   OPEN DOCUMENT REVIEW
   ========================================================= */

function openEnquiryDocumentReview(
    document
) {

    const state =
        LORDBLESS_ENQUIRY_DETAIL_STATE;


    const reviewContainer =
        window.document.getElementById(
            "document-review-container"
        );


    if (
        !reviewContainer ||
        !document
    ) {
        return;
    }


    const transaction =
        normaliseEnquiryTransaction(
            state.enquiry
        );


    const client =
        state.client ||
        state.enquiry.client ||
        null;


    if (
        window.LORDBLESS_DOCUMENT_REVIEW
    ) {

        LORDBLESS_DOCUMENT_REVIEW.render(
            reviewContainer,
            document,
            client,
            transaction
        );

    }

}


/* =========================================================
   OPEN DOCUMENT REQUEST
   ========================================================= */

function openEnquiryDocumentRequest(
    requirement,
    requestType = "missing"
) {

    const state =
        LORDBLESS_ENQUIRY_DETAIL_STATE;


    const requestContainer =
        window.document.getElementById(
            "document-request-container"
        );


    if (
        !requestContainer ||
        !requirement
    ) {
        return;
    }


    const transaction =
        normaliseEnquiryTransaction(
            state.enquiry
        );


    const client =
        state.client ||
        state.enquiry.client ||
        null;


    if (
        window.LORDBLESS_DOCUMENT_REQUEST
    ) {

        LORDBLESS_DOCUMENT_REQUEST.render(
            requestContainer,
            client,
            transaction,
            requirement,
            requestType
        );

    }

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeEnquiryHtml(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   GLOBAL BRIDGE
   ========================================================= */

window.LORDBLESS_ENQUIRY_DETAIL = {

    state:
        LORDBLESS_ENQUIRY_DETAIL_STATE,

    render:
        renderEnquiryDetail,

    openDocumentReview:
        openEnquiryDocumentReview,

    openDocumentRequest:
        openEnquiryDocumentRequest

};