import { db } from './db.js';

interface BookingEmailParams {
  bookingId: string;
  type: 'seat_booking' | 'room_booking' | 'booking_cancellation';
  user: {
    id: string;
    name: string;
    email: string;
    department?: string;
  };
  resource: {
    isRoom: boolean;
    name: string;
    code: string;
    areaId: string;
    capacity?: number;
    amenities?: string[];
  };
  schedule: {
    date: string;
    startTime: string;
    endTime: string;
    duration: string;
  };
  booker?: {
    id: string;
    name: string;
    role: string;
  };
  teamsMeetingUrl?: string;
  attendees?: Array<{
    id: string;
    name: string;
    email: string;
    role?: string;
  }>;
}

/**
 * Formats ISO date (YYYY-MM-DD) into display date string e.g. "Monday, Oct 5, 2026"
 */
function formatEmailDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

/**
 * Generate iCalendar (.ics) format string compatible with Microsoft Outlook & Office 365
 */
export function generateIcsCalendar(params: BookingEmailParams): string {
  const { bookingId, resource, schedule, user, teamsMeetingUrl, attendees } = params;
  const cleanDate = schedule.date.replace(/-/g, '');
  const cleanStart = schedule.startTime.replace(/:/g, '') + '00';
  const cleanEnd = schedule.endTime.replace(/:/g, '') + '00';

  const dtStart = `${cleanDate}T${cleanStart}`;
  const dtEnd = `${cleanDate}T${cleanEnd}`;
  const dtStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const title = resource.isRoom
    ? `Meeting: ${resource.name} (${resource.code})`
    : `Office Desk Reservation: ${resource.code}`;

  const location = teamsMeetingUrl
    ? `Microsoft Teams Meeting | SmartDesk HQ - ${resource.areaId === 'area-1' ? 'Work Area 1' : 'Work Area 2'} - ${resource.name}`
    : `SmartDesk HQ - ${resource.areaId === 'area-1' ? 'Work Area 1' : 'Work Area 2'} - ${resource.name}`;

  const attendeesSummary = attendees && attendees.length > 0
    ? `\\nAttendees: ${attendees.map(a => a.name).join(', ')}`
    : '';

  const teamsSummary = teamsMeetingUrl
    ? `\\nJoin Microsoft Teams Meeting: ${teamsMeetingUrl}`
    : '';

  const description = resource.isRoom
    ? `Meeting Room Reservation at SmartDesk Workspace OS.\\nRoom: ${resource.name} (${resource.code})\\nCapacity: ${resource.capacity || 6} Persons\\nTime: ${schedule.startTime} - ${schedule.endTime} (${schedule.duration})${teamsSummary}${attendeesSummary}\\nBooking Reference: ${bookingId}`
    : `Dedicated Desk Reservation at SmartDesk Workspace OS.\\nSeat: ${resource.code}\\nTime: ${schedule.startTime} - ${schedule.endTime} (${schedule.duration})\\nBooking Reference: ${bookingId}`;

  const attendeeLines = (attendees || []).map(
    (att) => `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;CN=${att.name}:mailto:${att.email}`
  );

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SmartDesk Office//Microsoft Outlook & Teams Sync//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${bookingId}@smartdesk.internal`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    ...(teamsMeetingUrl ? [`X-MICROSOFT-TEAMS-JOIN-URL:${teamsMeetingUrl}`] : []),
    `ORGANIZER;CN=SmartDesk Workspace OS:mailto:smartdesk-no-reply@company.internal`,
    `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=CHAIR;PARTSTAT=ACCEPTED;CN=${user.name}:mailto:${user.email}`,
    ...attendeeLines,
    'STATUS:CONFIRMED',
    'CLASS:PUBLIC',
    'PRIORITY:5',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    `DESCRIPTION:Reminder: ${title} starts in 15 minutes`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ];

  return icsLines.join('\r\n');
}

/**
 * Generate Microsoft Outlook branded responsive HTML confirmation email
 */
