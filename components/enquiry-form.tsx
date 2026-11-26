'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { track } from '../lib/analytics';
import { captureAttribution } from '../lib/attribution';
import { course, statuses } from '../lib/course';

type Errors = Record<string, string>;
type Result = { ok?: boolean; created?: boolean; local?: boolean; message?: string; errors?: Errors };

const fields = [
  { name: 'name', label: 'Full name', type: 'text', autoComplete: 'name', maxLength: 100 },
  { name: 'phone', label: 'Mobile number', type: 'tel', autoComplete: 'tel', maxLength: 25 },
  { name: 'email', label: 'Email address', type: 'email', autoComplete: 'email', maxLength: 254 },
  { name: 'status', label: 'Professional status' },
  { name: 'city', label: 'City', type: 'text', autoComplete: 'address-level2', maxLength: 80 },
] as const;

export function EnquiryForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  const attribution = useRef<ReturnType<typeof captureAttribution> | null>(null);
  const started = useRef(false);
  const inFlight = useRef(false);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const errors = result?.errors ?? {};

  useEffect(() => {
    attribution.current = captureAttribution(window);
  }, []);

  useEffect(() => {
    if (!result) return;
    const invalid = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
    (invalid ?? messageRef.current)?.focus();
  }, [result]);

  function start() {
    if (started.current) return;
    started.current = true;
    track('form_start');
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    start();
    inFlight.current = true;
    setPending(true);
    setResult(null);

    const form = new FormData(event.currentTarget);
    const values = Object.fromEntries(form);
    try {
      const response = await fetch(course.submission.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, consent: values.consent === 'yes', attribution: attribution.current ?? captureAttribution(window) }),
      });
      const outcome: Result = await response.json();
      if (response.ok && outcome.ok === true && typeof outcome.created === 'boolean') {
        setResult(outcome);
        if (outcome.created) track('form_submit_success');
      } else {
        track('form_submit_error', { reason: response.status === 422 ? 'validation' : response.status === 429 ? 'rate_limit' : 'delivery' });
        setResult({ message: outcome.message || 'We couldn’t confirm your enquiry. Please try again.', errors: outcome.errors });
      }
    } catch {
      track('form_submit_error', { reason: 'delivery' });
      setResult({ message: 'We couldn’t confirm your enquiry. Check your connection and try again.' });
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }

  if (result?.ok) {
    return (
      <div className="enquiry-card form-success" tabIndex={-1} ref={messageRef} role="status">
        <h3>{result.created ? 'Enquiry received.' : 'Enquiry already received.'}</h3>
        <p>{result.local ? 'Your test enquiry is saved in this local preview.' : 'VLS Law Academy has received your details for the Civil Procedure & Civil Trial module.'}</p>
      </div>
    );
  }

  return (
    <form className="enquiry-card" ref={formRef} method="post" action={course.submission.endpoint} noValidate onSubmit={submit} onChange={start} aria-labelledby="form-title" aria-busy={pending}>
      <h3 id="form-title">Request course details</h3>
      <noscript><p className="form-notice">Enable JavaScript to use this form, or <a href={`tel:${course.contact.phone}`}>call admissions</a>.</p></noscript>
      {result?.message && <div tabIndex={-1} ref={messageRef} className="form-error" role="alert">{result.message}</div>}
      <div className="form-grid">
        {fields.map(field => (
          <div className="field" key={field.name}>
            <label htmlFor={field.name}>{field.label}</label>
            {'type' in field ? (
              <input id={field.name} name={field.name} type={field.type} autoComplete={field.autoComplete} maxLength={field.maxLength} required aria-invalid={Boolean(errors[field.name])} aria-describedby={errors[field.name] ? `${field.name}-error` : undefined} />
            ) : (
              <div className="select-field">
                <select id={field.name} name={field.name} defaultValue="" required aria-invalid={Boolean(errors[field.name])} aria-describedby={errors[field.name] ? `${field.name}-error` : undefined}>
                  <option value="" disabled>Select your status</option>
                  {statuses.map(status => <option key={status}>{status}</option>)}
                </select>
              </div>
            )}
            {errors[field.name] && <p className="field-error" id={`${field.name}-error`}>{errors[field.name]}</p>}
          </div>
        ))}
      </div>
      <div className="trap" aria-hidden="true">
        <label htmlFor="website">Leave this field empty</label>
        <input id="website" name="website" autoComplete="off" tabIndex={-1} />
      </div>
      <div>
        <label className="consent">
          <input type="checkbox" name="consent" value="yes" required aria-invalid={Boolean(errors.consent)} aria-describedby={errors.consent ? 'consent-error' : undefined} />
          <span>I agree that VLS Law Academy may contact me about this course.</span>
        </label>
        {errors.consent && <p className="field-error" id="consent-error">{errors.consent}</p>}
      </div>
      <button type="submit" className="button button-primary" disabled={pending}>{pending ? 'Sending enquiry…' : 'Get Course Details'}</button>
      <p className="form-notice">Your details are used to respond to your enquiry. <a href={course.contact.privacy}>Privacy Policy</a></p>
    </form>
  );
}
