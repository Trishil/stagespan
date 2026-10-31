import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createInquiryDraft, CONTACT_EMAIL } from '../inquiry-utils.mjs';

const sample = { name: 'Sample Owner', email: 'owner@example.test', company: 'Sample Workshop', topic: 'Factory quote', message: 'We want to track orders and material consumption.' };
describe('Inquiry draft, without automatic submission', () => {
  it('addresses the owner and preserves all supplied details', () => {
    const draft = createInquiryDraft(sample);
    assert.equal(draft.recipient, CONTACT_EMAIL);
    assert.equal(CONTACT_EMAIL, 'trishilbalar92@gmail.com');
    for (const value of Object.values(sample)) assert.ok(draft.copyText.includes(value));
    const url = new URL(draft.mailto);
    assert.equal(url.protocol, 'mailto:');
    assert.equal(url.pathname, CONTACT_EMAIL);
    assert.equal(url.searchParams.get('body'), draft.body);
  });
  it('keeps subject fields on one line and encodes query delimiters', () => {
    const draft = createInquiryDraft({ ...sample, company: 'Oak & Co.\nBcc: nobody@example.test', message: 'A & B? #sample' });
    assert.ok(!draft.subject.includes('\n'));
    assert.equal(new URL(draft.mailto).searchParams.get('body'), draft.body);
    assert.ok(draft.body.includes('A & B? #sample'));
  });
  it('supports Unicode names and supplies a readable empty-message default', () => {
    const draft = createInquiryDraft({ ...sample, name: 'નમૂનો', message: '' });
    assert.ok(draft.copyText.includes('નમૂનો'));
    assert.ok(draft.body.includes('Please contact me'));
  });
  it('rejects incomplete or invalid contact details', () => {
    assert.throws(() => createInquiryDraft({ ...sample, company: '' }));
    assert.throws(() => createInquiryDraft({ ...sample, email: 'not-an-email' }));
    assert.throws(() => createInquiryDraft({ ...sample, message: 'x'.repeat(1001) }));
  });
  it('uses a safe topic when an unknown value is supplied', () => {
    assert.ok(createInquiryDraft({ ...sample, topic: '<script>unknown</script>' }).subject.includes('General inquiry'));
  });
});
