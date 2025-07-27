import nodemailer from 'nodemailer';

interface EmailConfig {
  from: string;
  to: string;
  subject: string;
  html: string;
}

// Create transporter using Gmail SMTP (free)
const createTransporter = () => {
  // Check if we have email credentials
  if (!process.env.EMAIL_APP_PASSWORD) {
    console.warn('EMAIL_APP_PASSWORD not set. Email notifications will be disabled.');
    return null;
  }

  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: 'dusk49255@gmail.com',
      pass: process.env.EMAIL_APP_PASSWORD
    }
  });
};

export const sendOrderConfirmationEmail = async (
  customerEmail: string,
  orderId: string,
  orderDetails: {
    playerName?: string;
    totalAmount: number;
    items: Array<{
      productName: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>;
    status: string;
  }
) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.log('Email transporter not configured, skipping email notification');
      return { success: false, error: 'Email not configured' };
    }
    
    const itemsHtml = orderDetails.items.map(item => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 12px; text-align: left;">${item.productName}</td>
        <td style="padding: 12px; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; text-align: right;">$${item.unitPrice.toFixed(2)}</td>
        <td style="padding: 12px; text-align: right; font-weight: bold;">$${item.totalPrice.toFixed(2)}</td>
      </tr>
    `).join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1a5d1a, #0d4a4a); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: #fff; margin: 0; font-size: 28px;">🎮 DUSK LifeSteal Shop</h1>
          <p style="color: #a0f0a0; margin: 10px 0 0 0; font-size: 16px;">Order Confirmation</p>
        </div>
        
        <div style="background: #f9f9f9; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #1a5d1a; margin-top: 0;">Thank you for your order!</h2>
          <p>Hi ${orderDetails.playerName || 'Valued Customer'},</p>
          <p>Your order has been successfully placed. Here are the details:</p>
          
          <div style="background: #fff; padding: 15px; border-radius: 5px; border-left: 4px solid #1a5d1a; margin: 20px 0;">
            <strong style="color: #1a5d1a;">Order ID: ${orderId}</strong><br>
            <span style="color: #666; font-size: 14px;">Save this ID to track your order</span>
          </div>
        </div>
        
        <div style="background: #fff; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; margin-bottom: 25px;">
          <h3 style="background: #1a5d1a; color: #fff; margin: 0; padding: 15px;">Order Summary</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
              <tr style="background: #f5f5f5; font-weight: bold;">
                <td colspan="3" style="padding: 15px; text-align: right; border-top: 2px solid #1a5d1a;">Total Amount:</td>
                <td style="padding: 15px; text-align: right; color: #1a5d1a; font-size: 18px; border-top: 2px solid #1a5d1a;">$${orderDetails.totalAmount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; border: 1px solid #a0d0a0; margin-bottom: 25px;">
          <h3 style="color: #1a5d1a; margin-top: 0;">📋 Next Steps</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Your order status: <strong>${orderDetails.status}</strong></li>
            <li>Track your order using ID: <strong>${orderId}</strong></li>
            <li>Join our Discord server for updates</li>
            <li>Check your in-game rewards within 24 hours</li>
          </ul>
        </div>
        
        <div style="background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #ddd; text-align: center;">
          <h3 style="color: #1a5d1a; margin-top: 0;">🔍 Track Your Order</h3>
          <p>Use your Order ID to check status anytime:</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/order-status" 
             style="display: inline-block; background: #1a5d1a; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Track Order Status
          </a>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 14px;">
          <p>Need help? Contact us at <a href="mailto:dusk49255@gmail.com" style="color: #1a5d1a;">dusk49255@gmail.com</a></p>
          <p style="margin: 5px 0;">DUSK LifeSteal Shop | Premium Minecraft Experience</p>
        </div>
      </body>
      </html>
    `;

    const mailOptions: EmailConfig = {
      from: '"DUSK LifeSteal Shop" <dusk49255@gmail.com>',
      to: customerEmail,
      subject: `Order Confirmation - ${orderId} | DUSK LifeSteal Shop`,
      html: emailHtml
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const sendOrderStatusUpdateEmail = async (
  customerEmail: string,
  orderId: string,
  newStatus: string,
  playerName?: string
) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.log('Email transporter not configured, skipping status update email');
      return { success: false, error: 'Email not configured' };
    }
    
    const statusColors = {
      'completed': '#22c55e',
      'processing': '#3b82f6',
      'cancelled': '#ef4444',
      'failed': '#ef4444',
      'pending': '#f59e0b',
      'payment_pending': '#f59e0b'
    };
    
    const statusColor = statusColors[newStatus as keyof typeof statusColors] || '#6b7280';
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Status Update</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1a5d1a, #0d4a4a); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: #fff; margin: 0; font-size: 28px;">🎮 DUSK LifeSteal Shop</h1>
          <p style="color: #a0f0a0; margin: 10px 0 0 0; font-size: 16px;">Order Status Update</p>
        </div>
        
        <div style="background: #f9f9f9; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #1a5d1a; margin-top: 0;">Order Status Updated</h2>
          <p>Hi ${playerName || 'Valued Customer'},</p>
          <p>We have an update on your order:</p>
          
          <div style="background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #ddd; text-align: center; margin: 20px 0;">
            <div style="background: ${statusColor}; color: #fff; padding: 10px; border-radius: 5px; margin-bottom: 15px;">
              <strong>Order ID: ${orderId}</strong>
            </div>
            <div style="font-size: 18px; margin-bottom: 10px;">New Status:</div>
            <div style="font-size: 24px; font-weight: bold; color: ${statusColor}; text-transform: uppercase;">
              ${newStatus.replace('_', ' ')}
            </div>
          </div>
        </div>
        
        <div style="background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #ddd; text-align: center;">
          <h3 style="color: #1a5d1a; margin-top: 0;">🔍 View Full Order Details</h3>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/order-status" 
             style="display: inline-block; background: #1a5d1a; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Check Order Status
          </a>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 14px;">
          <p>Need help? Contact us at <a href="mailto:dusk49255@gmail.com" style="color: #1a5d1a;">dusk49255@gmail.com</a></p>
          <p style="margin: 5px 0;">DUSK LifeSteal Shop | Premium Minecraft Experience</p>
        </div>
      </body>
      </html>
    `;

    const mailOptions: EmailConfig = {
      from: '"DUSK LifeSteal Shop" <dusk49255@gmail.com>',
      to: customerEmail,
      subject: `Order ${newStatus.replace('_', ' ').toUpperCase()} - ${orderId} | DUSK LifeSteal Shop`,
      html: emailHtml
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Order status update email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Failed to send order status update email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};