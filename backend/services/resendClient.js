const RESEND_API_BASE_URL = 'https://api.resend.com';

const normalizeRecipients = (value) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean).map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === 'string' && value.trim()) {
    return [value.trim()];
  }

  return [];
};

const getConfig = () => {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.NEWSLETTER_FROM_EMAIL || process.env.EMAIL_USER;
  return { apiKey, from };
};

const ensureConfigured = () => {
  const { apiKey, from } = getConfig();
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  if (!from) {
    throw new Error('NEWSLETTER_FROM_EMAIL (or EMAIL_USER) is not configured');
  }
  return { apiKey, from };
};

const buildError = (status, payloadText, payloadJson) => {
  const messageFromJson =
    payloadJson?.message ||
    payloadJson?.error?.message ||
    payloadJson?.error ||
    null;

  const error = new Error(
    messageFromJson || payloadText || `Resend API request failed with status ${status}`
  );
  error.status = status;
  error.payload = payloadJson || payloadText || null;
  error.code = payloadJson?.error?.name || payloadJson?.error?.type || null;
  return error;
};

const sendEmail = async ({ to, subject, html, headers = {} }) => {
  const recipients = normalizeRecipients(to);
  if (recipients.length === 0) {
    throw new Error('At least one recipient is required');
  }

  if (!subject || typeof subject !== 'string' || !subject.trim()) {
    throw new Error('Email subject is required');
  }

  if (!html || typeof html !== 'string' || !html.trim()) {
    throw new Error('Email html content is required');
  }

  const { apiKey, from } = ensureConfigured();

  const response = await fetch(`${RESEND_API_BASE_URL}/emails`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: recipients,
      subject: subject.trim(),
      html,
      headers,
    }),
  });

  const responseText = await response.text();
  let responseJson = null;
  try {
    responseJson = responseText ? JSON.parse(responseText) : null;
  } catch (_err) {
    responseJson = null;
  }

  if (!response.ok) {
    throw buildError(response.status, responseText, responseJson);
  }

  return {
    id: responseJson?.id || null,
    payload: responseJson,
  };
};

module.exports = {
  sendEmail,
  getConfig,
};
