/* =========================================================
   LORDBLESS ADMIN
   REQUIREMENT MANAGER
   ========================================================= */


/* =========================================================
   REQUIREMENT STATUS
   ========================================================= */

const LORDBLESS_REQUIREMENT_STATUS = {

    SATISFIED: "satisfied",

    REQUIRED: "required",

    REVIEWING: "reviewing",

    REJECTED: "rejected",

    EXPIRED: "expired",

    REPLACEMENT_REQUIRED: "replacement_required"

};


/* =========================================================
   REQUIREMENT MANAGER STATE
   ========================================================= */

const LORDBLESS_REQUIREMENT_MANAGER_STATE = {

    transactionId: null,

    requirements: [],

    clientDocuments: []

};


/* =========================================================
   INITIALISE
   ========================================================= */

function initialiseRequirementManager(
    transaction,
    clientDocuments = []
) {

    if (!transaction) {
        return;
    }

    LORDBLESS_REQUIREMENT_MANAGER_STATE.transactionId =
        transaction.id;

    LORDBLESS_REQUIREMENT_MANAGER_STATE.clientDocuments =
        Array.isArray(clientDocuments)
            ? clientDocuments
            : [];

    LORDBLESS_REQUIREMENT_MANAGER_STATE.requirements =
        buildAdminRequirements(
            transaction,
            LORDBLESS_REQUIREMENT_MANAGER_STATE.clientDocuments
        );

}


/* =========================================================
   BUILD ADMIN REQUIREMENTS
   ========================================================= */

function buildAdminRequirements(
    transaction,
    clientDocuments
) {

    const requirements =
        LORDBLESS_DOCUMENT_CENTRE
            .buildTransactionRequirements(
                transaction,
                clientDocuments
            );

    return requirements.map(requirement => {

        const document =
            requirement.document;

        let status =
            requirement.status;

        let alert = null;

        if (document) {

            const documentStatus =
                LORDBLESS_DOCUMENT_CENTRE
                    .getDocumentValidityStatus(
                        document
                    );

            if (documentStatus === "reviewing") {
                status =
                    LORDBLESS_REQUIREMENT_STATUS.REVIEWING;
            }

            if (documentStatus === "rejected") {
                status =
                    LORDBLESS_REQUIREMENT_STATUS.REJECTED;
            }

            if (documentStatus === "expired") {
                status =
                    LORDBLESS_REQUIREMENT_STATUS.EXPIRED;
            }

        }

        if (
            requirement.documentType === "passport" &&
            document
        ) {

            alert =
                LORDBLESS_DOCUMENT_CENTRE
                    .getPassportExpiryAlert(
                        document
                    );

        }

        return {

            ...requirement,

            status,

            alert,

            adminNote: "",

            requestedAt: null,

            reviewedAt:
                document?.approvedAt || null

        };

    });

}


/* =========================================================
   RENDER REQUIREMENT MANAGER
   ========================================================= */

function renderRequirementManager(
    container,
    transaction,
    clientDocuments = []
) {

    if (!container || !transaction) {
        return;
    }

    initialiseRequirementManager(
        transaction,
        clientDocuments
    );

    const requirements =
        LORDBLESS_REQUIREMENT_MANAGER_STATE
            .requirements;

    const satisfied =
        requirements.filter(
            item =>
                item.status ===
                LORDBLESS_REQUIREMENT_STATUS.SATISFIED
        );

    const actionRequired =
        requirements.filter(
            item =>
                item.status !==
                LORDBLESS_REQUIREMENT_STATUS.SATISFIED
        );


    container.innerHTML = `

        <div class="requirement-manager">

            <div class="requirement-manager-header">

                <div>

                    <span class="section-eyebrow">
                        REQUIREMENTS
                    </span>

                    <h2>
                        ${transaction.title || "Transaction"}
                    </h2>

                    <p>
                        ${transaction.id}
                    </p>

                </div>

                <button
                    type="button"
                    class="btn btn-primary"
                    id="add-requirement-btn"
                >
                    + Add Requirement
                </button>

            </div>


            <div class="requirement-summary">

                <div class="requirement-stat">

                    <strong>
                        ${requirements.length}
                    </strong>

                    <span>
                        Total
                    </span>

                </div>


                <div class="requirement-stat">

                    <strong>
                        ${satisfied.length}
                    </strong>

                    <span>
                        Satisfied
                    </span>

                </div>


                <div class="requirement-stat">

                    <strong>
                        ${actionRequired.length}
                    </strong>

                    <span>
                        Action Required
                    </span>

                </div>

            </div>


            <div class="requirement-list">

                ${
                    requirements.length
                        ? requirements
                            .map(
                                renderAdminRequirement
                            )
                            .join("")
                        : `
                            <div class="empty-state">

                                No requirements have been
                                configured for this transaction.

                            </div>
                        `
                }

            </div>

        </div>
    `;


    initialiseRequirementManagerActions(
        container,
        transaction
    );

}


