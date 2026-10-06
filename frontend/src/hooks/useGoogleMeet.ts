import { useRef } from 'react';
import { useGoogleLogin } from '@react-oauth/google';

interface GoogleMeetEventInput {
  title: string;
  description?: string;
  startTime: string;
  organizerEmail: string;
  attendeeEmails: string[];
}

interface GoogleCalendarEvent {
  id: string;
  hangoutLink?: string;
  conferenceData?: {
    entryPoints?: Array<{ entryPointType?: string; uri?: string }>;
  };
}

export const useGoogleMeet = () => {
  const tokenCallbacks = useRef<{
    resolve: (token: string) => void;
    reject: (error: Error) => void;
  } | null>(null);

  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.email',
    onSuccess: (response) => {
      tokenCallbacks.current?.resolve(response.access_token);
      tokenCallbacks.current = null;
    },
    onError: (error) => {
      tokenCallbacks.current?.reject(new Error(error.error_description || error.error || 'Google authorization failed.'));
      tokenCallbacks.current = null;
    },
    onNonOAuthError: (error) => {
      tokenCallbacks.current?.reject(new Error(`Google authorization could not complete (${error.type}).`));
      tokenCallbacks.current = null;
    },
  });

  const requestAccessToken = () => new Promise<string>((resolve, reject) => {
    tokenCallbacks.current = { resolve, reject };
    login({ prompt: '' });
  });

  const createGoogleMeet = async ({
    title,
    description = '',
    startTime,
    organizerEmail,
    attendeeEmails,
  }: GoogleMeetEventInput): Promise<{ meetingLink: string; calendarEventId: string }> => {
    const startDate = new Date(startTime);
    if (Number.isNaN(startDate.getTime())) {
      throw new Error('Choose a valid meeting date and time.');
    }

    const accessToken = await requestAccessToken();
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!profileResponse.ok) {
      throw new Error('Could not verify the Google account. Please authorize the account used for this meeting.');
    }

    const profile = await profileResponse.json();
    if (String(profile.email || '').trim().toLowerCase() !== organizerEmail.trim().toLowerCase()) {
      throw new Error(`Sign in with ${organizerEmail} to create the meeting on the correct calendar.`);
    }

    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const attendees = [...new Set(attendeeEmails.map((email) => email.trim().toLowerCase()).filter(Boolean))]
      .filter((email) => email !== organizerEmail.trim().toLowerCase())
      .map((email) => ({ email }));

    const createResponse = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all',
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          summary: title,
          description,
          start: { dateTime: startDate.toISOString(), timeZone: timezone },
          end: { dateTime: endDate.toISOString(), timeZone: timezone },
          attendees,
          conferenceData: {
            createRequest: {
              requestId: crypto.randomUUID(),
              conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
          },
        }),
      }
    );

    const createPayload = await createResponse.json().catch(() => ({}));
    if (!createResponse.ok) {
      throw new Error(createPayload.error?.message || 'Google Calendar could not create the meeting. Check that Calendar API is enabled and Calendar access is granted.');
    }

    const event = createPayload as GoogleCalendarEvent;
    const getMeetingLink = (calendarEvent: GoogleCalendarEvent) =>
      calendarEvent.hangoutLink ||
      calendarEvent.conferenceData?.entryPoints?.find((entry) => entry.entryPointType === 'video')?.uri ||
      '';

    let meetingLink = getMeetingLink(event);
    for (let attempt = 0; !meetingLink && attempt < 8; attempt += 1) {
      await new Promise((resolve) => window.setTimeout(resolve, 1000));
      const eventResponse = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(event.id)}?conferenceDataVersion=1`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (!eventResponse.ok) break;
      meetingLink = getMeetingLink(await eventResponse.json());
    }

    if (!meetingLink) {
      throw new Error('Google created the calendar event, but the Meet link is still being prepared. Please try again shortly.');
    }

    return { meetingLink, calendarEventId: event.id };
  };

  return { createGoogleMeet };
};
