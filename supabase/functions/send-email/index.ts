import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
	"Access-Control-Allow-Origin": "https://stakex.finance",
	"Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
	if (req.method === "OPTIONS") {
		return new Response("ok", { headers: corsHeaders });
	}

	try {
		const resendApiKey = Deno.env.get("RESEND_API_KEY");
		if (!resendApiKey) {
			throw new Error("RESEND_API_KEY is not set");
		}

		const resendFromEmail = Deno.env.get("RESEND_FROM_EMAIL");
		if (!resendFromEmail) {
			throw new Error("RESEND_FROM_EMAIL is not set. Please add it to your Supabase Edge Function secrets.");
		}

		const { type, to, data } = await req.json();

		if (!to || !type) {
			throw new Error("Missing parameter: type or to");
		}

		let toAddresses = [to];

		if (to === "admin") {
			const supabaseUrl = Deno.env.get("SUPABASE_URL");
			const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
			if (!supabaseUrl || !supabaseServiceKey) {
				throw new Error("Supabase admin credentials missing");
			}
			const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
			const { data: admins, error } = await supabaseAdmin.from("profiles").select("email").eq("is_admin", true);

			if (error || !admins || admins.length === 0) {
				return new Response(JSON.stringify({ message: "No admins found." }), {
					headers: { ...corsHeaders, "Content-Type": "application/json" },
					status: 200,
				});
			}
			toAddresses = admins.map((a) => a.email);
		}

		let subject = "Notification";
		let title = "Notification";
		let message = "";
		let details = "";

		switch (type) {
			case "welcome":
				subject = "Welcome to StakeX";
				title = "Welcome Aboard";
				message = `Dear ${data.name},<br><br>We are delighted to welcome you to StakeX. Whether you are beginning your financial journey or managing an established portfolio, our platform is engineered to provide you with the robust tools, institutional-grade security, and dedicated support necessary to achieve your objectives.`;
				details = "";
				break;
			case "new_user_admin":
				subject = "New User Registration";
				title = "New User Registration";
				message = `A new user has just registered on the platform.`;
				details = `
					<tr>
						<td class="detail-label">User Name</td>
						<td class="detail-value">${data.name || 'N/A'}</td>
					</tr>
					<tr>
						<td class="detail-label">User Email</td>
						<td class="detail-value">${data.email}</td>
					</tr>`;
				break;
			case "deposit_notification_admin":
				subject = "New Deposit Request";
				title = "Deposit Request Notification";
				message = `A client has submitted a new deposit request on the platform. Please access the administrative dashboard to review and process this transaction at your earliest convenience.`;
				details = `
					<tr>
						<td class="detail-label">User Email</td>
						<td class="detail-value">${data.email}</td>
					</tr>
					<tr>
						<td class="detail-label">Amount Requested</td>
						<td class="detail-value">$${data.amount}</td>
					</tr>`;
				break;
			case "deposit_approved":
				subject = "Deposit Successful";
				title = "Deposit Successful";
				message = `We are pleased to inform you that your recent deposit has been successfully processed. The funds have been securely credited to your account balance and are now available for use.`;
				details = `
					<tr>
						<td class="detail-label">Credited Amount</td>
						<td class="detail-value" style="color: #34d399;">$${data.amount}</td>
					</tr>`;
				break;
			case "withdrawal_notification_admin":
				subject = "New Withdrawal Request";
				title = "Withdrawal Request Notification";
				message = `A client has initiated a new withdrawal request. Please access the administrative dashboard to securely review and authorize this transaction.`;
				details = `
					<tr>
						<td class="detail-label">User Email</td>
						<td class="detail-value">${data.email}</td>
					</tr>
					<tr>
						<td class="detail-label">Amount Requested</td>
						<td class="detail-value">$${data.amount}</td>
					</tr>`;
				break;
			case "withdrawal_approved":
				subject = "Withdrawal Successful";
				title = "Withdrawal Successful";
				message = `Your recent withdrawal request has been successfully processed. The authorized funds have been dispatched to your designated account and should arrive shortly. Please note that standard network or processing confirmation times may apply.`;
				details = `
					<tr>
						<td class="detail-label">Dispatched Amount</td>
						<td class="detail-value">$${data.amount}</td>
					</tr>`;
				break;
			case "kyc_submitted_admin":
				subject = "New KYC Submission";
				title = "KYC Documents Submitted";
				message = `A client has submitted their Know Your Customer (KYC) documents for identity verification. Please review the submission in the administrative dashboard to maintain regulatory compliance.`;
				details = `
					<tr>
						<td class="detail-label">User Email</td>
						<td class="detail-value">${data.email}</td>
					</tr>`;
				break;
			case "kyc_approved":
				subject = "KYC Verification Approved";
				title = "Identity Verified Successfully";
				message = `We are pleased to confirm that your identity verification (KYC) process is complete. Your documents have been successfully reviewed and your status is now fully approved, granting you unrestricted access to all services and features on the Prime XBL platform.`;
				details = "";
				break;
			case "kyc_rejected":
				subject = "KYC Verification Update";
				title = "KYC Status: Action Required";
				message = `We were unable to complete your identity verification using the documents recently provided. This may be due to image clarity issues, expired documentation, or inconsistent information.<br><br>Please log in to your account to securely provide clear, valid, and current documentation so that we may finalize your verification process.`;
				details = "";
				break;
			case "reset_password":
				subject = "Reset Your Password - Prime XBL";
				title = "Password Reset Request";
				const supabaseUrl = Deno.env.get("SUPABASE_URL");
				const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

				if (!supabaseUrl || !supabaseServiceKey) {
					throw new Error("Supabase admin credentials missing in edge function envvars");
				}

				const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
				const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
					type: "recovery",
					email: to,
					options: {
						redirectTo: `${data.siteUrl || "http://localhost:5173"}/reset-password`,
					},
				});

				if (linkError) {
					console.error("Failed to generate recovery link:", linkError);
					return new Response(JSON.stringify({ message: "If the email exists, a reset link has been sent." }), {
						headers: { ...corsHeaders, "Content-Type": "application/json" },
						status: 200,
					});
				}

				message = `We have received a request to reset the secure password associated with your Prime XBL client profile. If you initiated this request, please proceed by clicking the authorized link below to securely update your credentials.<br><br>
				<div style="text-align: center; margin: 40px 0;">
					<a href="${linkData.properties?.action_link}" style="background-color: #f59e0b; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; display: inline-block; font-family: 'Quicksand', -apple-system, sans-serif; box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.2), 0 2px 4px -1px rgba(245, 158, 11, 0.1);">Reset My Password</a>
				</div>
				<br>If you did not request a password reset, you may safely ignore this communication. Your account remains fully secure.`;
				details = "";
				break;
			case "deposit_submitted":
				subject = "Deposit Request Received";
				title = "Deposit Received";
				message = `We have received your deposit request. Our finance team is currently reviewing the transaction and will process it shortly.`;
				details = `
					<tr>
						<td class="detail-label">Amount Requested</td>
						<td class="detail-value">$${data.amount}</td>
					</tr>`;
				break;
			case "withdrawal_submitted":
				subject = "Withdrawal Request Received";
				title = "Withdrawal Initiated";
				message = `We have received your withdrawal request. Our team will review and process this disbursement securely within our standard processing timeframe.`;
				details = `
					<tr>
						<td class="detail-label">Amount Requested</td>
						<td class="detail-value">$${data.amount}</td>
					</tr>`;
				break;
			case "kyc_submitted":
				subject = "KYC Documents Received";
				title = "Documents Received";
				message = `Thank you for submitting your Know Your Customer (KYC) documents. Our compliance team will review your submission to verify your identity. We will notify you once the verification process is complete.`;
				details = "";
				break;
			case "investment_notification_admin":
				subject = "New Investment Request";
				title = "Investment Request Notification";
				message = `A client has requested to activate an investment plan. Please access the administrative dashboard to review and approve this investment.`;
				details = `
					<tr>
						<td class="detail-label">User Email</td>
						<td class="detail-value">${data.email}</td>
					</tr>
					<tr>
						<td class="detail-label">Plan Name</td>
						<td class="detail-value">${data.plan_name}</td>
					</tr>
					<tr>
						<td class="detail-label">Amount</td>
						<td class="detail-value">$${data.amount}</td>
					</tr>`;
				break;
			case "investment_submitted":
				subject = "Investment Request Received";
				title = "Investment Requested";
				message = `We have received your request to activate an investment plan. Our team will review and approve your investment shortly, and it will be visible in your active investments.`;
				details = `
					<tr>
						<td class="detail-label">Plan Name</td>
						<td class="detail-value">${data.plan_name}</td>
					</tr>
					<tr>
						<td class="detail-label">Amount</td>
						<td class="detail-value">$${data.amount}</td>
					</tr>`;
				break;
			case "investment_approved":
				subject = "Investment Approved and Active";
				title = "Investment Live";
				message = `Your requested investment plan has been securely approved and is now active. The investment amount has been allocated from your balance and your portfolio is now yielding returns.`;
				details = `
					<tr>
						<td class="detail-label">Plan Name</td>
						<td class="detail-value">${data.plan_name}</td>
					</tr>
					<tr>
						<td class="detail-label">Amount Allocated</td>
						<td class="detail-value" style="color: #34d399;">$${data.amount}</td>
					</tr>`;
				break;
			case "referral_signup":
				subject = "New Referral Joined — Prime XBL";
				title = "New Referral Registration";
				message = `Great news! A new user has registered on Prime XBL using your referral link. You are now eligible to earn commission on their deposits. Keep sharing your link to grow your network and maximize your earnings.`;
				details = `
					<tr>
						<td class="detail-label">Referral Name</td>
						<td class="detail-value">${data.referral_name}</td>
					</tr>
					<tr>
						<td class="detail-label">Date Joined</td>
						<td class="detail-value">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
					</tr>`;
				break;
			case "referral_commission":
				subject = "Referral Commission Earned — Prime XBL";
				title = "Commission Credited";
				message = `Congratulations! You have earned a referral commission. A deposit was made by one of your referrals and your commission has been automatically credited to your account balance.`;
				details = `
					<tr>
						<td class="detail-label">Deposit Amount</td>
						<td class="detail-value">$${data.deposit_amount}</td>
					</tr>
					<tr>
						<td class="detail-label">Commission Rate</td>
						<td class="detail-value">${data.commission_rate}%</td>
					</tr>
					<tr>
						<td class="detail-label">Commission Earned</td>
						<td class="detail-value" style="color: #34d399;">$${data.commission_amount}</td>
					</tr>`;
				break;
			default:
				subject = "New Notification - Prime XBL";
				title = "Platform Notification";
				message = "You have received an automated communication from the Prime XBL platform.";
				details = `
					<tr>
						<td class="detail-label">Payload</td>
						<td class="detail-value" style="font-family: monospace; font-size: 13px;">${JSON.stringify(data)}</td>
					</tr>`;
		}

		const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Quicksand:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    /* Base resets */
    body, p, h1, h2, h3, div, td {
      margin: 0;
      padding: 0;
    }
    
    body {
      background-color: #f5f5f5;
      color: #121212;
      font-family: 'Quicksand', system-ui, -apple-system, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    h1, h2, h3 {
      font-family: 'Montserrat', system-ui, -apple-system, sans-serif;
    }

    .wrapper {
      width: 100%;
      background-color: #f5f5f5;
      padding: 48px 0;
    }

    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
      border: 1px solid #e5e5e5;
    }

    .header {
      background-color: #121212;
      padding: 36px 40px;
      text-align: center;
      border-bottom: 4px solid #f59e0b;
    }

    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 26px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }

    .header span {
      color: #f59e0b;
    }

    .content {
      padding: 48px 40px;
    }

    .title {
      font-size: 22px;
      font-weight: 600;
      margin-top: 0;
      margin-bottom: 24px;
      color: #121212;
      letter-spacing: -0.5px;
    }

    .message {
      font-size: 16px;
      line-height: 1.6;
      color: #3f3f46;
      margin-bottom: 32px;
    }

    .details-box {
      background-color: #fafafa;
      border: 1px solid #e5e5e5;
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 32px;
    }

    .details-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .detail-label {
      padding: 12px 0;
      color: #71717a;
      font-weight: 500;
      font-size: 15px;
      border-bottom: 1px solid #e5e5e5;
      text-align: left;
    }
    
    .detail-value {
      padding: 12px 0;
      color: #18181b;
      font-size: 15px;
      font-weight: 600;
      border-bottom: 1px solid #e5e5e5;
      text-align: right;
    }
    
    tr:last-child .detail-label,
    tr:last-child .detail-value {
      border-bottom: none;
      padding-bottom: 0;
    }

    .signature {
      margin-top: 40px;
      font-size: 15px;
      color: #52525b;
      line-height: 1.6;
      border-top: 1px solid #e5e5e5;
      padding-top: 32px;
    }

    .signature strong {
      color: #121212;
      display: block;
      margin-top: 4px;
      font-weight: 600;
    }

    .footer {
      background-color: #fafafa;
      padding: 32px 40px;
      text-align: center;
      border-top: 1px solid #e5e5e5;
    }

    .footer-text {
      font-size: 14px;
      color: #71717a;
      margin-bottom: 8px;
    }

    .footer-note {
      font-size: 12px;
      color: #a1a1aa;
    }

    /* Dark Mode Support */
    @media (prefers-color-scheme: dark) {
      body, .wrapper { background-color: #0a0a0a; }
      .container { 
        background-color: #121212; 
        border-color: #1f1f1f; 
        box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5); 
      }
      .header { 
        background-color: #0a0a0a; 
        border-bottom-color: #f59e0b;
      }
      .title { color: #f5f5f5; }
      .message { color: #d4d4d8; }
      .details-box { 
        background-color: #1f1f1f; 
        border-color: #27272a; 
      }
      .detail-label { 
        color: #a1a1aa; 
        border-bottom-color: #27272a; 
      }
      .detail-value { 
        color: #f5f5f5; 
        border-bottom-color: #27272a; 
      }
      .signature {
        color: #a1a1aa;
        border-top-color: #1f1f1f;
      }
      .signature strong { color: #f5f5f5; }
      .footer { 
        background-color: #0a0a0a; 
        border-top-color: #1f1f1f; 
      }
      .footer-text { color: #a1a1aa; }
      .footer-note { color: #71717a; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>Prime <span>XBL</span></h1>
      </div>
      <div class="content">
        <h2 class="title">${title}</h2>
        <div class="message">
          ${message}
        </div>
        ${
					details
						? `
        <div class="details-box">
          <table class="details-table">
            <tbody>
              ${details}
            </tbody>
          </table>
        </div>`
						: ""
				}
        <div class="signature">
          Best regards,<br>
          <strong>The Prime XBL Team</strong>
        </div>
      </div>
      <div class="footer">
        <div class="footer-text">&copy; 2026 Prime XBL. All rights reserved.</div>
        <div class="footer-note">This is an automated communication. Please do not reply directly to this email.</div>
      </div>
    </div>
  </div>
</body>
</html>
`;

		const res = await fetch("https://api.resend.com/emails", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${resendApiKey}`,
			},
			body: JSON.stringify({
				from: `Prime XBL <${resendFromEmail}>`,
				to: toAddresses,
				subject,
				html,
			}),
		});

		const resData = await res.json();

		if (!res.ok) {
			console.error("Resend API error:", JSON.stringify(resData));
			throw new Error(resData.message || "Failed to send email via Resend");
		}

		return new Response(JSON.stringify(resData), {
			headers: { ...corsHeaders, "Content-Type": "application/json" },
			status: 200,
		});
	} catch (error: any) {
		console.error("Internal Error inside send-email handler:", error?.message || error);
		return new Response(
			JSON.stringify({ error: error?.message || "An internal server error occurred while processing the request." }),
			{
				headers: { ...corsHeaders, "Content-Type": "application/json" },
				status: 400,
			},
		);
	}
});