/* =========================================================
   RENDER REQUIREMENT
   ========================================================= */

function renderAdminRequirement(
    requirement
) {

    const statusClass =
        getRequirementStatusClass(
            requirement.status
        );

    const statusLabel =
        getRequirementStatusLabel(
            requirement.status
        );


    let sourceText = "";

    if (
        requirement.status ===
        LORDBLESS_REQUIREMENT_STATUS.SATISFIED
    ) {

        sourceText = `

            <div class="requirement-source">

                <span>
                    Available from Client Document Library
                </span>

                ${
                    requirement.document?.fileName
                        ? `
                            <small>
                                ${escapeRequirementHtml(
                                    requirement.document.fileName
                                )}
                            </small>
                        `
                        : ""
                }

            </div>
        `;

    } else {

        sourceText = `

            <div class="requirement-source">

                <span>
                    Client action required
                </span>

            </div>
        `;

    }


    let alertHtml = "";

    if (requirement.alert) {

        if (
            requirement.alert.level ===
            "urgent"
        ) {

            alertHtml = `

                <div class="requirement-alert requirement-alert-urgent">

                    <strong>
                        Passport expiry alert
                    </strong>

                    <span>
                        ${requirement.alert.daysRemaining}
                        days remaining.
                        Contact client regarding renewal.
                    </span>

                </div>
            `;

        } else if (
            requirement.alert.level ===
            "attention"
        ) {

            alertHtml = `

                <div class="requirement-alert requirement-alert-attention">

                    <strong>
                        Passport validity attention
                    </strong>

                    <span>
                        ${requirement.alert.daysRemaining}
                        days remaining.
                    </span>

                </div>
            `;

        } else if (
            requirement.alert.level ===
            "critical"
        ) {

            alertHtml = `

                <div class="requirement-alert requirement-alert-critical">

                    <strong>
                        Passport expired
                    </strong>

                    <span>
                        Immediate client follow-up required.
                    </span>

                </div>
            `;

        }

    }


    return `

        <div
            class="admin-requirement-card"
            data-requirement-id="${requirement.requirementId}"
        >

            <div class="admin-requirement-main">

                <div class="admin-requirement-icon">
                    ${getRequirementIcon(
                        requirement.status
                    )}
                </div>


                <div class="admin-requirement-content">

                    <div class="admin-requirement-title">

                        <strong>
                            ${escapeRequirementHtml(
                                requirement.name
                            )}
                        </strong>

                        <span
                            class="requirement-status ${statusClass}"
                        >
                            ${statusLabel}
                        </span>

                    </div>


                    <span class="requirement-category">

                        ${escapeRequirementHtml(
                            requirement.category
                        )}

                    </span>


                    ${sourceText}


                    ${alertHtml}

                </div>

            </div>


            <div class="admin-requirement-actions">

                ${
                    requirement.status ===
                    LORDBLESS_REQUIREMENT_STATUS.REJECTED
                        ? `
                            <button
                                type="button"
                                class="btn btn-secondary requirement-action"
                                data-action="request-replacement"
                                data-requirement-id="${requirement.requirementId}"
                            >
                                Request Replacement
                            </button>
                        `
                        : ""
                }


                ${
                    requirement.status !==
                    LORDBLESS_REQUIREMENT_STATUS.SATISFIED
                        ? `
                            <button
                                type="button"
                                class="btn btn-secondary requirement-action"
                                data-action="request-document"
                                data-requirement-id="${requirement.requirementId}"
                            >
                                Request Document
                            </button>
                        `
                        : ""
                }


                <button
                    type="button"
                    class="btn btn-ghost requirement-action"
                    data-action="remove"
                    data-requirement-id="${requirement.requirementId}"
                >
                    Remove
                </button>

            </div>

        </div>
    `;
}


