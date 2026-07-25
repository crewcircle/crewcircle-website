'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<null | 'success' | 'error'>(null);
  const [honeypot, setHoneypot] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot check — if filled, silently reject (bot trapped)
    if (honeypot) {
      setSubmitStatus('success');
      setFormData({ name: '', email: '', message: '' });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch('https://formsubmit.co/ajax/crewcircle@zohomail.com.au', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
          _captcha: 'false',
        }),
      });
      if (!response.ok) throw new Error('Submission failed');

      setSubmitStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div aria-live="polite" aria-atomic="true">
        {submitStatus === 'success' && (
          <div className="mb-6 p-4 bg-accent/10 border border-accent/30 rounded-lg">
            <p className="text-sm text-accent font-medium">
              Thanks for reaching out! We&apos;ll get back to you soon.
            </p>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
            <p className="text-sm text-destructive font-medium">
              Something went wrong. Please try again.
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Honeypot field — hidden from users, traps spam bots */}
        <div className="sr-only" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input
            type="text"
            id="website"
            name="website"
            value={honeypot}
            onChange={e => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
            Your name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring transition-all text-foreground placeholder:text-muted-foreground/60"
            placeholder="Enter your name"
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
            Email address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring transition-all text-foreground placeholder:text-muted-foreground/60"
            placeholder="you@yourbusiness.com.au"
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
            What do you need help with?
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring transition-all text-foreground placeholder:text-muted-foreground/60 resize-y"
            rows={5}
            placeholder="Tell us about your business and what you're trying to sort..."
            required
            disabled={isSubmitting}
          />
        </div>

        <Button
          type="submit"
          variant="default"
          size="xl"
          disabled={isSubmitting || !formData.name || !formData.email || !formData.message}
          className="w-full disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Sending...' : 'Send message'}
        </Button>
      </form>
    </div>
  );
}
