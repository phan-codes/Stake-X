import { supabase } from './supabase';

type EmailType =
  | 'welcome'
  | 'deposit_notification_admin'
  | 'deposit_approved'
  | 'withdrawal_notification_admin'
  | 'withdrawal_approved'
  | 'kyc_submitted_admin'
  | 'kyc_approved'
  | 'kyc_rejected'
  | 'deposit_submitted'
  | 'withdrawal_submitted'
  | 'kyc_submitted'
  | 'investment_submitted'
  | 'investment_notification_admin'
  | 'investment_approved'
  | 'new_user_admin';

interface EmailPayload {
  to: string;
  type: EmailType;
  data: any;
}

export const sendEmailNotification = async ({ to, type, data }: EmailPayload) => {
  try {
    const { data: responseData, error } = await supabase.functions.invoke('send-email', {
      body: { to, type, data },
    });

    if (error) {
      return false;
    }

    // Check if the response body contains an error (edge function returned 400)
    if (responseData?.error) {
      return false;
    }

    return true;
  } catch (err) {
    return false;
  }
};

export const notifyAdmin = async (type: EmailType, data: any) => {
  let adminSuccess = false;

  // 1. Send the admin notification (don't let this block user confirmation)
  try {
    const { data: responseData, error: adminError } = await supabase.functions.invoke('send-email', {
      body: { to: 'admin', type, data },
    });

    if (adminError) {
      // Admin notification failed silently
    } else if (responseData?.error) {
      // Edge function error — silent
    } else {
      adminSuccess = true;
    }
  } catch (err) {
    // Exception sending admin notification — silent
  }

  // 2. Independently dispatch a confirmation email to the user
  //    This runs even if the admin notification failed above
  let userRecordType: EmailType | null = null;
  if (type === 'deposit_notification_admin') userRecordType = 'deposit_submitted';
  if (type === 'withdrawal_notification_admin') userRecordType = 'withdrawal_submitted';
  if (type === 'kyc_submitted_admin') userRecordType = 'kyc_submitted';
  if (type === 'investment_notification_admin') userRecordType = 'investment_submitted';

  if (userRecordType && data.email) {
    try {
      await sendEmailNotification({
        to: data.email,
        type: userRecordType,
        data,
      });
    } catch (err) {
      // Failed to send user confirmation — silent
    }
  }

  return adminSuccess;
};
