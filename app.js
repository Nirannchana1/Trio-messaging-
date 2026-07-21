const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

const PHONE_NUMBER_ID = "1197934803409131";


// -------------------------
// Webhook Verification
// -------------------------
app.get("/", (req, res) => {

    console.log("GET request received");
    console.log(req.query);

    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {

        console.log("✅ WEBHOOK VERIFIED");
        return res.status(200).send(challenge);

    }

    console.log("❌ Verification Failed");
    return res.sendStatus(403);

});


// -------------------------
// Receive WhatsApp Messages
// -------------------------
app.post("/", async (req, res) => {

    console.log("=================================");
    console.log("Incoming Webhook");
    console.log(JSON.stringify(req.body, null, 2));
    console.log("=================================");


    try {

        const value =
            req.body?.entry?.[0]?.changes?.[0]?.value;


        const message = value?.messages?.[0];


        // Ignore status updates
        if (!message) {

            console.log("No incoming message");
            return res.sendStatus(200);

        }


        const from = message.from;


        console.log("Message From:", from);
        console.log("Using Phone Number ID:", PHONE_NUMBER_ID);


        const response = await fetch(
            `https://graph.facebook.com/v23.0/${PHONE_NUMBER_ID}/messages`,
            {

                method: "POST",

                headers: {

                    Authorization: `Bearer ${ACCESS_TOKEN}`,
                    "Content-Type": "application/json"

                },


                body: JSON.stringify({

                    messaging_product: "whatsapp",

                    recipient_type: "individual",

                    to: from,

                    type: "text",

                    text: {

                        body:
                        "Hello! 👋 Welcome to Trio Technologies.\n\nThank you for contacting us.\nHow can I help you today?"

                    }

                })

            }
        );


        const data = await response.json();


        console.log("Meta Response:");
        console.log(JSON.stringify(data, null, 2));


        if (!response.ok) {

            console.error("❌ Failed to send reply");

        } else {

            console.log("✅ Reply sent successfully");

        }


    } catch(error) {

        console.error("ERROR:");
        console.error(error);

    }


    return res.sendStatus(200);

});



// -------------------------
// Health Check
// -------------------------
app.get("/health", (req,res)=>{

    res.status(200).send("Server is running");

});



// -------------------------
// Start Server
// -------------------------
app.listen(PORT,()=>{

    console.log("=================================");
    console.log(`Server running on port ${PORT}`);

    console.log(
        "VERIFY_TOKEN:",
        VERIFY_TOKEN ? "LOADED" : "MISSING"
    );

    console.log(
        "ACCESS_TOKEN:",
        ACCESS_TOKEN ? "LOADED" : "MISSING"
    );

    console.log(
        "PHONE_NUMBER_ID:",
        PHONE_NUMBER_ID
    );

    console.log("=================================");

});
