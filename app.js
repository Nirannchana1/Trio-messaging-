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

    console.log("========== GET / ==========");
    console.log("Query:", req.query);

    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {

        console.log("✅ Webhook verified");

        return res.status(200).send(challenge);
    }

    console.log("ℹ️ Normal GET request");

    return res.status(200).send("Webhook is running");
});

// -------------------------
// Incoming Webhooks
// -------------------------
app.post("/", (req, res) => {

    console.log("========== POST WEBHOOK ==========");
    console.log(JSON.stringify(req.body, null, 2));

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

    console.log("--------------------------------");
    console.log(`Server running on port ${PORT}`);
    console.log({
        VERIFY_TOKEN: VERIFY_TOKEN ? "Loaded" : "Missing",
        ACCESS_TOKEN: ACCESS_TOKEN ? "Loaded" : "Missing",
        PHONE_NUMBER_ID
    });
    console.log("--------------------------------");

});
