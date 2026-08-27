export type InquiryWebhookPayload = {
  inquiryId: string;
  inquiryType: string;
  category?: string;
  name: string;
  businessName?: string;
  email: string;
  phone?: string;
  message?: string;
  submittedAt: string;
  adminPath: string;
};

export async function sendInquiryWebhook(inquiry: InquiryWebhookPayload) {
  const url = process.env.ZAPIER_INQUIRY_WEBHOOK_URL;
  if (!url) return false;

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/+$/, "");
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        inquiry_id: inquiry.inquiryId,
        inquiry_type: inquiry.inquiryType,
        category: inquiry.category || null,
        name: inquiry.name,
        business_name: inquiry.businessName || null,
        email: inquiry.email,
        phone: inquiry.phone || null,
        message: inquiry.message || null,
        submitted_at: inquiry.submittedAt,
        admin_url: siteUrl ? `${siteUrl}${inquiry.adminPath}` : inquiry.adminPath,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) {
      console.error("Inquiry webhook delivery failed", { status: response.status });
      return false;
    }
    return true;
  } catch (error) {
    console.error("Inquiry webhook delivery failed", {
      reason: error instanceof Error ? error.name : "unknown_error",
    });
    return false;
  }
}
