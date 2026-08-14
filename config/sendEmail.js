// const { Resend } = require("resend");

// const resend = new Resend(process.env.RESEND_API_KEY);

// const sendEmail = async (to, subject, text) => {
//   await resend.emails.send({
//     from: "onboarding@resend.dev",
//     to,
//     subject,
//     text,
//   });
// };

// module.exports = sendEmail;
const { Resend } = require("resend");

let resend = null;

if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
} else {
  console.log("⚠️  Email service disabled (No API key)");
}

const sendEmail = async (to, subject, html) => {
  if (!resend) {
    console.log("📧 Email skipped");
    return { success: false, message: "Email service disabled" };
  }

  try {
    const data = await resend.emails.send({
      from: "onboarding@resend.dev",
      to,
      subject,
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error("Email error:", error);
    return { success: false, error };
  }
};

module.exports = sendEmail;