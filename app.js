const express = require("express");

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

// -------------------------
// Validate Environment
// -------------------------
if (!VERIFY_TOKEN || !ACCESS_TOKEN || !PHONE_NUMBER_ID) {
    console.error("❌ Missing environment variables");

    console.error({
        VERIFY_TOKEN: !!VERIFY_TOKEN,
        ACCESS_TOKEN: !!ACCESS_TOKEN,
        PHONE_NUMBER_ID: !!PHONE_NUMBER_ID
    });

    process.exit(1);
}

// -------------------------
// Webhook Verification
// -------------------------
app.get("/", (req, res) => {

    console.log("Webhook verification request received");

    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    console.log({
        mode,
        receivedToken: token ? "YES" : "NO",
        challenge
    });

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("✅ Webhook verified successfully");
        return res.status(200).send(challenge);
    }

    console.log("❌ Webhook verification failed");

    return res.sendStatus(403);
});

// -------------------------
// Receive WhatsApp Messages
// -------------------------
app.post("/", async (req, res) => {

    try {

        console.log("========== NEW WEBHOOK ==========");
        console.log(JSON.stringify(req.body, null, 2));

        const value = req.body?.entry?.[0]?.changes?.[0]?.value;

        if (!value?.messages?.length) {
            console.log("ℹ️ No incoming message event");
            return res.sendStatus(200);
        }

        const message = value.messages[0];
        const sender = message.from;

        console.log("📩 Message received from:", sender);
        console.log("📱 PHONE_NUMBER_ID:", PHONE_NUMBER_ID);
        console.log("🔑 ACCESS_TOKEN loaded:", !!ACCESS_TOKEN);

        const graphUrl = `https://graph.facebook.com/v23.0/${PHONE_NUMBER_ID}/messages`;

        console.log("🌐 Graph URL:", graphUrl);

        const payload = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: sender,
            type: "text",
            text: {
                body: `Hello 👋 Welcome to Trio Technologies.

Thank you for contacting us.

How can I help you today?`
            }
        };

        console.log("📤 Payload:");
        console.log(JSON.stringify(payload, null, 2));

        const response = await fetch(graphUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${ACCESS_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

    
        const responseText = await response.text();

console.log("Status:", response.status);
console.log("Response:");
console.log(responseText);

        if (!response.ok) {
            console.error("❌ WhatsApp API Error");
        } else {
            console.log("✅ Reply sent successfully");
        }

    } catch (error) {

        console.error("❌ Webhook processing error");
        console.error(error);

    }

    return res.sendStatus(200);
});

// -------------------------
// Health Check
// -------------------------
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "UP",
        service: "trio-messaging",
        timestamp: new Date().toISOString()
    });
});

// -------------------------
// Start Server
// -------------------------
app.listen(PORT, () => {

    console.log("====================================");
    console.log(`🚀 Server running on port ${PORT}`);

    console.log({
        VERIFY_TOKEN: VERIFY_TOKEN ? "Loaded" : "Missing",
        ACCESS_TOKEN: ACCESS_TOKEN ? "Loaded" : "Missing",
        PHONE_NUMBER_ID
    });

    console.log("====================================");

});
