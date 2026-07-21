const express = require("express");

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

// Webhook verification
app.get("/", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("WEBHOOK VERIFIED");
        return res.status(200).send(challenge);
    }

    res.sendStatus(403);
});

// Receive WhatsApp messages
app.post("/", async (req, res) => {

    console.log("Incoming webhook:");
    console.log(JSON.stringify(req.body, null, 2));

    try {

        const message =
            req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

        if (message) {

            const from = message.from;

            const phoneNumberId =
                req.body.entry[0].changes[0].value.metadata.phone_number_id;

            console.log("Message from:", from);

            await fetch(
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
                            body: "Hello! 👋 Welcome to Trio Technologies.\nHow can I help you today?"
                        }
                    })
                }
            );

            console.log("Reply sent.");
        }

    } catch (err) {
        console.error(err);
    }

    res.sendStatus(200);

});

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
