/**
 * Beautiful Email Templates for Ring-0
 * 
 * Professional HTML email templates with consistent branding
 */

interface EmailTemplateData {
  username?: string;
  resetLink?: string;
  orderNumber?: string;
  productName?: string;
  licenseKey?: string;
  amount?: string;
  expiresAt?: string;
}

const BRAND_COLORS = {
  primary: '#6b7280',
  primaryDark: '#1e40af',
  background: '#0a0a0a',
  surface: '#1a1a1a',
  text: '#ffffff',
  textMuted: '#9ca3af',
};

const BASE_STYLES = `
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: ${BRAND_COLORS.text};
      background-color: ${BRAND_COLORS.background};
      margin: 0;
      padding: 0;
    }
    
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: ${BRAND_COLORS.surface};
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
    }
    
    .header {
      background: linear-gradient(135deg, ${BRAND_COLORS.primary} 0%, ${BRAND_COLORS.primaryDark} 100%);
      padding: 32px 24px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    
    .header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
      opacity: 0.3;
    }
    
    .logo {
      font-size: 28px;
      font-weight: 700;
      color: white;
      margin: 0;
      position: relative;
      z-index: 1;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
    
    .content {
      padding: 32px 24px;
      background-color: ${BRAND_COLORS.surface};
    }
    
    .greeting {
      font-size: 18px;
      font-weight: 600;
      color: ${BRAND_COLORS.text};
      margin: 0 0 16px 0;
    }
    
    .message {
      font-size: 16px;
      color: ${BRAND_COLORS.textMuted};
      margin: 0 0 24px 0;
    }
    
    .button {
      display: inline-block;
      background: linear-gradient(135deg, ${BRAND_COLORS.primary} 0%, ${BRAND_COLORS.primaryDark} 100%);
      color: white !important;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
      transition: all 0.3s ease;
      margin: 8px 0;
    }
    
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4);
    }
    
    .info-box {
      background-color: ${BRAND_COLORS.background};
      border: 1px solid rgba(37, 99, 235, 0.2);
      border-radius: 12px;
      padding: 20px;
      margin: 24px 0;
    }
    
    .license-key {
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 14px;
      background-color: ${BRAND_COLORS.background};
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 12px;
      color: ${BRAND_COLORS.text};
      word-break: break-all;
      text-align: center;
      font-weight: 600;
      letter-spacing: 1px;
    }
    
    .footer {
      background-color: ${BRAND_COLORS.background};
      padding: 24px;
      text-align: center;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .footer-text {
      font-size: 14px;
      color: ${BRAND_COLORS.textMuted};
      margin: 0;
    }
    
    .footer-links {
      margin-top: 16px;
    }
    
    .footer-link {
      color: ${BRAND_COLORS.primary};
      text-decoration: none;
      margin: 0 12px;
      font-size: 14px;
    }
    
    .warning {
      background-color: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.3);
      border-radius: 8px;
      padding: 16px;
      margin: 16px 0;
      color: #fbbf24;
      font-size: 14px;
    }
    
    @media (max-width: 600px) {
      .container {
        margin: 0 16px;
        border-radius: 12px;
      }
      
      .header, .content, .footer {
        padding: 24px 20px;
      }
      
      .button {
        display: block;
        width: 100%;
        box-sizing: border-box;
      }
    }
  </style>
`;

