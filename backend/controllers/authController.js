const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const createCodeExpiry = () => {
  return new Date(Date.now() + 10 * 60 * 1000);
};

const buildVerificationEmail = (name, code) => {
  return `
    <div style="font-family: Arial, sans-serif; background:#f8fafc; padding:30px;">
      <div style="max-width:520px; margin:auto; background:white; border-radius:18px; padding:30px; border:1px solid #e2e8f0;">
        <h2 style="color:#0f172a; margin-bottom:10px;">Welcome to BizFlow CRM</h2>
        <p style="color:#475569;">Hi ${name},</p>
        <p style="color:#475569;">Use the verification code below to verify your email address.</p>
        <div style="font-size:34px; font-weight:800; letter-spacing:8px; color:#059669; background:#ecfdf5; padding:18px; text-align:center; border-radius:14px; margin:24px 0;">
          ${code}
        </div>
        <p style="color:#64748b;">This code will expire in 10 minutes.</p>
        <p style="color:#64748b;">If you did not create this account, you can ignore this email.</p>
      </div>
    </div>
  `;
};

const buildPasswordResetEmail = (name, code) => {
  return `
    <div style="font-family: Arial, sans-serif; background:#f8fafc; padding:30px;">
      <div style="max-width:520px; margin:auto; background:white; border-radius:18px; padding:30px; border:1px solid #e2e8f0;">
        <h2 style="color:#0f172a; margin-bottom:10px;">Reset your BizFlow CRM password</h2>
        <p style="color:#475569;">Hi ${name},</p>
        <p style="color:#475569;">Use the password reset code below to reset your password.</p>
        <div style="font-size:34px; font-weight:800; letter-spacing:8px; color:#2563eb; background:#eff6ff; padding:18px; text-align:center; border-radius:14px; margin:24px 0;">
          ${code}
        </div>
        <p style="color:#64748b;">This code will expire in 10 minutes.</p>
        <p style="color:#64748b;">If you did not request this, you can ignore this email.</p>
      </div>
    </div>
  `;
};

const sendUserResponse = (res, user, message) => {
  res.status(200).json({
    success: true,
    message,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    },
  });
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const verificationCode = generateCode();

    let user = await User.findOne({ email: normalizedEmail });

    if (user && user.isVerified !== false) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered. Please login.",
      });
    }

    if (user && user.isVerified === false) {
      user.name = name;
      user.password = password;
      user.role = "user";
      user.emailVerificationCode = verificationCode;
      user.emailVerificationExpires = createCodeExpiry();

      await user.save();
    } else {
      user = await User.create({
        name,
        email: normalizedEmail,
        password,
        role: "user",
        isVerified: false,
        emailVerificationCode: verificationCode,
        emailVerificationExpires: createCodeExpiry(),
      });
    }

    await sendEmail({
      to: user.email,
      subject: "Verify your BizFlow CRM account",
      html: buildVerificationEmail(user.name, verificationCode),
    });

    res.status(201).json({
      success: true,
      message: "Verification code sent to your email.",
      data: {
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Register Error:", error.message);

    res.status(500).json({
      success: false,
      message: error.message || "Registration failed.",
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Email and verification code are required.",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.isVerified) {
      return sendUserResponse(res, user, "Email already verified.");
    }

    if (
      user.emailVerificationCode !== code ||
      !user.emailVerificationExpires ||
      user.emailVerificationExpires < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code.",
      });
    }

    user.isVerified = true;
    user.emailVerificationCode = null;
    user.emailVerificationExpires = null;

    await user.save();

    sendUserResponse(res, user, "Email verified successfully.");
  } catch (error) {
    console.error("Verify Email Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Email verification failed.",
    });
  }
};

const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "This email is already verified.",
      });
    }

    const verificationCode = generateCode();

    user.emailVerificationCode = verificationCode;
    user.emailVerificationExpires = createCodeExpiry();

    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Your new BizFlow CRM verification code",
      html: buildVerificationEmail(user.name, verificationCode),
    });

    res.status(200).json({
      success: true,
      message: "New verification code sent to your email.",
      data: {
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Resend Verification Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to resend verification code.",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isPasswordMatch = await user.matchPassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (user.isVerified === false) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in.",
        needsVerification: true,
        email: user.email,
      });
    }

    sendUserResponse(res, user, "Login successful.");
  } catch (error) {
    console.error("Login Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Login failed.",
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email.",
      });
    }

    const resetCode = generateCode();

    user.passwordResetCode = resetCode;
    user.passwordResetExpires = createCodeExpiry();

    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Reset your BizFlow CRM password",
      html: buildPasswordResetEmail(user.name, resetCode),
    });

    res.status(200).json({
      success: true,
      message: "Password reset code sent to your email.",
      data: {
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Forgot Password Error:", error.message);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to send password reset code.",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, reset code, and new password are required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters.",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (
      user.passwordResetCode !== code ||
      !user.passwordResetExpires ||
      user.passwordResetExpires < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset code.",
      });
    }

    user.password = newPassword;
    user.passwordResetCode = null;
    user.passwordResetExpires = null;
    user.isVerified = true;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now login.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Password reset failed.",
    });
  }
};

module.exports = {
  register,
  verifyEmail,
  resendVerificationCode,
  login,
  forgotPassword,
  resetPassword,
};