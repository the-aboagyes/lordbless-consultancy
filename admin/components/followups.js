/* =========================================
   LORDBLESS ADMIN
   FOLLOW-UP MANAGER
========================================= */


/* =========================================
   FOLLOW-UP UI
========================================= */

function renderFollowups(
    enquiry
) {

    const followups =
        enquiry.followups || [];


    return `

        <div class="detail-card full-width">

            <h3>
                Follow-up
            </h3>


            <div class="followup-list">

                ${
                    followups.length
                        ? followups
                            .map(
                                followup => `
                                    <div
                                        class="
                                            followup-item
                                            ${
                                                followup.completed
                                                    ? "completed"
                                                    : ""
                                            }
                                        "
                                    >

                                        <div>

                                            <strong>
                                                ${escapeHTML(
                                                    followup.date
                                                )}
                                            </strong>

                                            <div
                                                class="note-meta"
                                            >
                                                ${escapeHTML(
                                                    followup.note
                                                )}
                                            </div>

                                        </div>


                                        <button
                                            class="button button-secondary followup-complete"
                                            data-followup-id="${escapeHTML(
                                                followup.id
                                            )}"
                                        >

                                            ${
                                                followup.completed
                                                    ? "Completed"
                                                    : "Mark Complete"
                                            }

                                        </button>

                                    </div>
                                `
                            )
                            .join("")
                        : `
                            <div class="empty-state">
                                <div class="empty-state-text">
                                    No follow-ups scheduled.
                                </div>
                            </div>
                        `
                }

            </div>


            <div class="followup-composer">

                <input
                    id="followup-date"
                    class="filter-select"
                    type="date"
                >


                <input
                    id="followup-note"
                    class="search-input"
                    type="text"
                    placeholder="Follow-up note..."
                >


                <button
                    class="button"
                    id="add-followup"
                >
                    Schedule
                </button>

            </div>

        </div>

    `;

}


/* =========================================
   FOLLOW-UP EVENTS
========================================= */

function initialiseFollowups(
    enquiry
) {

    const addButton =
        document.getElementById(
            "add-followup"
        );


    const dateInput =
        document.getElementById(
            "followup-date"
        );


    const noteInput =
        document.getElementById(
            "followup-note"
        );


    if (
        !addButton ||
        !dateInput ||
        !noteInput
    ) {
        return;
    }


    addButton.addEventListener(
        "click",
        () => {

            const date =
                dateInput.value;

            const note =
                noteInput.value.trim();


            if (!date || !note) {
                return;
            }


            if (!Array.isArray(
                enquiry.followups
            )) {

                enquiry.followups = [];

            }


            enquiry.followups.push({

                id:
                    "FOLLOW-" +
                    Date.now(),

                date,

                note,

                completed: false

            });


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


    document
        .querySelectorAll(
            ".followup-complete"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        button.dataset.followupId;


                    const followup =
                        enquiry.followups.find(
                            item =>
                                item.id === id
                        );


                    if (!followup) {
                        return;
                    }


                    followup.completed =
                        !followup.completed;


                    if (
                        typeof openEnquiry ===
                        "function"
                    ) {

                        openEnquiry(
                            enquiry.reference
                        );

              a      }

                }
            );

        });

}