const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

// -------------------------
// Webhook Verification
// -------------------------
app.get("/", (req, res) => {
    console.log("GET request received");
    console.log(req.query);

    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    console.log("Mode:", mode);
    console.log("Received Token:", token);
    console.log("Expected Token:", VERIFY_TOKEN);

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

        const message =
            req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

        if (!message) {
            console.log("No message found.");
            return res.sendStatus(200);
        }

        const from = message.from;

        const phoneNumberId =
            req.body.entry[0].changes[0].value.metadata.phone_number_id;

        console.log("Message From:", from);
        console.log("Phone Number ID:", phoneNumberId);

        const response = await fetch(
            `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${ACCESS_TOKEN}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    messaging_product: "whatsapp",
                    to: from,
                    text: {
                        body: "Hello! 👋 Welcome to Trio Technologies.\n\nThank you for contacting us.\nHow can I help you today?"
                    }
                })
            }
        );

        const data = await response.json();

        console.log("Meta Response:");
        console.log(data);

        if (!response.ok) {
            console.error("Failed to send reply.");
        } else {
            console.log("✅ Reply sent successfully.");
        }

    } catch (err) {
        console.error("ERROR:");
        console.error(err);
    }

    res.sendStatus(200);
});

// -------------------------
// Health Check
// -------------------------
app.get("/health", (req, res) => {
    res.status(200).send("Server is running.");
});

// -------------------------
// Start Server
// -------------------------
app.listen(PORT, () => {
    console.log("=================================");
    console.log(`Server running on port ${PORT}`);
    console.log("VERIFY_TOKEN Loaded:", VERIFY_TOKEN ? "YES" : "NO");
    console.log("ACCESS_TOKEN Loaded:", ACCESS_TOKEN ? "YES" : "NO");
    console.log("=================================");
});