export function generateOutlookEmailHtml(params: BookingEmailParams): string {
  const { bookingId, type, user, resource, schedule, booker, teamsMeetingUrl, attendees } = params;
  const isRoom = resource.isRoom;
  const formattedDate = formatEmailDate(schedule.date);
  const isAllocatedByOther = booker && booker.id !== user.id;

  const subjectHeadline = type === 'booking_cancellation'
    ? 'Booking Cancelled'
    : isRoom
    ? 'Meeting Room Confirmed'
    : 'Desk Reservation Confirmed';

  const accentColor = isRoom ? '#0284c7' : '#0ea5e9'; // Microsoft 365 Blue

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subjectHeadline} - Microsoft Outlook Notification</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 30px 10px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 620px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
          
          <!-- Microsoft Outlook / Office 365 Header Bar -->
          <tr>
            <td style="background: linear-gradient(135deg, #0078D4 0%, #106EBE 100%); padding: 24px 32px; color: #ffffff;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <!-- Official Microsoft Office 365 4-Square Logo -->
                    <table border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 12px;">
                      <tr>
                        <td style="width: 10px; height: 10px; background-color: #f25022; padding: 0;"></td>
                        <td style="width: 3px;"></td>
                        <td style="width: 10px; height: 10px; background-color: #7fba00; padding: 0;"></td>
                      </tr>
                      <tr style="height: 3px;"></tr>
                      <tr>
                        <td style="width: 10px; height: 10px; background-color: #00a4ef; padding: 0;"></td>
                        <td style="width: 3px;"></td>
                        <td style="width: 10px; height: 10px; background-color: #ffb900; padding: 0;"></td>
                      </tr>
                    </table>
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.9; font-weight: 600;">
                      Microsoft Outlook • SmartDesk Workspace OS
                    </div>
                    <h1 style="margin: 6px 0 0 0; font-size: 22px; font-weight: 700; letter-spacing: -0.3px;">
                      ${subjectHeadline}
                    </h1>
                  </td>
                  <td align="right" valign="top">
                    <span style="display: inline-block; background-color: rgba(255,255,255,0.2); padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; font-family: monospace;">
                      ${bookingId}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Greeting Body -->
          <tr>
            <td style="padding: 28px 32px 16px 32px;">
              <p style="margin: 0 0 12px 0; font-size: 15px; line-height: 1.5; color: #334155;">
                Hello <strong>${user.name}</strong>,
              </p>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                ${isAllocatedByOther
                  ? `Your colleague <strong>${booker.name} (${booker.role.toUpperCase()})</strong> has reserved a ${isRoom ? 'meeting room' : 'workstation desk'} for you in the office.`
                  : `Your ${isRoom ? 'meeting room' : 'workstation desk'} booking has been confirmed and synced with your corporate Microsoft Outlook calendar.`
                }
              </p>

              <!-- Reservation Summary Card -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; padding: 20px; margin-bottom: 24px;">
                <tr>
                  <td style="padding-bottom: 14px; border-bottom: 1px dashed #cbd5e1;">
                    <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; letter-spacing: 0.5px;">
                      ${isRoom ? 'Meeting Room & Facility' : 'Reserved Workstation'}
                    </div>
                    <div style="font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 2px;">
                      ${resource.name}
                      <span style="font-size: 13px; font-weight: 600; color: #0284c7; background-color: #e0f2fe; padding: 2px 8px; border-radius: 6px; margin-left: 6px; font-family: monospace;">
                        ${resource.code}
                      </span>
                    </div>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding-top: 14px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="50%" valign="top" style="padding-bottom: 10px;">
                          <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600;">Date</div>
                          <div style="font-size: 14px; font-weight: 600; color: #1e293b; margin-top: 2px;">
                            ${formattedDate}
                          </div>
                        </td>
                        <td width="50%" valign="top" style="padding-bottom: 10px;">
                          <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600;">Time Window</div>
                          <div style="font-size: 14px; font-weight: 600; color: #0284c7; margin-top: 2px; font-family: monospace;">
                            ${schedule.startTime} - ${schedule.endTime}
                          </div>
                          <div style="font-size: 11px; color: #64748b;">(${schedule.duration})</div>
                        </td>
                      </tr>
                      <tr>
                        <td width="50%" valign="top">
                          <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600;">Location Zone</div>
                          <div style="font-size: 13px; color: #334155; margin-top: 2px;">
                            ${resource.areaId === 'area-1' ? 'Work Area 1 (Main Hall)' : 'Work Area 2 (Collaborative Wing)'}
                          </div>
                        </td>
                        <td width="50%" valign="top">
                          <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600;">${isRoom ? 'Capacity' : 'Status'}</div>
                          <div style="font-size: 13px; font-weight: 600; color: #16a34a; margin-top: 2px;">
                            ${isRoom ? `${resource.capacity || 6} Seats Available` : 'Guaranteed Active'}
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                ${resource.amenities && resource.amenities.length > 0 ? `
                <tr>
                  <td style="padding-top: 14px; border-top: 1px dashed #cbd5e1; margin-top: 10px;">
                    <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; margin-bottom: 6px;">Amenities Included:</div>
                    <div>
                      ${resource.amenities.map(a => `<span style="display: inline-block; font-size: 11px; background-color: #f1f5f9; color: #334155; padding: 2px 8px; border-radius: 4px; margin-right: 6px; margin-bottom: 4px; border: 1px solid #e2e8f0;">✓ ${a}</span>`).join('')}
                    </div>
                  </td>
                </tr>
                ` : ''}
              </table>

              ${teamsMeetingUrl ? `
              <!-- Microsoft Teams Instant Video Meeting Banner -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #464EB8 0%, #353982 100%); border-radius: 12px; margin-bottom: 24px; overflow: hidden; box-shadow: 0 4px 14px rgba(70, 78, 184, 0.35);">
                <tr>
                  <td style="padding: 18px 22px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td>
                          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.2px; color: #c7d2fe; font-weight: 700;">
                            Microsoft Teams Meeting
                          </div>
                          <div style="font-size: 16px; font-weight: 700; color: #ffffff; margin: 3px 0 2px 0;">
                            Join Microsoft Teams Video Conference
                          </div>
                          <div style="font-size: 11px; color: #e0e7ff; opacity: 0.9;">
                            Meeting Passcode: 2026 • Direct one-click access for all attendees
                          </div>
                        </td>
                        <td align="right" valign="middle">
                          <a href="${teamsMeetingUrl}" target="_blank" style="display: inline-block; background-color: #ffffff; color: #464EB8; text-decoration: none; padding: 10px 18px; border-radius: 8px; font-weight: 700; font-size: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">
                            Join Teams Meeting
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              ` : ''}

              ${attendees && attendees.length > 0 ? `
              <!-- Meeting Attendees Roster -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; border-radius: 10px; border: 1px solid #e2e8f0; padding: 14px 18px; margin-bottom: 20px;">
                <tr>
                  <td>
                    <div style="font-size: 11px; text-transform: uppercase; color: #475569; font-weight: 700; margin-bottom: 8px;">
                      Invited Meeting Participants (${attendees.length + 1} Total):
                    </div>
                    <div style="font-size: 12px; color: #334155; line-height: 1.6;">
                      <span style="font-weight: 700; color: #0284c7;">• ${user.name} (Organizer)</span><br>
                      ${attendees.map(att => `<span>• ${att.name} &lt;${att.email}&gt;</span>`).join('<br>')}
                    </div>
                  </td>
                </tr>
              </table>
              ` : ''}

              <!-- Action Call to Action -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="https://outlook.office.com/calendar/" target="_blank" style="display: inline-block; background-color: #0078D4; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 13px; margin-right: 8px; box-shadow: 0 4px 12px rgba(0,120,212,0.3);">
                      Open in Microsoft Outlook Web
                    </a>
                    <a href="http://localhost:5173" target="_blank" style="display: inline-block; background-color: #f1f5f9; color: #334155; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: 600; font-size: 13px; border: 1px solid #cbd5e1;">
                      View Floor Plan Map
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Outlook Calendar Note -->
              <div style="background-color: #eff6ff; border-left: 4px solid #0078D4; padding: 12px 16px; border-radius: 4px; font-size: 12px; color: #1e40af; line-height: 1.5; margin-bottom: 20px;">
                <strong>Microsoft Outlook Calendar Sync:</strong> An iCalendar (.ics) invite has been attached to this notification. You can accept the invitation in Outlook Desktop or Outlook Mobile to automatically add this slot to your work calendar and block your schedule.
              </div>

              <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">
                Need to cancel or make changes? Visit <a href="http://localhost:5173" style="color: #0078D4; text-decoration: none; font-weight: 600;">SmartDesk Dashboard</a> to manage your active reservations.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.6;">
              This notification was generated automatically by <strong>SmartDesk Workspace OS</strong> for Microsoft 365 Outlook.<br>
              Recipient: <span style="font-family: monospace; color: #64748b;">${user.email}</span> • Sent on: ${new Date().toUTCString()}
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

