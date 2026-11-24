import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, name, businessName, activationUrl } = body;

    if (!to || !activationUrl) {
      return NextResponse.json(
        { success: false, error: 'Email tujuan dan tautan aktivasi wajib diisi.' },
        { status: 400 }
      );
    }

    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = Number(process.env.SMTP_PORT) || 465;
    const smtpSecure = process.env.SMTP_SECURE !== 'false';
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const resendApiKey = process.env.RESEND_API_KEY;
    const emailFrom = process.env.EMAIL_FROM || (smtpUser ? `"be-ternak Platform" <${smtpUser}>` : '"be-ternak Platform" <admin@be-ternak.id>');

    // 1. Coba kirim via Resend API jika API Key tersedia
    if (resendApiKey) {
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: emailFrom,
          to: [to],
          subject: `[be-ternak] Aktivasi Akun Resmi: ${businessName || name}`,
          html: generateActivationEmailHtml(name, businessName, activationUrl),
        }),
      });

      if (resendRes.ok) {
        const data = await resendRes.json();
        return NextResponse.json({
          success: true,
          provider: 'resend',
          message: `Email aktivasi berhasil dikirim via Resend ke ${to}`,
          id: data.id,
        });
      }
    }

    // 2. Coba kirim via SMTP / Nodemailer (Gmail App Password, dsb.)
    if (smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const info = await transporter.sendMail({
        from: emailFrom,
        to,
        subject: `[be-ternak] Aktivasi Akun Resmi: ${businessName || name}`,
        html: generateActivationEmailHtml(name, businessName, activationUrl),
        text: `Halo ${name},\n\nPendaftaran unit usaha "${businessName}" telah disetujui Administrator be-ternak.\nSilakan buka tautan berikut untuk mengaktifkan akun Anda:\n${activationUrl}\n\nSalam,\nTim be-ternak Indonesia`,
      });

      return NextResponse.json({
        success: true,
        provider: 'smtp',
        message: `Email aktivasi berhasil dikirim via SMTP (${smtpHost}) ke ${to}`,
        messageId: info.messageId,
      });
    }

    // 3. Jika belum ada konfigurasi email di .env.local
    return NextResponse.json({
      success: false,
      notConfigured: true,
      error: 'Layanan email belum dikonfigurasi di .env.local (SMTP_USER dan SMTP_PASS atau RESEND_API_KEY belum diisi).',
      fallbackUrl: activationUrl,
    });
  } catch (err: unknown) {
    console.error('Error sending activation email:', err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Terjadi kesalahan server saat mengirim email.',
      },
      { status: 500 }
    );
  }
}

function generateActivationEmailHtml(name: string, businessName: string, activationUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aktivasi Akun be-ternak</title>
</head>
<body style="margin: 0; padding: 0; background-color: #060D0A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #E2E8F0;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #060D0A; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="580" style="max-width: 580px; background-color: #0C1713; border: 1px solid #1E352B; border-radius: 24px; padding: 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          <!-- Logo & Brand Header -->
          <tr>
            <td align="center" style="padding-bottom: 24px; border-bottom: 1px solid #1E352B;">
              <div style="font-size: 24px; font-weight: 900; color: #10B981; letter-spacing: -0.5px;">
                be-ternak <span style="background-color: rgba(16, 185, 129, 0.2); color: #10B981; font-size: 11px; padding: 3px 8px; border-radius: 9999px; border: 1px solid rgba(16, 185, 129, 0.4); vertical-align: middle; margin-left: 6px;">UNGGAS ID</span>
              </div>
              <p style="margin: 6px 0 0 0; font-size: 12px; color: #64748B;">Sistem Pemetaan Wilayah & Rekomendasi Pakan Unggas Berbasis AI</p>
            </td>
          </tr>

          <!-- Notification Badge -->
          <tr>
            <td align="center" style="padding-top: 28px;">
              <span style="display: inline-block; padding: 6px 16px; border-radius: 9999px; background-color: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #34D399; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                ✓ Pendaftaran Telah Disetujui Admin
              </span>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding-top: 20px;">
              <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #FFFFFF; text-align: center;">
                Satu Langkah Lagi Menuju Akses Penuh
              </h1>
              <p style="margin: 16px 0 0 0; font-size: 14px; line-height: 1.6; color: #94A3B8; text-align: left;">
                Halo <strong>${name}</strong>,
              </p>
              <p style="margin: 10px 0 0 0; font-size: 14px; line-height: 1.6; color: #CBD5E1; text-align: left;">
                Kabar gembira! Pendaftaran unit usaha Anda <strong style="color: #34D399;">"${businessName}"</strong> telah berhasil ditinjau dan <strong>disetujui oleh Administrator be-ternak</strong>.
              </p>
              <p style="margin: 10px 0 0 0; font-size: 14px; line-height: 1.6; color: #CBD5E1; text-align: left;">
                Untuk mengaktifkan akun secara resmi, memvalidasi email pendaftar, dan membuka seluruh fitur (Simulasi Usaha Layer, Recording Harian, dan Formulasi Pakan AI), silakan klik tombol di bawah ini:
              </p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding: 32px 0;">
              <a href="${activationUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; background-color: #10B981; color: #022C22; font-size: 14px; font-weight: 900; text-decoration: none; border-radius: 14px; box-shadow: 0 10px 25px rgba(16, 185, 129, 0.35); text-transform: uppercase; letter-spacing: 0.5px;">
                Aktifkan Akun Saya Sekarang &rarr;
              </a>
            </td>
          </tr>

          <!-- Alternative Link -->
          <tr>
            <td style="padding: 16px; background-color: #060D0A; border: 1px solid #1E352B; border-radius: 12px;">
              <p style="margin: 0; font-size: 11px; color: #64748B; word-break: break-all; line-height: 1.5;">
                Jika tombol di atas tidak dapat diklik, salin dan tempel tautan berikut ke browser Anda:<br>
                <a href="${activationUrl}" style="color: #38BDF8; text-decoration: underline;">${activationUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer & Security Notes -->
          <tr>
            <td style="padding-top: 28px; border-top: 1px solid #1E352B; margin-top: 28px;">
              <p style="margin: 0; font-size: 11px; color: #64748B; line-height: 1.5; text-align: center;">
                Tautan aktivasi ini berlaku selama 7 hari. Jika Anda tidak merasa melakukan pendaftaran di platform be-ternak, silakan abaikan email ini.
              </p>
              <p style="margin: 12px 0 0 0; font-size: 11px; color: #475569; text-align: center;">
                &copy; 2026 PT be-ternak Agritech Indonesia. Seluruh hak cipta dilindungi.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
