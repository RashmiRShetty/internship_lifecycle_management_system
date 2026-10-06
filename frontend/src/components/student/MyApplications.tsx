import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Search, MessageSquare, Award, Inbox } from 'lucide-react';
import api from '../../services/api';
import { SectionHead, Spinner, PrimaryButton, SecondaryButton, EmptyState, Pill } from './ui';
import { toTitleCase } from '../../utils/matchHelpers';

interface MyApplicationsProps {
  applications?: any[];
  onViewOffer: (application: any) => void;
  onContactFaculty: (facultyData: any) => void;
  loading?: boolean;
  onSelectInternship: (internship: any) => void;
  internships?: any[];
}

export const MyApplications: React.FC<MyApplicationsProps> = ({
  applications = [],
  onViewOffer,
  onContactFaculty,
  loading = false,
  onSelectInternship,
  internships = [],
}) => {
  const [filterTab, setFilterTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const totalCount = applications.length;
  const underReviewCount = applications.filter((a: any) => a.status === 'APPLIED' || a.status === 'UNDER_REVIEW').length;
  const shortlistedCount = applications.filter((a: any) => a.status === 'SHORTLISTED' || a.status === 'INTERVIEW').length;
  const selectedCount = applications.filter((a: any) => a.status === 'SELECTED').length;
  const rejectedCount = applications.filter((a: any) => a.status === 'REJECTED').length;

  const handleOpenDetails = (internshipId: any) => {
    const found = internships.find((i: any) => i.id === internshipId);
    if (found) {
      onSelectInternship(found);
    } else {
      onSelectInternship({
        id: internshipId,
        title: 'Internship Details',
        description: 'Detailed information for this application.',
      });
    }
  };

  const handleContactFaculty = async (facultyEmail: string, internshipTitle: string) => {
    const targetEmail = facultyEmail?.trim() || 'faculty@manipal.edu';
    try {
      const r = await api.get(`/users/by-email?email=${encodeURIComponent(targetEmail)}`);
      onContactFaculty({ ...r.data, email: targetEmail, internshipTitle });
    } catch {
      onContactFaculty({
        email: targetEmail,
        firstName: 'Faculty',
        lastName: 'Supervisor',
        internshipTitle,
      });
    }
  };

  const filteredApps = applications.filter((a: any) => {
    const matchesTab =
      filterTab === 'ALL'
        ? true
        : filterTab === 'UNDER_REVIEW'
        ? a.status === 'APPLIED' || a.status === 'UNDER_REVIEW'
        : filterTab === 'SHORTLISTED'
        ? a.status === 'SHORTLISTED' || a.status === 'INTERVIEW'
        : filterTab === 'SELECTED'
        ? a.status === 'SELECTED'
        : filterTab === 'REJECTED'
        ? a.status === 'REJECTED'
        : true;

    const matchesSearch =
      !searchQuery ||
      a.internshipTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.facultyEmail?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const getPillTone = (status: string) => {
    switch (status) {
      case 'SELECTED':
        return 'green';
      case 'SHORTLISTED':
      case 'INTERVIEW':
        return 'purple';
      case 'UNDER_REVIEW':
      case 'APPLIED':
        return 'blue';
      case 'REJECTED':
        return 'red';
      default:
        return 'slate';
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6 pb-10 w-full font-sans text-slate-100">
      <SectionHead
        title="My Applications"
        sub="Track the real-time evaluation status and progress of your internship applications."
        action={
          <Link to="/student/internships">
            <PrimaryButton className="gap-2">
              <Search size={14} /> Browse internships
            </PrimaryButton>
          </Link>
        }
      />

      {/* Filter Tabs & Search Bar */}
      <div className="bg-[#0a1e4e]/85 rounded-3xl border border-sky-500/30 p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: `All (${totalCount})` },
            { id: 'UNDER_REVIEW', label: `Under Review (${underReviewCount})` },
            { id: 'SHORTLISTED', label: `Shortlisted (${shortlistedCount})` },
            { id: 'SELECTED', label: `Selected (${selectedCount})` },
            { id: 'REJECTED', label: `Rejected (${rejectedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                filterTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                  : 'bg-[#06163d]/90 text-slate-300 hover:bg-blue-900/60 border border-sky-500/30'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64 bg-[#06163d]/90 rounded-full px-4 py-2 flex items-center gap-2 border border-sky-500/30 focus-within:border-cyan-400 transition">
          <Search size={14} className="text-cyan-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search applied roles..."
            className="bg-transparent text-xs outline-none w-full text-white placeholder-slate-400 font-semibold"
          />
        </div>
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No applications yet"
          sub="You haven't submitted any internship applications yet. Explore open roles and get started!"
          action={
            <Link to="/student/internships">
              <PrimaryButton>Browse internships</PrimaryButton>
            </Link>
          }
        />
      ) : filteredApps.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No applications match your filter"
          sub="Try selecting a different filter tab or clearing your search term."
          action={
            <SecondaryButton
              onClick={() => {
                setFilterTab('ALL');
                setSearchQuery('');
              }}
            >
              Reset filters
            </SecondaryButton>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredApps.map((a: any) => {
            const matchedInternship = internships.find((i: any) => i.id === a.internshipId);

            return (
              <div
                key={a.id}
                className="bg-[#0a1e4e]/85 rounded-3xl border border-sky-500/30 p-5 shadow-xl hover:border-cyan-500/40 backdrop-blur-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center font-black text-base shrink-0 shadow-md cursor-pointer"
                      onClick={() => handleOpenDetails(a.internshipId)}
                    >
                      {a.internshipTitle?.[0] ?? 'I'}
                    </div>
                    <Pill color={getPillTone(a.status)}>{a.status}</Pill>
                  </div>

                  <h3
                    onClick={() => handleOpenDetails(a.internshipId)}
                    className="text-base font-black text-white hover:text-cyan-400 cursor-pointer transition line-clamp-1 mb-2"
                  >
                    {toTitleCase(a.internshipTitle)}
                  </h3>

                  <div className="text-xs text-slate-300 font-medium space-y-1 mb-4">
                    <div className="truncate">
                      Supervisor: <strong className="text-white">{a.facultyEmail}</strong>
                    </div>
                    <div>
                      Applied on:{' '}
                      <strong className="text-white">
                        {new Date(a.appliedAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </strong>
                    </div>
                    {matchedInternship?.mode && (
                      <div className="text-[11px] font-bold text-amber-400 mt-1">
                        Mode: {matchedInternship.mode}{' '}
                        {matchedInternship?.stipend ? `· Stipend: ${matchedInternship.stipend}` : ''}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-700 flex items-center gap-2 flex-wrap justify-between">
                  <SecondaryButton className="px-3 py-1.5 text-xs" onClick={() => handleOpenDetails(a.internshipId)}>
                    <Search size={13} /> View role
                  </SecondaryButton>

                  <SecondaryButton
                    className="px-3 py-1.5 text-xs"
                    onClick={() => handleContactFaculty(a.facultyEmail, a.internshipTitle)}
                  >
                    <MessageSquare size={13} /> Contact
                  </SecondaryButton>

                  {a.status === 'SELECTED' && (
                    <PrimaryButton
                      className="px-3 py-1.5 text-xs"
                      onClick={() => onViewOffer(a)}
                    >
                      <Award size={13} /> View offer
                    </PrimaryButton>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyApplications;