export function createPasswordResetEmail(data: EmailTemplateData): string {
  const { username = 'there', resetLink = '#' } = data;
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Ring-0 Password</title>
      ${BASE_STYLES}
    </head>
    <body style="background-color: ${BRAND_COLORS.background}; padding: 20px 0;">
      <div class="container">
        <div class="header">
          <h1 class="logo">🔥 Ring-0</h1>
        </div>
        
        <div class="content">
          <h2 class="greeting">Hi ${username}!</h2>
          
          <p class="message">
            You requested a password reset for your Ring-0 account. No worries, it happens to the best of us!
          </p>
          
          <p class="message">
            Click the button below to create a new password:
          </p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetLink}" class="button">Reset My Password</a>
          </div>
          
          <div class="warning">
            <strong>⏰ This link expires in 1 hour</strong><br>
            For security reasons, this reset link will only work for the next 60 minutes.
          </div>
          
          <p class="message">
            If you didn't request this password reset, you can safely ignore this email. Your account remains secure.
          </p>
          
          <p class="message">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${resetLink}" style="color: ${BRAND_COLORS.primary}; word-break: break-all;">${resetLink}</a>
          </p>
        </div>
        
        <div class="footer">
          <p class="footer-text">
            Need help? Contact our support team anytime.
          </p>
          <div class="footer-links">
            <a href="https://discord.gg/ring-0" class="footer-link">Discord Support</a>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://ring-0cheats.org'}" class="footer-link">Visit Store</a>
          </div>
          <p class="footer-text" style="margin-top: 16px;">
            © 2025 Ring-0. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function createLicenseDeliveryEmail(data: EmailTemplateData): string {
  const { 
    username = 'there', 
    orderNumber = 'N/A', 
    productName = 'Digital Product',
    licenseKey = 'XXXX-XXXX-XXXX-XXXX',
    amount = '$0.00',
    expiresAt
  } = data;
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Ring-0 License Key</title>
      ${BASE_STYLES}
      <style>
        .success-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 24px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
        }
        
        .checkmark {
          width: 40px;
          height: 40px;
          border: 4px solid white;
          border-radius: 50%;
          position: relative;
        }
        
        .checkmark::after {
          content: '';
          position: absolute;
          left: 8px;
          top: 3px;
          width: 12px;
          height: 20px;
          border: solid white;
          border-width: 0 4px 4px 0;
          transform: rotate(45deg);
        }
        
        .discord-button {
          display: inline-block;
          background: linear-gradient(135deg, #5865F2 0%, #4752C4 100%);
          color: white !important;
          text-decoration: none;
          padding: 16px 32px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 16px;
          text-align: center;
          box-shadow: 0 4px 12px rgba(88, 101, 242, 0.3);
          transition: all 0.3s ease;
          margin: 8px 0;
        }
        
        .discord-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(88, 101, 242, 0.4);
        }
        
        .key-container {
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%);
          border: 2px solid rgba(37, 99, 235, 0.3);
          border-radius: 16px;
          padding: 24px;
          margin: 24px 0;
          position: relative;
          overflow: hidden;
        }
        
        .key-container::before {
          content: '🔑';
          position: absolute;
          top: -10px;
          right: -10px;
          font-size: 80px;
          opacity: 0.1;
        }
        
        .feature-list {
          background-color: ${BRAND_COLORS.background};
          border: 1px solid rgba(37, 99, 235, 0.2);
          border-radius: 12px;
          padding: 20px;
          margin: 24px 0;
        }
        
        .feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .feature-item:last-child {
          border-bottom: none;
        }
        
        .feature-icon {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, ${BRAND_COLORS.primary} 0%, ${BRAND_COLORS.primaryDark} 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
      </style>
    </head>
    <body style="background-color: ${BRAND_COLORS.background}; padding: 20px 0;">
      <div class="container">
        <div class="header">
          <h1 class="logo">🔥 Ring-0</h1>
        </div>
        
        <div class="content">
          <div class="success-icon">
            <div class="checkmark"></div>
          </div>
          
          <h2 class="greeting" style="text-align: center; font-size: 24px; margin-bottom: 8px;">
            Payment Successful! 🎉
          </h2>
          
          <p class="message" style="text-align: center; font-size: 18px;">
            Thanks for your purchase, <strong>${username}</strong>!
          </p>
          
          <p class="message" style="text-align: center;">
            Your order has been processed and your license key is ready to use.
          </p>
          
          <div class="info-box">
            <h3 style="color: ${BRAND_COLORS.text}; margin: 0 0 16px 0; font-size: 18px; text-align: center;">📦 Order Details</h3>
            <table style="width: 100%; color: ${BRAND_COLORS.textMuted};">
              <tr>
                <td style="padding: 8px 0;"><strong>Order Number:</strong></td>
                <td style="padding: 8px 0; text-align: right; font-family: monospace;">${orderNumber}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Product:</strong></td>
                <td style="padding: 8px 0; text-align: right;">${productName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Amount Paid:</strong></td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #10b981;">$${amount}</td>
              </tr>
            </table>
          </div>
          
          <div class="key-container">
            <h3 style="color: ${BRAND_COLORS.text}; margin: 0 0 16px 0; font-size: 18px; text-align: center;">🔑 Your License Key</h3>
            <div class="license-key" style="font-size: 16px; padding: 16px;">
              ${licenseKey}
            </div>
            <p style="text-align: center; color: ${BRAND_COLORS.textMuted}; font-size: 14px; margin: 12px 0 0 0;">
              💾 Save this key - you'll need it to activate your cheat
            </p>
          </div>
          
          ${expiresAt ? `
            <div class="warning">
              <strong>⏰ License Expires:</strong> ${new Date(expiresAt).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          ` : ''}
          
          <div class="feature-list">
            <h3 style="color: ${BRAND_COLORS.text}; margin: 0 0 16px 0; font-size: 18px;">🚀 Next Steps</h3>
            
            <div class="feature-item">
              <div class="feature-icon">1</div>
              <div style="color: ${BRAND_COLORS.textMuted};">
                <strong style="color: ${BRAND_COLORS.text};">Download the Cheat</strong><br>
                <span style="font-size: 14px;">Visit your account dashboard to download</span>
              </div>
            </div>
            
            <div class="feature-item">
              <div class="feature-icon">2</div>
              <div style="color: ${BRAND_COLORS.textMuted};">
                <strong style="color: ${BRAND_COLORS.text};">Join Our Discord</strong><br>
                <span style="font-size: 14px;">Get support, updates, and connect with the community</span>
              </div>
            </div>
            
            <div class="feature-item">
              <div class="feature-icon">3</div>
              <div style="color: ${BRAND_COLORS.textMuted};">
                <strong style="color: ${BRAND_COLORS.text};">Activate Your License</strong><br>
                <span style="font-size: 14px;">Follow the setup guide for your specific game</span>
              </div>
            </div>
            
            <div class="feature-item">
              <div class="feature-icon">4</div>
              <div style="color: ${BRAND_COLORS.textMuted};">
                <strong style="color: ${BRAND_COLORS.text};">Start Dominating</strong><br>
                <span style="font-size: 14px;">Enjoy your undetected cheat and have fun!</span>
              </div>
            </div>
          </div>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="https://discord.gg/ring-0" class="discord-button">
              💬 Join Discord Server
            </a>
          </div>
          
          <div style="text-align: center; margin: 24px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://ring-0cheats.org'}/account" class="button">
              📱 View My Account
            </a>
          </div>
          
          <div style="background-color: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
            <p style="color: #10b981; margin: 0; font-size: 16px;">
              <strong>✨ Pro Tip:</strong> Join our Discord for exclusive updates, giveaways, and 24/7 support!
            </p>
          </div>
          
          <p class="message" style="font-size: 14px; text-align: center;">
            Keep this email safe! You can always access your license key from your account dashboard.
          </p>
        </div>
        
        <div class="footer">
          <p class="footer-text">
            Need help getting started? Our community is here to help!
          </p>
          <div class="footer-links">
            <a href="https://discord.gg/ring-0" class="footer-link">Join Discord</a>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://ring-0cheats.org'}/guides" class="footer-link">Setup Guides</a>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://ring-0cheats.org'}/account" class="footer-link">My Account</a>
          </div>
          <p class="footer-text" style="margin-top: 16px;">
            © 2025 Ring-0. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function createWelcomeEmail(data: EmailTemplateData): string {
  const { username = 'there' } = data;
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Ring-0</title>
      ${BASE_STYLES}
    </head>
    <body style="background-color: ${BRAND_COLORS.background}; padding: 20px 0;">
      <div class="container">
        <div class="header">
          <h1 class="logo">🔥 Ring-0</h1>
        </div>
        
        <div class="content">
          <h2 class="greeting">Welcome to Ring-0, ${username}! 🎮</h2>
          
          <p class="message">
            Thanks for joining the Ring-0 community! You're now part of thousands of gamers who trust us for the best cheats and hacks.
          </p>
          
          <div class="info-box">
            <h3 style="color: ${BRAND_COLORS.text}; margin: 0 0 16px 0;">What's Next?</h3>
            <ul style="color: ${BRAND_COLORS.textMuted}; padding-left: 20px; margin: 0;">
              <li>Browse our collection of undetected cheats</li>
              <li>Join our Discord community for support</li>
              <li>Check out our setup guides</li>
              <li>Follow us for the latest updates</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://ring-0cheats.org'}/store" class="button">
              Browse Cheats
            </a>
          </div>
          
          <p class="message">
            <strong>Why choose Ring-0?</strong>
          </p>
          <ul style="color: ${BRAND_COLORS.textMuted}; padding-left: 20px;">
            <li>🛡️ Undetected cheats with regular updates</li>
            <li>⚡ Instant delivery and activation</li>
            <li>🎯 24/7 community support</li>
            <li>💎 Premium features and customization</li>
          </ul>
        </div>
        
        <div class="footer">
          <p class="footer-text">
            Ready to dominate? Start browsing our cheats now!
          </p>
          <div class="footer-links">
            <a href="https://discord.gg/ring-0" class="footer-link">Discord</a>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://ring-0cheats.org'}/store" class="footer-link">Store</a>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://ring-0cheats.org'}/guides" class="footer-link">Guides</a>
          </div>
          <p class="footer-text" style="margin-top: 16px;">
            © 2025 Ring-0. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}