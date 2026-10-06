import { useEffect, useRef, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { Calendar, CheckCircle2, Clock, Inbox, Video, X } from 'lucide-react';
import api from '../../services/api';
import { useGoogleMeet } from '../../hooks/useGoogleMeet';

export const FacultySchedulesView = () => {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [activeStudents, setActiveStudents] = useState<any[]>([]);
  const [showDirectScheduleModal, setShowDirectScheduleModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<any | null>(null);
  const [newTime, setNewTime] = useState('');
  const [newMeeting, setNewMeeting] = useState({ title: '', description: '', startTime: '', participantEmail: '' });
  const { createGoogleMeet } = useGoogleMeet();

  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  const decoded: any = token ? jwtDecode(token) : null;
  const facultyEmail = decoded?.sub ? String(decoded.sub).trim() : '';
  const dateInputRef = useRef<HTMLInputElement | null>(null);
  const rescheduleInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [meetingsRes, appsRes] = await Promise.all([
        api.get(`/meetings/host?email=${facultyEmail}`).catch(() => ({ data: [] })),
        api.get(`/applications/faculty?email=${facultyEmail}`).catch(() => ({ data: [] }))
      ]);
      const facultyKey = `faculty_meetings_${facultyEmail}`;
      const facRaw = localStorage.getItem(facultyKey);
      let facLocal: any[] = facRaw ? JSON.parse(facRaw) : [];
      facLocal = facLocal.filter((m: any) => m && m.id && !m.id.toString().startsWith('init_') && !m.id.toString().startsWith('mock_'));
      localStorage.setItem(facultyKey, JSON.stringify(facLocal));

      const cleanEmail = (facultyEmail || '').trim().toLowerCase();
      const apiMeetings = (meetingsRes.data || []).filter((m: any) =>
        String(m.hostEmail || '').trim().toLowerCase() === cleanEmail
      );
      const mergedMap = new Map();
      [...facLocal, ...apiMeetings].forEach((m: any) => {
        if (m && m.id && !m.id.toString().startsWith('init_') && !m.id.toString().startsWith('mock_')) {
          mergedMap.set(m.id.toString(), m);
        }
      });

      setMeetings(Array.from(mergedMap.values()));
      const myApps = (appsRes.data || []).filter((app: any) =>
        String(app.facultyEmail || '').trim().toLowerCase() === cleanEmail
      );
      const uniqueStudents = myApps
        .filter((app: any) => app.status === 'SELECTED' || app.status === 'ACCEPTED')
        .filter((app: any, index: number, arr: any[]) =>
          arr.findIndex((item: any) => String(item.studentEmail || '').trim().toLowerCase() === String(app.studentEmail || '').trim().toLowerCase()) === index
        );
      setActiveStudents(uniqueStudents);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const handleDirectSchedule = async () => {
    if (!newMeeting.title || !newMeeting.startTime || !newMeeting.participantEmail) {
      return alert('Please fill in all required fields');
    }
    try {
      const googleMeet = await createGoogleMeet({
        title: newMeeting.title,
        description: newMeeting.description,
        startTime: newMeeting.startTime,
        organizerEmail: facultyEmail,
        attendeeEmails: [facultyEmail, newMeeting.participantEmail],
      });
      const response = await api.post('/meetings/schedule', {
        ...newMeeting,
        hostEmail: facultyEmail,
        type: 'ONLINE',
        meetingLink: googleMeet.meetingLink,
        googleCalendarEventId: googleMeet.calendarEventId,
      });
      alert(`Meeting scheduled successfully! Real Google Meet Link: ${response.data?.meetingLink || googleMeet.meetingLink}`);
      setShowDirectScheduleModal(false);
      setNewMeeting({ title: '', description: '', startTime: '', participantEmail: '' });
      fetchData();
    } catch (error: any) {
      alert(error?.response?.data?.message || error?.message || 'Failed to schedule meeting');
    }
  };

  const handleReschedule = async () => {
    if (!newTime) return alert('Please select a new time');
    try {
      await api.put(`/meetings/reschedule?id=${selectedMeeting.id}&newStartTime=${newTime}`);
      alert(`Meeting rescheduled to ${new Date(newTime).toLocaleString()}!`);
      setShowRescheduleModal(false);
      setSelectedMeeting(null);
      setNewTime('');
      fetchData();
    } catch (error) {
      alert('Failed to reschedule meeting');
    }
  };

  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');

  const nowTime = Date.now() - 3600000;

  // Upcoming meetings: sorted CHRONOLOGICALLY from earliest to latest (Tomorrow first, Day After Tomorrow next, etc.)
  const scheduledUpcoming = meetings
    .filter((m) => m.status === 'SCHEDULED' && new Date(m.startTime).getTime() >= nowTime)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  // Meeting History: past or completed meetings
  const meetingHistory = meetings
    .filter((m) => m.status === 'COMPLETED' || (m.status === 'SCHEDULED' && new Date(m.startTime).getTime() < nowTime))
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  return (
    <>
      <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at top, rgba(70, 95, 255, 0.22), transparent 36%), linear-gradient(180deg, #06112e 0%, #060d1f 100%)', color: '#e2e8f0', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '26px 28px 42px' }}>
        <div style={{ marginBottom: '18px' }}>
          <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => {
                setNewMeeting({ title: '', description: '', startTime: '', participantEmail: '' });
                setShowDirectScheduleModal(true);
              }}
              style={{
                border: 'none',
                cursor: 'pointer',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)',
                color: '#fff',
                fontWeight: 900,
                fontSize: '15px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 18px',
                boxShadow: '0 8px 18px rgba(59,130,246,0.35)'
              }}
            >
              <Video size={16} /> Direct schedule
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ACTIVE')}
              style={{
                border: '1px solid rgba(148, 163, 184, 0.12)',
                cursor: 'pointer',
                borderRadius: '14px',
                background: activeTab === 'ACTIVE' ? '#f8fafc' : 'rgba(148,163,184,0.08)',
                color: activeTab === 'ACTIVE' ? '#0f172a' : '#e2e8f0',
                fontWeight: 800,
                fontSize: '15px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 18px'
              }}
            >
              <Calendar size={16} /> Upcoming Meetings ({scheduledUpcoming.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('HISTORY')}
              style={{
                border: '1px solid rgba(148, 163, 184, 0.12)',
                cursor: 'pointer',
                borderRadius: '14px',
                background: activeTab === 'HISTORY' ? '#f8fafc' : 'rgba(148,163,184,0.08)',
                color: activeTab === 'HISTORY' ? '#0f172a' : '#e2e8f0',
                fontWeight: 800,
                fontSize: '15px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 18px'
              }}
            >
              <Inbox size={16} /> Meeting History ({meetingHistory.length})
            </button>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(125, 211, 252, 0.14)', paddingTop: '20px' }}>
          {activeTab === 'ACTIVE' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: '#f8fafc', fontSize: '22px', fontWeight: 800 }}>
                <CheckCircle2 size={20} color="#34d399" /> Upcoming Meetings (Earliest First)
              </div>

              {scheduledUpcoming.length === 0 ? (
                <div style={{ borderRadius: '26px', border: '1px solid rgba(148,163,184,0.18)', background: 'rgba(8, 13, 31, 0.72)', boxShadow: '0 8px 30px rgba(2, 6, 23, 0.25)', padding: '32px 28px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '18px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(65, 86, 155, 0.18)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#cbd5e1' }}>
                      <Calendar size={22} />
                    </div>
                    <div>
                      <div style={{ color: '#f8fafc', fontSize: '22px', fontWeight: 800 }}>No upcoming meetings</div>
                    </div>
                  </div>

                  <div style={{ color: '#cbd5e1', fontSize: '16px', lineHeight: 1.7, maxWidth: '720px' }}>
                    Direct schedule instantly using a Google Meet link for your student.
                  </div>

                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {scheduledUpcoming.map((m, idx) => {
                    const meetingDate = new Date(m.startTime);
                    const meetUrl = m.googleCalendarEventId && /^https:\/\/meet\.google\.com\//i.test(m.meetingLink || '')
                      ? m.meetingLink
                      : '';

                    return (
                      <div key={m.id} style={{ borderRadius: '18px', border: '1px solid rgba(148,163,184,0.18)', background: 'rgba(8, 13, 31, 0.72)', padding: '18px 18px 14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '12px' }}>
                          <div style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc' }}>{m.title}</div>
                          <span style={{ background: 'rgba(16,185,129,0.12)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.35)', borderRadius: '999px', padding: '6px 10px', fontSize: '11px', fontWeight: 800 }}>Scheduled</span>
                        </div>

                        <div style={{ color: '#bfdbfe', fontWeight: 700, fontSize: '12px', marginBottom: '10px' }}>
                          <Clock size={12} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} /> #{idx + 1} Upcoming Meeting · {meetingDate.toLocaleString()}
                        </div>

                        {meetUrl ? (
                          <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(96,165,250,0.25)', borderRadius: '12px', padding: '8px 12px', color: '#f8fafc', display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'ui-monospace, monospace' }}>{meetUrl}</span>
                            <button type="button" onClick={() => navigator.clipboard.writeText(meetUrl)} style={{ background: 'rgba(99,102,241,0.18)', color: '#c7d2fe', border: '1px solid rgba(99,102,241,0.35)', borderRadius: '8px', padding: '6px 10px', fontWeight: 800, cursor: 'pointer' }}>Copy Link</button>
                          </div>
                        ) : (
                          <div style={{ color: '#fbbf24', fontSize: '12px' }}>No verified Google Meet link is available for this meeting.</div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
                          <div style={{ color: '#cbd5e1', fontSize: '12px' }}>Student: {m.participantEmail}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <button type="button" onClick={() => { setSelectedMeeting(m); setNewTime(m.startTime.substring(0, 16)); setShowRescheduleModal(true); }} style={{ border: 'none', background: 'transparent', color: '#fbbf24', cursor: 'pointer', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Clock size={12} /> Reschedule</button>
                            {meetUrl && <a href={meetUrl} target="_blank" rel="noreferrer" style={{ border: 'none', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', textDecoration: 'none', fontWeight: 800, borderRadius: '10px', padding: '8px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Video size={12} /> Join Meet</a>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'HISTORY' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: '#f8fafc', fontSize: '22px', fontWeight: 800 }}>
                <Inbox size={20} color="#94a3b8" /> Meeting History (Past & Completed)
              </div>

              {meetingHistory.length === 0 ? (
                <div style={{ borderRadius: '18px', border: '1px solid rgba(148,163,184,0.18)', background: 'rgba(8, 13, 31, 0.72)', padding: '28px 18px', color: '#cbd5e1', textAlign: 'center', fontSize: '16px' }}>
                  No meeting history
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {meetingHistory.map((m) => (
                    <div key={m.id} style={{ borderRadius: '18px', border: '1px solid rgba(148,163,184,0.18)', background: 'rgba(8, 13, 31, 0.72)', padding: '18px 18px 14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc' }}>{m.title}</div>
                        <span style={{ background: 'rgba(148,163,184,0.12)', color: '#cbd5e1', border: '1px solid rgba(148,163,184,0.24)', borderRadius: '999px', padding: '6px 10px', fontSize: '11px', fontWeight: 800 }}>Past Meeting</span>
                      </div>
                      <div style={{ marginTop: '8px', color: '#cbd5e1', fontSize: '12px' }}>Student: {m.participantEmail} · {new Date(m.startTime).toLocaleString()}</div>
                      {m.description && <div style={{ marginTop: '8px', color: '#cbd5e1', fontSize: '13px' }}>{m.description}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showDirectScheduleModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.7)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ position: 'absolute', inset: 0 }} onClick={() => setShowDirectScheduleModal(false)} />
          <div style={{ position: 'relative', width: '100%', maxWidth: '560px', borderRadius: '24px', background: 'linear-gradient(180deg, rgba(8, 13, 31, 0.96), rgba(15, 23, 42, 0.96))', border: '1px solid rgba(125, 211, 252, 0.18)', boxShadow: '0 24px 60px rgba(2, 6, 23, 0.65)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 24px 18px', borderBottom: '1px solid rgba(148,163,184,0.12)' }}>
              <div>
                <div style={{ fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 800 }}>Direct schedule</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#f8fafc', marginTop: '4px' }}>Schedule a Google Meet</div>
              </div>
              <button type="button" onClick={() => setShowDirectScheduleModal(false)} style={{ border: 'none', width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(148,163,184,0.12)', color: '#e2e8f0', cursor: 'pointer' }}><X size={16} /></button>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gap: '18px' }}>
                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', fontWeight: 700, marginBottom: '8px' }}>Select student</label>
                  <input
                    type="text"
                    list="student-email-options"
                    placeholder="Type or search a student"
                    value={newMeeting.participantEmail}
                    onChange={(e) => setNewMeeting({ ...newMeeting, participantEmail: e.target.value })}
                    style={{ width: '100%', borderRadius: '14px', border: '1px solid rgba(148,163,184,0.2)', background: 'rgba(15, 23, 42, 0.88)', color: '#f8fafc', padding: '14px 16px', fontSize: '15px', outline: 'none' }}
                  />
                  <datalist id="student-email-options">
                    {activeStudents.map((app) => (
                      <option key={app.id} value={app.studentEmail} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', fontWeight: 700, marginBottom: '8px' }}>Meeting title</label>
                  <input type="text" placeholder="e.g. Weekly progress review" value={newMeeting.title} onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })} style={{ width: '100%', borderRadius: '14px', border: '1px solid rgba(148,163,184,0.2)', background: 'rgba(15, 23, 42, 0.88)', color: '#f8fafc', padding: '14px 16px', fontSize: '15px', outline: 'none' }} />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', fontWeight: 700, marginBottom: '8px' }}>Date &amp; time</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      ref={dateInputRef}
                      type="datetime-local"
                      value={newMeeting.startTime}
                      onChange={(e) => setNewMeeting({ ...newMeeting, startTime: e.target.value })}
                      style={{ width: '100%', borderRadius: '14px', border: '1px solid rgba(148,163,184,0.2)', background: 'rgba(15, 23, 42, 0.88)', color: '#f8fafc', padding: '14px 44px 14px 16px', fontSize: '15px', outline: 'none', WebkitAppearance: 'textfield', appearance: 'textfield' }}
                    />
                    <button
                      type="button"
                      onClick={() => dateInputRef.current?.showPicker?.()}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '22px', height: '22px', border: 'none', background: 'transparent', color: '#dbeafe', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Calendar size={16} />
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', fontWeight: 700, marginBottom: '8px' }}>Description (optional)</label>
                  <textarea placeholder="Add meeting notes or agenda…" value={newMeeting.description} onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })} rows={4} style={{ width: '100%', resize: 'vertical', borderRadius: '14px', border: '1px solid rgba(148,163,184,0.2)', background: 'rgba(15, 23, 42, 0.88)', color: '#f8fafc', padding: '14px 16px', fontSize: '15px', outline: 'none' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
                <button type="button" onClick={() => setShowDirectScheduleModal(false)} style={{ border: 'none', background: 'rgba(148,163,184,0.12)', color: '#f8fafc', fontWeight: 800, borderRadius: '14px', padding: '12px 18px', cursor: 'pointer' }}>Cancel</button>
                <button type="button" onClick={handleDirectSchedule} style={{ border: 'none', background: 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)', color: '#fff', fontWeight: 900, borderRadius: '14px', padding: '12px 22px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}><Video size={16} /> Schedule meet</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRescheduleModal && selectedMeeting && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.7)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ position: 'absolute', inset: 0 }} onClick={() => setShowRescheduleModal(false)} />
          <div style={{ position: 'relative', width: '100%', maxWidth: '480px', borderRadius: '24px', background: 'linear-gradient(180deg, rgba(8, 13, 31, 0.96), rgba(15, 23, 42, 0.96))', border: '1px solid rgba(125, 211, 252, 0.18)', boxShadow: '0 24px 60px rgba(2, 6, 23, 0.65)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 24px 18px', borderBottom: '1px solid rgba(148,163,184,0.12)' }}>
              <div>
                <div style={{ fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 800 }}>Reschedule meeting</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#f8fafc', marginTop: '4px' }}>{selectedMeeting.title}</div>
              </div>
              <button type="button" onClick={() => setShowRescheduleModal(false)} style={{ border: 'none', width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(148,163,184,0.12)', color: '#e2e8f0', cursor: 'pointer' }}><X size={16} /></button>
            </div>

            <div style={{ padding: '24px' }}>
              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontWeight: 700, marginBottom: '8px' }}>New date &amp; time</label>
                <div style={{ position: 'relative' }}>
                  <input
                    ref={rescheduleInputRef}
                    type="datetime-local"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    style={{ width: '100%', borderRadius: '14px', border: '1px solid rgba(148,163,184,0.2)', background: 'rgba(15, 23, 42, 0.88)', color: '#f8fafc', padding: '14px 44px 14px 16px', fontSize: '15px', outline: 'none', WebkitAppearance: 'textfield', appearance: 'textfield' }}
                  />
                  <button
                    type="button"
                    onClick={() => rescheduleInputRef.current?.showPicker?.()}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '22px', height: '22px', border: 'none', background: 'transparent', color: '#fbbf24', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Calendar size={16} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
                <button type="button" onClick={() => setShowRescheduleModal(false)} style={{ border: 'none', background: 'rgba(148,163,184,0.12)', color: '#f8fafc', fontWeight: 800, borderRadius: '14px', padding: '12px 18px', cursor: 'pointer' }}>Cancel</button>
                <button type="button" onClick={handleReschedule} style={{ border: 'none', background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)', color: '#fff', fontWeight: 900, borderRadius: '14px', padding: '12px 18px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}><Clock size={16} /> Confirm reschedule</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </>
  );
};

export default FacultySchedulesView;
