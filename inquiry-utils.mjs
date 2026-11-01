export const CONTACT_EMAIL = 'trishilbalar92@gmail.com';
export const INQUIRY_TOPICS = ['Product walkthrough', 'Workshop quote', 'Factory quote', 'Multi-site quote', 'General inquiry'];

/** Pure formatting only. This function never sends, stores or logs an inquiry. */
export function createInquiryDraft(fields) {
  const cleanLine = value => String(value || '').replace(/[\r\n]+/g, ' ').trim();
  const name = cleanLine(fields.name);
  const email = cleanLine(fields.email);
  const company = cleanLine(fields.company);
  if (!name || !company || !email) throw new Error('Please add your name, company and email.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Please check your email address.');
  if (name.length > 80 || company.length > 120 || email.length > 254) throw new Error('Please shorten the name, company or email field.');
  const message = String(fields.message || '').replace(/\r\n?/g, '\n').trim();
  if (message.length > 1000) throw new Error('Please keep your message within 1,000 characters.');
  const topic = INQUIRY_TOPICS.includes(fields.topic) ? fields.topic : 'General inquiry';
  const subject = `StageSpan — ${topic} — ${company}`;
  const body = `Hello Trishil,\n\nI’m interested in StageSpan for my factory.\n\nName: ${name}\nEmail: ${email}\nCompany: ${company}\nInterested in: ${topic}\n\n${message || 'Please contact me to discuss the next steps.'}\n\nThank you,\n${name}`;
  return {
    recipient: CONTACT_EMAIL, subject, body,
    mailto: `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    copyText: `To: ${CONTACT_EMAIL}\nSubject: ${subject}\n\n${body}`,
  };
}
