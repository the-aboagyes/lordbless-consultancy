/* =========================================
   LORDBLESS ADMIN
   STATUS MANAGER
========================================= */

const LORDBLESS_STATUS_LABELS = {

    new: "New",

    reviewing: "Reviewing",

    contacted: "Contacted",

    detailed_form: "Detailed Form",

    documents: "Documents",

    payment_pending: "Payment Pending",

    assessment: "Assessment",

    processing: "Processing",

    completed: "Completed",

    closed: "Closed",

    spam: "Spam"

};


/* =========================================
   STATUS BADGE
========================================= */

function renderStatusBadge(status) {

    const label =
        LORDBLESS_STATUS_LABELS[status] ||
        status;


    return `

        <span class="
            status
            status-${escapeHTML(status)}
        ">

            ${escapeHTML(label)}

        </span>

    `;

}


/* =========================================
   STATUS SELECT
========================================= */

function renderStatusSelector(
    enquiry
) {

    const statuses =
        LORDBLESS_MOCK_DATA.statuses;


    return `

        <div class="status-control">

            <label>
                Enquiry Status
            </label>

            <select
                class="filter-select"
                id="status-select"
                data-reference="${escapeHTML(
                    enquiry.reference
                )}"
            >

                ${statuses
                    .map(status => `

                        <option
                            value="${escapeHTML(status)}"
                            ${
                                enquiry.status === status
                                    ? "selected"
                                    : ""
                            }
                        >

                            ${escapeHTML(
                                LORDBLESS_STATUS_LABELS[
                                    status
                                ] || status
                            )}

                        </option>

                    `)
                    .join("")}

            </select>

        </div>

    `;

}


/* =========================================
   STATUS EVENT
========================================= */

function initialiseStatusManager(
    enquiry
) {

    const select =
        document.getElementById(
            "status-select"
        );


    if (!select) {
        return;
    }


    select.addEventListener(
        "change",
        event => {

            const newStatus =
                event.target.value;


            enquiry.status =
                newStatus;


            if (
                typeof renderEnquiries ===
                "function"
            ) {

                renderEnquiries();

            }


            if (
                typeof renderDashboard ===
                "function"
            ) {

                renderDashboard();

            }


            if (
                typeof openEnquiry ===
                "function"
            ) {

                openEnquiry(
                    enquiry.reference
                );

            }

        }
    );

}