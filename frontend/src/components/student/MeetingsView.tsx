import React, { useState, useEffect } from 'react';
import { Calendar, Video, Clock, Inbox } from 'lucide-react';
import api from '../../services/api';
import { SectionHead, Spinner, PrimaryButton, EmptyState, Pill } from './ui';
import RequestMeetingModal from './modals/RequestMeetingModal';
import { useGoogleMeet } from '../../hooks/useGoogleMeet';

export const MeetingsView = ({ studentEmail }: { studentEmail: string }) => {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [activeApps, setActiveApps] = useState<any[]>([]);
  const [selectedAppId, setSelectedAppId] = useState('');
  const [form, setForm] = useState({ title: 'Weekly progress review', description: '', startTime: '' });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const { createGoogleMeet } = useGoogleMeet();

  useEffect(() => {
    if (!studentEmail) return;
    const fetchMeetingsData = async () => {
      setLoading(true);
      try {
        const [mRes, aRes] = await Promise.all([
          api.get(`/meetings/participant?email=${studentEmail}`).catch(() => ({ data: [] })),
          api.get(`/applications/student?email=${studentEmail}`).catch(() => ({ data: [] })),
        ]);
        const sel = (aRes.data || []).filter((a: any) => a.status === 'SELECTED' || a.status === 'ACCEPTED');
        setActiveApps(sel);
        if (sel.length) setSelectedAppId(sel[0].id.toString());

        const localKey = `student_meetings_${studentEmail}`;
        const localRaw = localStorage.getItem(localKey);
        let localMeetings: any[] = localRaw ? JSON.parse(localRaw) : [];

        localMeetings = localMeetings.filter((m: any) => {
          if (!m || !m.id) return false;
          const idStr = m.id.toString();
          if (idStr.startsWith('init_') || idStr.startsWith('mock_')) return false;
          if (m.title === 'Weekly progress review' && m.startTime && new Date(m.startTime).getTime() < Date.now() - 86400000) return false;
          return true;
        });
        localStorage.setItem(localKey, JSON.stringify(localMeetings));

        const apiMeetings = mRes.data || [];
        const mergedMap = new Map();
        [...localMeetings, ...apiMeetings].forEach((m: any) => {
          if (m && m.id && !m.id.toString().startsWith('init_') && !m.id.toString().startsWith('mock_')) {
            if (!(m.title === 'Weekly progress review' && m.startTime && new Date(m.startTime).getTime() < Date.now() - 86400000)) {
              mergedMap.set(m.id.toString(), m);
            }
          }
        });

        const mergedList = Array.from(mergedMap.values());
        setMeetings(mergedList);
      } finally {
        setLoading(false);
      }
    };
    fetchMeetingsData();
  }, [studentEmail]);

  const handleCancelRequest = (meetingId: number | string) => {
    if (window.confirm('Are you sure you want to cancel this meeting request?')) {
      const updated = meetings.filter((m) => m.id.toString() !== meetingId.toString());
      setMeetings(updated);
      const localKey = `student_meetings_${studentEmail}`;
      localStorage.setItem(localKey, JSON.stringify(updated));
      alert('Meeting request cancelled successfully.');
    }
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.startTime) return alert('Fill in title and time');
    const app = activeApps.find((a) => a.id.toString() === selectedAppId) || activeApps[0];
    const facultyMail = app?.facultyEmail;
    if (!facultyMail) return alert('No faculty supervisor associated with this application.');

    setSubmitting(true);
    try {
      const googleMeet = await createGoogleMeet({
        title: form.title,
        description: form.description,
        startTime: form.startTime,
        organizerEmail: studentEmail,
        attendeeEmails: [studentEmail, facultyMail],
      });
      const response = await api.post('/meetings/request', {
        title: form.title,
        description: form.description,
        startTime: new Date(form.startTime).toISOString(),
        hostEmail: facultyMail,
        participantEmail: studentEmail,
        status: 'REQUESTED',
        type: 'REQUESTED',
        meetingLink: googleMeet.meetingLink,
        googleCalendarEventId: googleMeet.calendarEventId,
      });
      const newMeetObj = response.data;
      const localKey = `student_meetings_${studentEmail}`;
      const existingRaw = localStorage.getItem(localKey);
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      const updated = [newMeetObj, ...existing];
      localStorage.setItem(localKey, JSON.stringify(updated));

      const facultyKey = `faculty_meetings_${facultyMail}`;
      const facRaw = localStorage.getItem(facultyKey);
      const facExisting = facRaw ? JSON.parse(facRaw) : [];
      localStorage.setItem(facultyKey, JSON.stringify([newMeetObj, ...facExisting]));

      setMeetings(updated);
      setShowModal(false);
      setForm({ title: 'Weekly progress review', description: '', startTime: '' });
      alert(`Meeting requested successfully. Real Google Meet link: ${newMeetObj.meetingLink}`);
    } catch (error: any) {
      alert(error?.response?.data?.message || error?.message || 'Could not create the meeting request.');
    } finally {
      setSubmitting(false);
    }
  };

  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
  const nowTime = Date.now() - 3600000;

  const scheduledUpcoming = meetings
    .filter((m) => m.status === 'SCHEDULED' && new Date(m.startTime).getTime() >= nowTime)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const meetingHistory = meetings
    .filter((m) => m.status === 'COMPLETED' || (m.status === 'SCHEDULED' && new Date(m.startTime).getTime() < nowTime))
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  if (loading) return <Spinner />;

  const currentFacultyEmail = activeApps.find((a) => a.id.toString() === selectedAppId)?.facultyEmail || activeApps[0]?.facultyEmail;

  return (
    <div className="font-sans">
      <SectionHead
        title="Meeting Schedule"
        sub="Request and view scheduled meetings with your faculty supervisor."
        action={
          activeApps.length > 0 && (
            <PrimaryButton onClick={() => setShowModal(true)}>
              <Calendar size={14} /> Request meeting
            </PrimaryButton>
          )
        }
      />

      {/* TABS HEADER */}
      <div className="flex items-center gap-2 mb-6 border-b border-sky-500/30 pb-3 flex-wrap">
        <button
          type="button"
          onClick={() => setActiveTab('ACTIVE')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'ACTIVE'
              ? 'bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 text-white shadow-md shadow-cyan-500/20'
              : 'bg-[#0a1e4e]/90 border border-sky-500/30 text-slate-300 hover:text-white hover:bg-blue-900/60'
          }`}
        >
          <Calendar size={14} /> Upcoming Meetings ({scheduledUpcoming.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('HISTORY')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'HISTORY'
              ? 'bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 text-white shadow-md shadow-cyan-500/20'
              : 'bg-[#0a1e4e]/90 border border-sky-500/30 text-slate-300 hover:text-white hover:bg-blue-900/60'
          }`}
        >
          <Inbox size={14} /> Meeting History ({meetingHistory.length})
        </button>
      </div>

      {/* 1. UPCOMING MEETINGS TAB */}
      {activeTab === 'ACTIVE' && (
        <div>
          <div className="text-[10px] font-black text-slate-300 uppercase tracking-wide mb-3">Upcoming Meetings (Earliest First)</div>
          {scheduledUpcoming.length === 0 ? (
            <EmptyState icon={Video} title="No upcoming meetings" sub="Request one from your faculty supervisor." />
          ) : (
            <div className="space-y-3">
              {scheduledUpcoming.map((m, idx) => {
                const meetingDate = new Date(m.startTime);
                const meetUrl = m.googleCalendarEventId && /^https:\/\/meet\.google\.com\//i.test(m.meetingLink || '')
                  ? m.meetingLink
                  : '';

                return (
                  <div key={m.id} className="bg-[#0a1e4e]/85 border border-sky-500/30 backdrop-blur-md rounded-2xl p-5 shadow-lg shadow-blue-950/40 hover:border-cyan-500/40 transition duration-300">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-cyan-400">
                        <Clock size={13} />
                        #{idx + 1} UPCOMING MEETING · {meetingDate.toLocaleString()}
                      </div>
                      <Pill color="indigo">Scheduled</Pill>
                    </div>

                    <div className="text-sm font-extrabold text-white">{m.title}</div>
                    <div className="text-xs text-slate-300 font-medium mt-0.5">Faculty Supervisor: <span className="text-slate-300">{m.hostEmail}</span></div>

                    {meetUrl ? (
                      <div className="mt-3 text-xs font-mono bg-[#06163d]/90 border border-cyan-500/30 rounded-xl p-3 flex items-center justify-between gap-2">
                        <span className="truncate text-cyan-300 font-bold">{meetUrl}</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(meetUrl);
                            alert('Google Meet link copied to clipboard!');
                          }}
                          className="text-[11px] font-extrabold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-lg hover:bg-amber-500/25 transition flex-shrink-0 cursor-pointer"
                        >
                          📋 Copy Link
                        </button>
                      </div>
                    ) : (
                      <p className="mt-3 text-xs font-semibold text-amber-300">No verified Google Meet link is available for this meeting.</p>
                    )}

                    <div className="flex items-center justify-between gap-2 mt-4 flex-wrap">
                      {meetUrl && <a
                        href={meetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-extrabold text-white bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 hover:brightness-110 rounded-full px-4 py-2 transition shadow-md shadow-cyan-500/20 no-underline"
                      >
                        <Video size={14} className="text-white" /> 🎥 Join Google Meet
                      </a>}
                      <button
                        type="button"
                        onClick={() => handleCancelRequest(m.id)}
                        className="text-[11px] font-bold text-rose-400 hover:text-rose-300 transition cursor-pointer"
                      >
                        Cancel Meeting
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. MEETING HISTORY TAB */}
      {activeTab === 'HISTORY' && (
        <div>
          <div className="text-[10px] font-black text-slate-300 uppercase tracking-wide mb-3">Meeting History (Past & Completed Meetings)</div>
          {meetingHistory.length === 0 ? (
            <EmptyState icon={Inbox} title="No past meeting history" />
          ) : (
            <div className="space-y-3">
              {meetingHistory.map((m) => (
                <div key={m.id} className="bg-[#0a1e4e]/70 border border-sky-500/30 backdrop-blur-md rounded-2xl p-4 opacity-80 hover:opacity-100 transition">
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <div className="text-sm font-bold text-white">{m.title}</div>
                    <span className="bg-[#06163d]/80 text-slate-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-sky-500/30">
                      Past Meeting
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-medium">{new Date(m.startTime).toLocaleString()}</div>
                  {m.description && <div className="text-xs text-slate-300 mt-1">{m.description}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <RequestMeetingModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleRequestSubmit}
        form={form}
        setForm={setForm}
        facultyEmail={currentFacultyEmail}
        submitting={submitting}
      />
    </div>
  );
};

export default MeetingsView;