/**
 * Dispatch booking confirmation email to recipient's Microsoft Outlook account
 * 1. Checks if real Microsoft Graph API client credentials exist and sends via Graph API
 * 2. Saves full email record into SQLite `email_notifications` outbox
 * 3. Logs `OUTLOOK_EMAIL_SENT` in `system_logs`
 */
export async function sendOutlookBookingNotification(params: BookingEmailParams): Promise<{
  success: boolean;
  notificationId: string;
  recipient: string;
  subject: string;
  icsContent: string;
  provider: string;
}> {
  const { bookingId, type, user, resource, schedule } = params;
  const isRoom = resource.isRoom;

  const subject = type === 'booking_cancellation'
    ? `[Cancelled] ${isRoom ? 'Meeting Room' : 'Desk'} Reservation: ${resource.name} (${schedule.date})`
    : `[Outlook Calendar] Confirmation: ${isRoom ? 'Meeting Room' : 'Desk'} ${resource.code} for ${schedule.date}`;

  const htmlContent = generateOutlookEmailHtml(params);
  const icsContent = generateIcsCalendar(params);
  const notificationId = `EML-${Date.now().toString().slice(-6)}`;

  let provider = 'outlook_simulated';

  // 1. Check if real Microsoft Graph API is configured via environment variables
  const clientId = process.env.MICROSOFT_CLIENT_ID || process.env.AZURE_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET || process.env.AZURE_CLIENT_SECRET;
  const tenantId = process.env.MICROSOFT_TENANT_ID || process.env.AZURE_TENANT_ID || 'common';

  if (clientId && clientSecret && tenantId !== 'common') {
    try {
      // Request App-only Access Token from Microsoft Entra ID
      const tokenRes = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'client_credentials',
          scope: 'https://graph.microsoft.com/.default'
        })
      });

      if (tokenRes.ok) {
        const tokenData: any = await tokenRes.json();
        const accessToken = tokenData.access_token;

        // Dispatch via Microsoft Graph API sendMail
        const graphRes = await fetch(`https://graph.microsoft.com/v1.0/users/${user.email}/sendMail`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: {
              subject,
              body: {
                contentType: 'HTML',
                content: htmlContent
              },
              toRecipients: [
                {
                  emailAddress: {
                    address: user.email,
                    name: user.name
                  }
                }
              ],
              attachments: [
                {
                  '@odata.type': '#microsoft.graph.fileAttachment',
                  name: `invite-${bookingId}.ics`,
                  contentType: 'text/calendar',
                  contentBytes: Buffer.from(icsContent).toString('base64')
                }
              ]
            },
            saveToSentItems: 'true'
          })
        });

        if (graphRes.ok) {
          provider = 'microsoft_graph_api';
          console.log(`[OUTLOOK EMAIL] Dispatched to ${user.email} via Microsoft Graph API.`);
        } else {
          const errText = await graphRes.text();
          console.warn(`[OUTLOOK EMAIL] Microsoft Graph API sendMail returned ${graphRes.status}:`, errText);
        }
      }
    } catch (graphError) {
      console.warn('[OUTLOOK EMAIL] Error communicating with Microsoft Graph API:', graphError);
    }
  }

  // 2. Persist in SQLite `email_notifications` outbox
  try {
    db.prepare(`
      INSERT INTO email_notifications (id, booking_id, recipient_email, recipient_name, subject, type, status, provider, html_content, ics_content)
      VALUES (?, ?, ?, ?, ?, ?, 'sent', ?, ?, ?)
    `).run(
      notificationId,
      bookingId,
      user.email,
      user.name,
      subject,
      type,
      provider,
      htmlContent,
      icsContent
    );

    // 3. Log to system audit trail
    db.prepare(`
      INSERT INTO system_logs (event_type, user_id, details)
      VALUES ('OUTLOOK_EMAIL_SENT', ?, ?)
    `).run(
      user.id,
      `Outlook confirmation email [${subject}] sent to ${user.name} (${user.email}) for booking ${bookingId} via ${provider}`
    );

    // 4. Also dispatch notification records to all invited attendees
    if (params.attendees && params.attendees.length > 0) {
      for (const att of params.attendees) {
        if (att.email && att.email.toLowerCase() !== user.email.toLowerCase()) {
          try {
            const attNotifId = `EML-${Date.now().toString().slice(-5)}-${att.id.slice(-4)}`;
            const attSubject = `[Microsoft Teams & Outlook] Invitation: ${resource.name} (${schedule.date} ${schedule.startTime}-${schedule.endTime})`;
            db.prepare(`
              INSERT INTO email_notifications (id, booking_id, recipient_email, recipient_name, subject, type, status, provider, html_content, ics_content)
              VALUES (?, ?, ?, ?, ?, ?, 'sent', ?, ?, ?)
            `).run(
              attNotifId,
              bookingId,
              att.email,
              att.name,
              attSubject,
              type,
              provider,
              htmlContent,
              icsContent
            );
          } catch (attErr) {
            console.warn('[OUTLOOK EMAIL] Failed to log attendee email:', attErr);
          }
        }
      }
    }
  } catch (dbErr) {
    console.error('[OUTLOOK EMAIL] Error logging email to SQLite database:', dbErr);
  }

  return {
    success: true,
    notificationId,
    recipient: user.email,
    subject,
    icsContent,
    provider
  };
}
