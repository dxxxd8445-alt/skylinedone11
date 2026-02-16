"use server";

import { sendEmail } from "@/lib/resend";
import { createLicenseDeliveryEmail, createPasswordResetEmail } from "@/lib/email-templates";

export interface SendPurchaseEmailParams {
  customerEmail: string;
  orderNumber: string;
  productName: string;
  duration: string;
  licenseKey: string;
  expiresAt: Date;
  totalPaid: number;
}

export async function sendPurchaseEmail(params: SendPurchaseEmailParams) {
  try {
    const emailHtml = createLicenseDeliveryEmail({
      username: params.customerEmail.split('@')[0],
      orderNumber: params.orderNumber,
      productName: params.productName,
      licenseKey: params.licenseKey,
      amount: `$${params.totalPaid.toFixed(2)}`,
      expiresAt: params.expiresAt.toISOString()
    });

    const result = await sendEmail({
      to: params.customerEmail,
      subject: `Your Ring-0 License Key - Order ${params.orderNumber}`,
      html: emailHtml,
    });

    if (!result.success) {
      return { success: false as const, error: result.error };
    }

    return { success: true as const, emailId: result.id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to send email";
    return { success: false as const, error: msg };
  }
}

export interface SendPasswordResetEmailParams {
  email: string;
  username: string;
  resetLink: string;
}

export async function sendPasswordResetEmail(params: SendPasswordResetEmailParams) {
  try {
    const emailHtml = createPasswordResetEmail({
      username: params.username,
      resetLink: params.resetLink
    });

    const result = await sendEmail({
      to: params.email,
      subject: "Reset your Ring-0 password",
      html: emailHtml,
    });

    if (!result.success) {
      return { success: false as const, error: result.error };
    }

    return { success: true as const, emailId: result.id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to send email";
    return { success: false as const, error: msg };
  }
}