/* =========================================================
   ACTIONS
   ========================================================= */

function initialiseRequirementManagerActions(
    container,
    transaction
) {

    const addButton =
        container.querySelector(
            "#add-requirement-btn"
        );

    if (addButton) {

        addButton.addEventListener(
            "click",
            () => {

                openAddRequirementDialog(
                    transaction
                );

            }
        );

    }


    container
        .querySelectorAll(
            ".requirement-action"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    handleRequirementAction(
                        button.dataset.action,
                        button.dataset.requirementId
                    );

                }
            );

        });

}


/* =========================================================
   REQUIREMENT ACTIONS
   ========================================================= */

function handleRequirementAction(
    action,
    requirementId
) {

    const requirement =
        LORDBLESS_REQUIREMENT_MANAGER_STATE
            .requirements
            .find(
                item =>
                    item.requirementId ===
                    requirementId
            );

    if (!requirement) {
        return;
    }


    switch (action) {

        case "request-document":

            requestRequirementDocument(
                requirement
            );

            break;


        case "request-replacement":

            requestRequirementReplacement(
                requirement
            );

            break;


        case "remove":

            removeRequirement(
                requirementId
            );

            break;

    }

}


/* =========================================================
   REQUEST DOCUMENT
   ========================================================= */

function requestRequirementDocument(
    requirement
) {

    requirement.requestedAt =
        new Date().toISOString();

    requirement.status =
        LORDBLESS_REQUIREMENT_STATUS.REQUIRED;

    showRequirementMessage(
        `${requirement.name} has been marked for client action.`
    );

    console.log(
        "LORDBLESS DOCUMENT REQUEST:",
        requirement
    );

}


/* =========================================================
   REQUEST REPLACEMENT
   ========================================================= */

function requestRequirementReplacement(
    requirement
) {

    requirement.status =
        LORDBLESS_REQUIREMENT_STATUS.REPLACEMENT_REQUIRED;

    requirement.requestedAt =
        new Date().toISOString();

    showRequirementMessage(
        `Replacement requested for ${requirement.name}.`
    );

    console.log(
        "LORDBLESS REPLACEMENT REQUEST:",
        requirement
    );

}


/* =========================================================
   REMOVE REQUIREMENT
   ========================================================= */

function removeRequirement(
    requirementId
) {

    const requirement =
        LORDBLESS_REQUIREMENT_MANAGER_STATE
            .requirements
            .find(
                item =>
                    item.requirementId ===
                    requirementId
            );

    if (!requirement) {
        return;
    }


    const confirmed =
        window.confirm(
            `Remove "${requirement.name}" from this transaction?`
        );

    if (!confirmed) {
        return;
    }


    LORDBLESS_REQUIREMENT_MANAGER_STATE
        .requirements =
        LORDBLESS_REQUIREMENT_MANAGER_STATE
            .requirements
            .filter(
                item =>
                    item.requirementId !==
                    requirementId
            );


    showRequirementMessage(
        `${requirement.name} removed from this transaction.`
    );

}


/* =========================================================
   ADD REQUIREMENT DIALOG
   ========================================================= */

