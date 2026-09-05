import type { SupabaseClient } from "@supabase/supabase-js";

export const ADVERTISING_AGREEMENT_VERSION = "2026-09-05";
export const ADVERTISING_AGREEMENT_LAST_UPDATED = "September 5, 2026";

export const ADVERTISING_AGREEMENT_TEXT = `Advertising Terms/Agreement
Version: ${ADVERTISING_AGREEMENT_VERSION}
Last updated: ${ADVERTISING_AGREEMENT_LAST_UPDATED}

Free listings stay free
A basic directory listing does not require payment. Purchasing advertising does not affect whether an accurate eligible business may appear in the free directory.

What an advertiser buys
The order identifies the placement, price, creative, destination, and start and end dates. Paid placements are labeled “Paid advertisement” or an equally clear disclosure. Advertising does not imply endorsement.

Content and approval
Advertisers must have rights to all supplied text, images, trademarks, and links. We may reject or remove deceptive, illegal, unsafe, discriminatory, infringing, or unverifiable content. Material changes require approval before publication.

Dates, changes, credits, rescheduling, and cancellation
Campaigns run only during their scheduled dates after payment and approval. A request for advertising credit or rescheduling must be submitted within the first 3 calendar days of the agreed advertising period. Every request is subject to approval and is not automatically guaranteed. After the first 3 calendar days, no advertising credit or rescheduling will be granted. Any approved advertising credit must be used within 6 months of the original advertising start date or it will be forfeited. Rescheduled advertising remains subject to placement availability. The separate full-refund policy in the advertiser's written order or agreement remains in effect.

Reporting and results
Reports may include recorded impressions and clicks. Counts are best-effort measurements and may exclude blocked, duplicate, automated, or failed requests. No sales, revenue, traffic, or ranking result is guaranteed.

Privacy
Advertising measurement is governed by our Privacy Policy. Advertisers must handle visitors sent to their own sites under their own privacy practices.`;

type CampaignAgreement = {
  id: string;
  contact_email: string | null;
  contact_name: string | null;
  start_date: string;
  booked_duration_days: number | null;
  businesses: { name: string } | { name: string }[] | null;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function deliverAdvertisingAgreement(
  db: SupabaseClient,
  campaign: CampaignAgreement,
  options: { retryOf?: string } = {},
) {
  const recipient = String(campaign.contact_email || "").trim().toLowerCase();
  if (!emailPattern.test(recipient) || recipient.length > 254) {
    return { ok: false, reason: "A valid advertiser email address is required." };
  }
  const business = Array.isArray(campaign.businesses) ? campaign.businesses[0] : campaign.businesses;
  const deliveryKey = options.retryOf
    ? `${campaign.id}:${ADVERTISING_AGREEMENT_VERSION}:retry:${crypto.randomUUID()}`
    : `${campaign.id}:${ADVERTISING_AGREEMENT_VERSION}:initial`;
  const { data: delivery, error: insertError } = await db.from("advertising_agreement_deliveries").insert({
    campaign_id: campaign.id,
    recipient_email: recipient,
    agreement_version: ADVERTISING_AGREEMENT_VERSION,
    agreement_last_updated: "2026-09-05",
    agreement_snapshot: ADVERTISING_AGREEMENT_TEXT,
    delivery_key: deliveryKey,
    retry_of: options.retryOf || null,
    status: "pending",
  }).select("id,status").single();
  if (insertError?.code === "23505") return { ok: true, duplicate: true };
  if (insertError || !delivery) {
    console.error("Agreement delivery record could not be created", { code: insertError?.code || "unknown" });
    return { ok: false, reason: "Delivery history could not be created." };
  }

  const key = process.env.RESEND_API_KEY;
  let status: "sent" | "failed" = "failed";
  let providerMessageId: string | null = null;
  let failureReason: string | null = null;
  if (!key) failureReason = "Email service is not configured.";
  else {
    try {
      const from = process.env.INQUIRY_FROM_EMAIL || "Heber-Overgaard Visitor Guide <listings@visitheberovergaard.com>";
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to: [recipient],
          subject: `Your TownGuide Advertising Agreement — ${ADVERTISING_AGREEMENT_VERSION}`,
          text: `Hello ${campaign.contact_name || business?.name || "Advertiser"},\n\nHere is the complete Advertising Terms/Agreement you accepted for ${business?.name || "your business"}.\n\nAdvertising start date: ${campaign.start_date}\nAdvertising period: ${campaign.booked_duration_days || "Agreed campaign"}${campaign.booked_duration_days ? " days" : ""}\nAgreement version: ${ADVERTISING_AGREEMENT_VERSION}\n\n${ADVERTISING_AGREEMENT_TEXT}\n\nPlease retain this email for your records.`,
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(8_000),
      });
      const result = await response.json().catch(() => ({})) as { id?: string };
      if (response.ok && result.id) {
        status = "sent";
        providerMessageId = result.id;
      } else failureReason = `Provider rejected the message (HTTP ${response.status}).`;
    } catch (error) {
      failureReason = `Delivery request failed (${error instanceof Error ? error.name : "unknown_error"}).`;
    }
  }
  await db.from("advertising_agreement_deliveries").update({
    status,
    sent_at: status === "sent" ? new Date().toISOString() : null,
    provider_message_id: providerMessageId,
    failure_reason: failureReason,
  }).eq("id", delivery.id);
  if (status === "failed") console.error("Advertising agreement delivery failed", { campaignId: campaign.id, deliveryId: delivery.id });
  return { ok: status === "sent", deliveryId: delivery.id, reason: failureReason || undefined };
}
