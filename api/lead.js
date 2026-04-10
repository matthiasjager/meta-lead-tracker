export default async function handler(req, res) {
  try {
    // Mailchimp sendet x-www-form-urlencoded
    const raw = req.body;

    let data;

    // Falls Vercel es schon parsed
    if (typeof raw === "object" && raw.data) {
      data = typeof raw.data === "string" ? JSON.parse(raw.data) : raw.data;
    } else {
      // Fallback: manchmal kommt es als string
      data = raw;
    }

    const email =
      data?.email ||
      data?.merges?.EMAIL;

    // Immer OK zurückgeben für Mailchimp
    if (!email) {
      return res.status(200).json({ ok: true, message: "no email" });
    }

    // SHA256 Hash
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      encoder.encode(email.trim().toLowerCase())
    );

    const hashedEmail = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

    // Meta Call
    await fetch(
      "https://graph.facebook.com/v18.0/143867507903742/events?access_token=EAAWrelswP7QBRLuGQSirQrQbDrpZA08rEh71kVICbul7s4VPIChfZA734qlouWDRTXonzZATTyEkaQsIr8w9j5RvCRsVms2ZAXKxcZB0dA9NZB62VWwsetn79APuWwsXrfzvKhbXNXQPTnj5POSBpAEE0ba596q6TyaNgZCienxULhdZB68s5ay3dTnZA6VVy4S3MuwZDZD",
      {
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
      }
    );

    return res.status(200).json({ ok: true });

  } catch (e) {
    return res.status(200).json({ ok: true, error: e.message });
  }
}
