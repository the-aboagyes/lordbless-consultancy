/* =========================================
   LORDBLESS ADMIN
   ENQUIRY DETAIL COMPONENT
========================================= */


/* =========================================
   OPEN ENQUIRY
========================================= */

function renderEnquiryDetail(
    enquiry
) {

    if (!enquiry) {

        return `

            <div class="empty-state">

                <div class="empty-state-title">
                    Enquiry not found
                </div>

            </div>

        `;

    }


    const serviceDetails =
        renderServiceSections(
            enquiry
        );


    return `

        <div class="enquiry-detail-page">

            <div class="detail-page-header">

                <div>

                    <div class="topbar-label">
                        ENQUIRY REFERENCE
                    </div>

                    <h2>
                        ${escapeHTML(
                            enquiry.reference
                        )}
                    </h2>

                </div>


                <div>

                    ${renderStatusBadge(
                        enquiry.status
                    )}

                </div>

            </div>


            <div class="detail-grid">


                <!-- CLIENT -->

                ${detailCard(
                    "Client Information",
                    [
                        [
                            "Name",
                            enquiry.client.fullName
                        ],
                        [
                            "Email",
                            enquiry.client.email
                        ],
                        [
                            "WhatsApp",
                            enquiry.client.whatsapp
                        ],
                        [
                            "Current Country",
                            enquiry.client.currentCountry
                        ],
                        [
                            "Nationality",
                            enquiry.client.nationality
                        ]
                    ]
                )}


                <!-- JOURNEY -->

                ${detailCard(
                    "Journey",
                    [
                        [
                            "Destination",
                            enquiry.journey.destination
                        ],
                        [
                            "Timeframe",
                            enquiry.journey.timeframe
                        ],
                        [
                            "Preferred Contact",
                            enquiry.journey.preferredContact
                        ],
                        [
                            "Additional Information",
                            enquiry.journey.additionalInformation
                        ]
                    ]
                )}


                <!-- STATUS -->

                <div class="detail-card">

                    <h3>
                        Workflow
                    </h3>

                    ${renderStatusSelector(
                        enquiry
                    )}

                </div>


                <!-- DATE -->

                ${detailCard(
                    "Enquiry Record",
                    [
                        [
                            "Reference",
                            enquiry.reference
                        ],
                        [
                            "Created",
                            formatDate(
                                enquiry.createdAt
                            )
                        ],
                        [
                            "Services",
                            formatServices(
                                enquiry.services
                            )
                        ]
                    ]
                )}


                ${serviceDetails}


                <!-- NOTES -->

                ${renderNotes(
                    enquiry
                )}


                <!-- FOLLOWUPS -->

                ${renderFollowups(
                    enquiry
                )}

            </div>

        </div>

    `;

}


/* =========================================
   SERVICE SECTIONS
========================================= */

function renderServiceSections(
    enquiry
) {

    const sections = [];


    if (
        enquiry.services.includes(
            "education"
        )
    ) {

        sections.push(
            detailCard(
                "Education",
                objectToRows(
                    enquiry.education
                )
            )
        );

    }


    if (
        enquiry.services.includes(
            "careers"
        )
    ) {

        sections.push(
            detailCard(
                "Careers",
                objectToRows(
                    enquiry.careers
                )
            )
        );

    }


    if (
        enquiry.services.includes(
            "travel"
        )
    ) {

        sections.push(
            detailCard(
                "Travel",
                objectToRows(
                    enquiry.travel
                )
            )
        );

    }


    if (
        enquiry.services.includes(
            "business"
        )
    ) {

        sections.push(
            detailCard(
                "Business",
                objectToRows(
                    enquiry.business
                )
            )
        );

    }


    if (
        enquiry.services.includes(
            "mobility"
        )
    ) {

        sections.push(
            detailCard(
                "LORDBLESS GOLD SERVICES",
                objectToRows(
                    enquiry.mobility
                )
            )
        );

    }


    if (
        enquiry.services.includes(
            "unsure"
        )
    ) {

        sections.push(
            detailCard(
                "General / Not Sure Yet",
                objectToRows(
                    enquiry.general
                )
            )
        );

    }


    return sections.join("");

}