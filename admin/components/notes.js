/* =========================================
   LORDBLESS ADMIN
   INTERNAL NOTES
========================================= */


/* =========================================
   NOTES UI
========================================= */

function renderNotes(
    enquiry
) {

    const notes =
        enquiry.notes || [];


    return `

        <div class="detail-card full-width">

            <h3>
                Internal Notes
            </h3>

            <div
                id="notes-list"
                class="notes-list"
            >

                ${
                    notes.length
                        ? notes
                            .map(
                                note => `
                                    <div class="note-item">

                                        <div class="note-text">
                                            ${escapeHTML(
                                                note.text
                                            )}
                                        </div>

                                        <div class="note-meta">
                                            ${formatDate(
                                                note.createdAt
                                            )}
                                        </div>

                                    </div>
                                `
                            )
                            .join("")
                        : `
                            <div class="empty-state">
                                <div class="empty-state-text">
                                    No internal notes yet.
                                </div>
                            </div>
                        `
                }

            </div>


            <div class="note-composer">

                <textarea
                    id="new-note"
                    class="note-input"
                    rows="4"
                    placeholder="Add an internal note..."
                ></textarea>


                <button
                    class="button"
                    id="add-note"
                >
                    Add Note
                </button>

            </div>

        </div>

    `;

}


/* =========================================
   NOTE EVENTS
========================================= */

function initialiseNotes(
    enquiry
) {

    const button =
        document.getElementById(
            "add-note"
        );

    const textarea =
        document.getElementById(
            "new-note"
        );


    if (!button || !textarea) {
        return;
    }


    button.addEventListener(
        "click",
        () => {

            const text =
                textarea.value.trim();


            if (!text) {
                return;
            }


            if (!Array.isArray(
                enquiry.notes
            )) {

                enquiry.notes = [];

            }


            enquiry.notes.push({

                id:
                    "NOTE-" +
                    Date.now(),

                text,

                createdAt:
                    new Date().toISOString()

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

}