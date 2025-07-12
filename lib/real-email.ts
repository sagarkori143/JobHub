import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendRealEmail({ to, subject, text, html }: { to: string, subject: string, text: string, html?: string }) {
  return resend.emails.send({
    from: 'JobHub <noreply@yourdomain.com>', // Replace with your verified sender
    to,
    subject,
    text,
    html,
  });
} 