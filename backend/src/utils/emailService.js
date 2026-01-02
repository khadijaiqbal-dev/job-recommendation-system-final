const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Generate 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email
const sendVerificationEmail = async (email, firstName, verificationCode) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Email - Job Recommendation System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Job Recommendation System</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <h2 style="color: #333; margin-top: 0;">Welcome ${firstName}!</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Thank you for registering with our Job Recommendation System. To complete your registration and start exploring job opportunities, please verify your email address.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px dashed #667eea;">
              <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Your verification code is:</p>
              <h1 style="margin: 0; color: #667eea; font-size: 36px; letter-spacing: 5px; font-weight: bold;">${verificationCode}</h1>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              <strong>Important:</strong> This code will expire in 15 minutes for security reasons. If you didn't request this verification, please ignore this email.
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                If you're having trouble with the verification code, please contact our support team.
              </p>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error: error.message };
  }
};

// Send manual verification email (for admin)
const sendManualVerificationEmail = async (email, firstName, verificationCode) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification - Job Recommendation System (Admin Request)',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Job Recommendation System</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <h2 style="color: #333; margin-top: 0;">Hello ${firstName}!</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Our administrator has requested to send you a new email verification code. Please use the code below to verify your email address and complete your account setup.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px dashed #667eea;">
              <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Your verification code is:</p>
              <h1 style="margin: 0; color: #667eea; font-size: 36px; letter-spacing: 5px; font-weight: bold;">${verificationCode}</h1>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              <strong>Note:</strong> This code will expire in 15 minutes. If you didn't request this verification, please contact our support team.
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                This verification was requested by an administrator. If you have any questions, please contact our support team.
              </p>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Manual verification email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending manual verification email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  generateVerificationCode,
  sendVerificationEmail,
  sendManualVerificationEmail
};

// Send password reset email
const sendPasswordResetEmail = async (email, firstName, resetCode) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset - Job Recommendation System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Job Recommendation System</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <h2 style="color: #333; margin-top: 0;">Hello ${firstName}!</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              We received a request to reset your password for your Job Recommendation System account. If you made this request, please use the verification code below to reset your password.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px dashed #e74c3c;">
              <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Your password reset code is:</p>
              <h1 style="margin: 0; color: #e74c3c; font-size: 36px; letter-spacing: 5px; font-weight: bold;">${resetCode}</h1>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              <strong>Important:</strong> This code will expire in 15 minutes for security reasons. If you didn't request this password reset, please ignore this email and your password will remain unchanged.
            </p>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #856404; font-size: 14px;">
                <strong>Security Notice:</strong> Never share this code with anyone. Our support team will never ask for your verification code.
              </p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                If you're having trouble with the reset code, please contact our support team.
              </p>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  generateVerificationCode,
  sendVerificationEmail,
  sendManualVerificationEmail,
  sendPasswordResetEmail
};
