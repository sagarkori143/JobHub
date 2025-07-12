// test-resend-email.js
import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function main() {
  try {
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev', // or your verified sender
      to: 'sagarkoriup11@gmail.com',    // replace with your email
      subject: 'Test Email from Resend',
      html: '<p>This is a <strong>test email</strong> sent directly using Resend API.</p>',
    });
    console.log('Email sent result:', result);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

main();