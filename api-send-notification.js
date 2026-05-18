// api/send-notification.js
// This file goes in your Vercel project's /api folder

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { visitorEmail, code, subject, message } = req.body;

    // Validate required fields
    if (!visitorEmail || !code || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Send confirmation email to visitor
    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@yourdomain.com',
      to: visitorEmail,
      subject: `We received your thought: "${subject}"`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
              .content { background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
              .code-box { background: white; padding: 16px; text-align: center; border: 2px solid #667eea; border-radius: 8px; font-weight: bold; font-size: 24px; letter-spacing: 2px; margin: 20px 0; color: #667eea; }
              .footer { text-align: center; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>Thank you for your thought!</h2>
              </div>
              
              <div class="content">
                <p>Hi there,</p>
                <p>We've received your message about <strong>"${subject}"</strong>. We really appreciate you taking the time to share your thoughts with us.</p>
                
                <p><strong>Your conversation key:</strong></p>
                <div class="code-box">${code}</div>
                
                <p>Keep this key safe! You can use it to check back on this conversation anytime. We'll remember you.</p>
                
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                
                <p><strong>Your message:</strong></p>
                <blockquote style="border-left: 4px solid #667eea; padding-left: 16px; color: #666;">
                  ${message}
                </blockquote>
              </div>

              <div class="footer">
                <p>If you have any questions, feel free to reply to this email.</p>
                <p>&copy; ${new Date().getFullYear()} Connect. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `
    });

    // Send notification to admin
    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@yourdomain.com',
      to: process.env.ADMIN_EMAIL,
      subject: `New message from visitor (${code}): ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #667eea; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
              .meta { background: #f3f4f6; padding: 12px; border-radius: 6px; margin-bottom: 20px; font-size: 14px; }
              .content { background: #fafbfc; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; }
              .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>New Message Received 🎉</h2>
              </div>
              
              <div class="meta">
                <p><strong>Visitor Code:</strong> ${code}</p>
                <p><strong>Visitor Email:</strong> ${visitorEmail}</p>
                <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
              </div>

              <div class="content">
                <h3>${subject}</h3>
                <p>${message}</p>
              </div>

              <div class="footer">
                <p>Reply to this email to reach the visitor at ${visitorEmail}</p>
              </div>
            </div>
          </body>
        </html>
      `
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Email notifications sent successfully' 
    });

  } catch (error) {
    console.error('Email error:', error);
    return res.status(500).json({ 
      error: 'Failed to send notifications',
      details: error.message 
    });
  }
}