function openAddRequirementDialog(
    transaction
) {

    const availableTypes =
        Object.values(
            LORDBLESS_DOCUMENT_LIBRARY
        );


    const options =
        availableTypes
            .map(
                document => `
                    <option value="${document.id}">
                        ${escapeRequirementHtml(
                            document.name
                        )}
                    </option>
                `
            )
            .join("");


    const type =
        window.prompt(
            "Enter document type:\n\n" +
            availableTypes
                .map(
                    document =>
                        `${document.id} — ${document.name}`
                )
                .join("\n")
        );


    if (!type) {
        return;
    }


    const definition =
        LORDBLESS_DOCUMENT_LIBRARY[type];


    if (!definition) {

        showRequirementMessage(
            "Unknown document type."
        );

        return;
    }


    const exists =
        LORDBLESS_REQUIREMENT_MANAGER_STATE
            .requirements
            .some(
                requirement =>
                    requirement.documentType ===
                    type
            );


    if (exists) {

        showRequirementMessage(
            `${definition.name} is already required for this transaction.`
        );

        return;
    }


    const existingDocument =
        LORDBLESS_DOCUMENT_CENTRE
            .findReusableClientDocument(
                LORDBLESS_REQUIREMENT_MANAGER_STATE
                    .clientDocuments,
                type
            );


    LORDBLESS_REQUIREMENT_MANAGER_STATE
        .requirements
        .push({

            requirementId:
                `${transaction.id}-${type}`,

            documentType:
                type,

            name:
                definition.name,

            category:
                definition.category,

            status:
                existingDocument
                    ? LORDBLESS_REQUIREMENT_STATUS.SATISFIED
                    : LORDBLESS_REQUIREMENT_STATUS.REQUIRED,

            documentId:
                existingDocument?.id || null,

            document:
                existingDocument || null,

            source:
                existingDocument
                    ? "client_library"
                    : "transaction",

            action:
                existingDocument
                    ? "no_upload_required"
                    : "upload_required",

            alert:
                existingDocument &&
                type === "passport"
                    ? LORDBLESS_DOCUMENT_CENTRE
                        .getPassportExpiryAlert(
                            existingDocument
                        )
                    : null,

            adminNote: "",

            requestedAt: null,

            reviewedAt:
                existingDocument?.approvedAt || null

        });


    showRequirementMessage(
        `${definition.name} added to the transaction.`
    );

}


/* =========================================================
   STATUS HELPERS
   ========================================================= */

function getRequirementStatusLabel(
    status
) {

    const labels = {

        satisfied: "SATISFIED",

        required: "REQUIRED",

        reviewing: "UNDER REVIEW",

        rejected: "REJECTED",

        expired: "EXPIRED",

        replacement_required:
            "REPLACEMENT REQUIRED"

    };

    return labels[status] || "REQUIRED";
}


function getRequirementStatusClass(
    status
) {

    return `status-${status}`;
}


function getRequirementIcon(
    status
) {

    const icons = {

        satisfied: "✓",

        required: "↑",

        reviewing: "◷",

        rejected: "!",

        expired: "!",

        replacement_required: "↻"

    };

    return icons[status] || "•";
}


/* =========================================================
   MESSAGE
   ========================================================= */

function showRequirementMessage(
    message
) {

    console.log(
        "LORDBLESS ADMIN:",
        message
    );

    /*
     * Temporary implementation.
     * Replace with the Admin notification/toast system.
     */

    alert(message);
}


/* =========================================================
   SAFE HTML
   ========================================================= */

function escapeRequirementHtml(
    value
) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   GLOBAL ADMIN BRIDGE
   ========================================================= */

window.LORDBLESS_REQUIREMENT_MANAGER = {

    state:
        LORDBLESS_REQUIREMENT_MANAGER_STATE,

    statuses:
        LORDBLESS_REQUIREMENT_STATUS,

    initialise:
        initialiseRequirementManager,

    build:
        buildAdminRequirements,

    render:
        renderRequirementManager,

    requestDocument:
        requestRequirementDocument,

    requestReplacement:
        requestRequirementReplacement,

    remove:
        removeRequirement,

    add:
        openAddRequirementDialog

};