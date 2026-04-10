export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("OK");
  }

  try {
    const body = req.body || {};

    // Mailchimp sendet Daten oft so:
    const email =
      body?.data?.email ||
      body?.data?.merges?.EMAIL ||
      body?.email;

    // Wenn keine Email → einfach OK zurückgeben (wichtig!)
    if (!email) {
      return res.status(200).json({ message: "No email, but OK" });
    }

    // Hash erstellen
    const encoder = new TextEncoder();
    const data = encoder.encode(email.trim().toLowerCase());
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedEmail = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    // Meta senden
    await fetch(
      "https://graph.facebook.com/v18.0/143867507903742/events?access_token=EAAWrelswP7QBRLuGQSirQrQbDrpZA08rEh71kVICbul7s4VPIChfZA734qlouWDRTXonzZATTyEkaQsIr8w9j5RvCRsVms2ZAXKxcZB0dA9NZB62VWwsetn79APuWwsXrfzvKhbXNXQPTnj5POSBpAEE0ba596q6TyaNgZCienxULhdZB68s5ay3dTnZA6VVy4S3MuwZDZD",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          data: [
            {
              event_name: "Lead",
              event_time: Math.floor(Date.now() / 1000),
              action_source: "website",
              user_data: {
                em: hashedEmail
              }
            }
          ]
        })
      }
    );

    return res.status(200).json({ success: true });

  } catch (error) {
    // GANZ WICHTIG: trotzdem 200 zurückgeben!
    return res.status(200).json({ error: error.message });
  }
}
