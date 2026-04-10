export default function handler(req, res) {
  // SOFORT antworten (wichtig für Mailchimp)
  res.status(200).send("OK");

  // Alles danach asynchron (Fehler egal)
  try {
    const body = req.body || {};

    const raw = body?.data;
    let data;

    try {
      data = typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch {
      data = raw;
    }

    const email = data?.email || data?.merges?.EMAIL;

    if (!email) return;

    const encoder = new TextEncoder();
    crypto.subtle.digest("SHA-256", encoder.encode(email.trim().toLowerCase()))
      .then(hashBuffer => {
        const hashedEmail = Array.from(new Uint8Array(hashBuffer))
          .map(b => b.toString(16).padStart(2, "0"))
          .join("");

        fetch("https://graph.facebook.com/v18.0/143867507903742/events?access_token=EAAWrelswP7QBRLuGQSirQrQbDrpZA08rEh71kVICbul7s4VPIChfZA734qlouWDRTXonzZATTyEkaQsIr8w9j5RvCRsVms2ZAXKxcZB0dA9NZB62VWwsetn79APuWwsXrfzvKhbXNXQPTnj5POSBpAEE0ba596q6TyaNgZCienxULhdZB68s5ay3dTnZA6VVy4S3MuwZDZD", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
        });
      });

  } catch (e) {
    // ABSOLUT IGNORIEREN
  }
}
