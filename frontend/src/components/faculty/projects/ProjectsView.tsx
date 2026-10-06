import React from 'react';
import { useProjectsData } from '../../../hooks/useProjectsData';
import { ProjectListPage } from './ProjectListPage';
import { ProjectDetailPage } from './ProjectDetailPage';
import { AssignTasksPage } from './AssignTasksPage';
import { StudentWorkspaceView } from '../StudentWorkspaceView';
import { CreateProjectModal } from '../CreateProjectModal';
import { EditProjectModal } from '../EditProjectModal';
import { AssignTaskAnytimeModal } from '../AssignTaskAnytimeModal';
import { ReviewModal } from '../ReviewModal';
import { FeedbackModal } from '../FeedbackModal';
import { SingleEditCandidateRoleModal } from '../SingleEditCandidateRoleModal';
import { DeletePasswordModal } from '../DeletePasswordModal';
import { isApplicantAssignableToProject } from '../../../utils/projectAssignmentUtils';

export const ProjectsView: React.FC = () => {
  const {
    internships,
    projects,
    setProjects,
    facultyApplications,
    loading,
    activeProjectDetail,
    setActiveProjectDetail,
    showAssignTaskModal,
    setShowAssignTaskModal,
    showAssignTaskAnytimeModal,
    setShowAssignTaskAnytimeModal,
    anytimeTaskForm,
    setAnytimeTaskForm,
    roleInputs,
    setRoleInputs,
    taskInputs,
    setTaskInputs,
    editingIndividualCandidate,
    setEditingIndividualCandidate,
    singleRoleInput,
    setSingleRoleInput,
    singleDescInput,
    setSingleDescInput,
    singleEditError,
    setSingleEditError,
    showDeletePasswordModal,
    setShowDeletePasswordModal,
    projectToDelete,
    setProjectToDelete,
    deletePasswordInput,
    setDeletePasswordInput,
    showCreateModal,
    setShowCreateModal,
    showEditModal,
    setShowEditModal,
    editingProject,
    setEditingProject,
    projectForm,
    setProjectForm,
    handleDeleteProject,
    viewingStudentProfile,
    setViewingStudentProfile,
    studentMeetingsMap,
    studentReviewsMap,
    studentAcceptanceMap,
    studentFeedbackMap,
    showReviewModal,
    setShowReviewModal,
    reviewForm,
    setReviewForm,
    showFeedbackModal,
    setShowFeedbackModal,
    feedbackForm,
    setFeedbackForm,
    handleSaveReview,
    handleSaveFeedback,
    handleCreateProject,
    handleUpdateProject,
    handleAssignTaskAnytime,
    handleSaveTaskAssignments,
    handleSaveSingleCandidateRole,
  } = useProjectsData();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', fontWeight: 600 }}>
        Loading Project Management Engine...
      </div>
    );
  }

  // 1. FULL PAGE VIEW: Student Workspace View
  if (activeProjectDetail && viewingStudentProfile) {
    return (
      <>
        <StudentWorkspaceView
          activeProjectDetail={activeProjectDetail}
          viewingStudentProfile={viewingStudentProfile}
          setViewingStudentProfile={setViewingStudentProfile}
          studentMeetingsMap={studentMeetingsMap}
          studentReviewsMap={studentReviewsMap}
          studentAcceptanceMap={studentAcceptanceMap}
          studentFeedbackMap={studentFeedbackMap}
          setAnytimeTaskForm={setAnytimeTaskForm}
          setShowAssignTaskAnytimeModal={setShowAssignTaskAnytimeModal}
          handleOpenSingleEditModal={(item) => {
            setEditingIndividualCandidate(item);
            setSingleRoleInput(item.role || item.task || '');
            setSingleDescInput(item.description || '');
            setSingleEditError('');
          }}
          setReviewForm={setReviewForm}
          setShowReviewModal={setShowReviewModal}
          setFeedbackForm={setFeedbackForm}
          setShowFeedbackModal={setShowFeedbackModal}
        />
        <AssignTaskAnytimeModal
          show={showAssignTaskAnytimeModal}
          onClose={() => setShowAssignTaskAnytimeModal(false)}
          form={anytimeTaskForm}
          setForm={setAnytimeTaskForm}
          onSubmit={handleAssignTaskAnytime}
        />
        <SingleEditCandidateRoleModal
          candidate={editingIndividualCandidate}
          onClose={() => setEditingIndividualCandidate(null)}
          singleRoleInput={singleRoleInput}
          setSingleRoleInput={setSingleRoleInput}
          singleDescInput={singleDescInput}
          setSingleDescInput={setSingleDescInput}
          singleEditError={singleEditError}
          onSave={(e) => {
            e.preventDefault();
            if (!singleRoleInput) return setSingleEditError('Role title is required');
            handleSaveSingleCandidateRole(editingIndividualCandidate, singleRoleInput, singleDescInput);
          }}
        />
      </>
    );
  }

  // 2. FULL PAGE VIEW: Manage Candidate Roles Table
  if (activeProjectDetail && showAssignTaskModal) {
    return (
      <AssignTasksPage
        activeProjectDetail={activeProjectDetail}
        facultyApplications={facultyApplications}
        roleInputs={roleInputs}
        setRoleInputs={setRoleInputs}
        taskInputs={taskInputs}
        setTaskInputs={setTaskInputs}
        onBack={() => setShowAssignTaskModal(false)}
        onSaveTaskAssignments={() => {
          handleSaveTaskAssignments(activeProjectDetail, facultyApplications);
        }}
      />
    );
  }

  // 3. FULL PAGE VIEW: Single Project Details View
  if (activeProjectDetail) {
    return (
      <>
        <ProjectDetailPage
          activeProjectDetail={activeProjectDetail}
          facultyApplications={facultyApplications}
          onBack={() => setActiveProjectDetail(null)}
          onSelectStudentProfile={(student: any) => setViewingStudentProfile(student)}
          onOpenSingleEditModal={(candidate: any) => {
            setEditingIndividualCandidate(candidate);
            setSingleRoleInput(candidate.role || candidate.task || '');
            setSingleDescInput(candidate.description || '');
            setSingleEditError('');
          }}
          onRemoveCandidateTaskAssignment={(studentEmail: string) => {
            if (window.confirm(`Are you sure you want to remove assignment for ${studentEmail}?`)) {
              const cleanTarget = (studentEmail || '').trim().toLowerCase();
              const projId = activeProjectDetail.id;

              const updatedAssigned = (activeProjectDetail.assignedApplicants || []).filter(
                (a: any) => (a.studentEmail || a.email || '').trim().toLowerCase() !== cleanTarget
              );

              const updatedProj = {
                ...activeProjectDetail,
                assignedApplicants: updatedAssigned,
              };

              setActiveProjectDetail(updatedProj);
              setProjects((prev) =>
                prev.map((proj) => (proj.id === projId ? updatedProj : proj))
              );

              alert(`Removed candidate assignment for ${studentEmail}`);
            }
          }}
          onAssignTasksClick={() => {
            const hasAccepted = facultyApplications.some((app: any) =>
              isApplicantAssignableToProject(app, activeProjectDetail)
            );

            if (!hasAccepted) {
              alert('Role and task assignments are locked until a student explicitly accepts the internship.');
              return;
            }

            setShowAssignTaskModal(true);
          }}
        />

        {/* MODALS AVAILABLE ON DETAIL VIEW */}
        <SingleEditCandidateRoleModal
          candidate={editingIndividualCandidate}
          onClose={() => setEditingIndividualCandidate(null)}
          singleRoleInput={singleRoleInput}
          setSingleRoleInput={setSingleRoleInput}
          singleDescInput={singleDescInput}
          setSingleDescInput={setSingleDescInput}
          singleEditError={singleEditError}
          onSave={(e) => {
            e.preventDefault();
            if (!singleRoleInput) return setSingleEditError('Role title is required');
            handleSaveSingleCandidateRole(editingIndividualCandidate, singleRoleInput, singleDescInput);
          }}
        />

        <ReviewModal
          show={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          reviewForm={reviewForm}
          setReviewForm={setReviewForm}
          onSave={() => {
            if (viewingStudentProfile) {
              const email = viewingStudentProfile.email || viewingStudentProfile.studentEmail;
              handleSaveReview(email);
            }
          }}
        />

        <FeedbackModal
          show={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          feedbackForm={feedbackForm}
          setFeedbackForm={setFeedbackForm}
          onSave={() => {
            if (viewingStudentProfile) {
              const email = viewingStudentProfile.email || viewingStudentProfile.studentEmail;
              handleSaveFeedback(email);
            }
          }}
        />

        <AssignTaskAnytimeModal
          show={showAssignTaskAnytimeModal}
          onClose={() => setShowAssignTaskAnytimeModal(false)}
          form={anytimeTaskForm}
          setForm={setAnytimeTaskForm}
          onSubmit={handleAssignTaskAnytime}
        />
      </>
    );
  }

  // 4. DEFAULT PAGE VIEW: Grid List of Projects
  return (
    <>
      <ProjectListPage
        projects={projects}
        onSelectProject={(proj) => setActiveProjectDetail(proj)}
        onCreateProjectClick={() => setShowCreateModal(true)}
        onEditProjectClick={(proj) => {
          setEditingProject(proj);
          setShowEditModal(true);
        }}
        onDeleteProjectClick={(proj) => {
          setProjectToDelete(proj);
          setShowDeletePasswordModal(true);
        }}
      />

      <CreateProjectModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        projectForm={projectForm}
        setProjectForm={setProjectForm}
        handleInternshipSelect={() => {}}
        handleCreateProject={handleCreateProject}
        internships={internships}
      />

      <EditProjectModal
        show={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingProject(null);
        }}
        project={editingProject}
        onSaveProject={handleUpdateProject}
        internships={internships}
      />

      <AssignTaskAnytimeModal
        show={showAssignTaskAnytimeModal}
        onClose={() => setShowAssignTaskAnytimeModal(false)}
        form={anytimeTaskForm}
        setForm={setAnytimeTaskForm}
        onSubmit={handleAssignTaskAnytime}
      />

      <DeletePasswordModal
        show={showDeletePasswordModal}
        projectToDelete={projectToDelete}
        onClose={() => setShowDeletePasswordModal(false)}
        deletePasswordInput={deletePasswordInput}
        setDeletePasswordInput={setDeletePasswordInput}
        confirmDeleteWithPassword={(e) => {
          e.preventDefault();
          if (projectToDelete) {
            handleDeleteProject(projectToDelete.id);
          }
        }}
      />
    </>
  );
};
