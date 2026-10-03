/* =========================================
   LORDBLESS ADMIN
   MOCK DEVELOPMENT DATA
========================================= */

const LORDBLESS_MOCK_DATA = {

    enquiries: [

        {
            reference: "LBC-086CB44B33",

            desk: "germany_europe",

            client: {
                fullName: "LORDBLESS TEST CLIENT",
                email: "test@example.com",
                whatsapp: "+491234567890",
                currentCountry: "Germany",
                nationality: "Ghanaian"
            },

            services: ["education"],

            journey: {
                destination: "Germany",
                timeframe: "12-plus-months",
                additionalInformation: "TESTING",
                preferredContact: "Email"
            },

            education: {
                destination: "Germany",
                studyArea: "Medicine",
                studyLevel: "masters",
                firstProgramme: "Medicine",
                secondProgramme: "Nursing",
                preferredIntake: "September 2027"
            },

            careers: {},
            travel: {},
            business: {},
            mobility: {},
            general: {},

            status: "new",

            createdAt: "2026-09-16T01:30:00",

            notes: [],

            followups: []
        },


        {
            reference: "LBC-TEST-0002",

            desk: "germany_europe",

            client: {
                fullName: "KWAME MENSAH",
                email: "kwame@example.com",
                whatsapp: "+233201234567",
                currentCountry: "Ghana",
                nationality: "Ghanaian"
            },

            services: ["careers"],

            journey: {
                destination: "Germany",
                timeframe: "6-12-months",
                additionalInformation:
                    "Interested in healthcare opportunities.",
                preferredContact: "WhatsApp"
            },

            education: {},

            careers: {
                profession: "Medical Doctor",
                qualification: "MBBS",
                experience: "3 years",
                destination: "Germany",
                interest: "Medical employment"
            },

            travel: {},
            business: {},
            mobility: {},
            general: {},

            status: "reviewing",

            createdAt: "2026-09-15T15:20:00",

            notes: [
                {
                    id: "NOTE-001",
                    text: "Review qualification pathway.",
                    createdAt: "2026-09-15T16:00:00"
                }
            ],

            followups: [
                {
                    id: "FOLLOW-001",
                    date: "2026-09-18",
                    note:
                        "Contact client regarding qualification documents.",
                    completed: false
                }
            ]
        },


        {
            reference: "LBC-TEST-0003",

            desk: "china",

            client: {
                fullName: "AKOSUA ADU",
                email: "akosua@example.com",
                whatsapp: "+233501234567",
                currentCountry: "Ghana",
                nationality: "Ghanaian"
            },

            services: ["travel"],

            journey: {
                destination: "China",
                timeframe: "1-3-months",
                additionalInformation: "Business travel.",
                preferredContact: "Email"
            },

            education: {},
            careers: {},

            travel: {
                purpose: "Business",
                destination: "China",
                travelPeriod: "November 2026",
                travellers: "2",
                services: [
                    "Travel planning",
                    "Accommodation"
                ]
            },

            business: {},
            mobility: {},
            general: {},

            status: "contacted",

            createdAt: "2026-09-14T11:05:00",

            notes: [],

            followups: []
        }

    ],


    statuses: [
        "new",
        "reviewing",
        "contacted",
        "detailed_form",
        "documents",
        "payment_pending",
        "assessment",
        "processing",
        "completed",
        "closed",
        "spam"
    ]

};
    
