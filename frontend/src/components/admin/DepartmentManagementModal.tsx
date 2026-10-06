import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { 
  Building2 as BuildingIcon, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  Save,
  Loader2
} from 'lucide-react';
import api from '../../services/api';
import { DEPARTMENTS } from '../../constants/departmentsAndSkills';

interface Department {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  createdBy: string;
  isActive: boolean;
}

interface DepartmentManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DepartmentManagementModal: React.FC<DepartmentManagementModalProps> = ({ isOpen, onClose }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<Department | null>(null);
  const [deletePasswordError, setDeletePasswordError] = useState('');
  const [verifyingDeletePassword, setVerifyingDeletePassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const getLoggedInAdminEmail = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) return '';

    try {
      const decoded: any = jwtDecode(token);
      return (decoded?.sub || decoded?.email || '').trim().toLowerCase();
    } catch (error) {
      return '';
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
    }
  }, [isOpen]);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users/departments');
      const data = Array.isArray(response.data) ? response.data : [];
      const defaultDepartments = DEPARTMENTS.map((name, index) => ({
        id: index + 1,
        name: name,
        description: `Department of ${name}`,
        createdAt: new Date().toISOString(),
        createdBy: 'system',
        isActive: true
      }));

      const nextDepartments = data.length > 0 ? data : defaultDepartments;
      console.log('Departments fetched:', response.data);
      setDepartments(nextDepartments);
    } catch (error: any) {
      console.error('Error fetching departments:', error);
      const defaultDepartments = DEPARTMENTS.map((name, index) => ({
        id: index + 1,
        name: name,
        description: `Department of ${name}`,
        createdAt: new Date().toISOString(),
        createdBy: 'system',
        isActive: true
      }));
      console.log('Using default departments as fallback:', defaultDepartments);
      setDepartments(defaultDepartments);
      
      if (error.response?.status === 404) {
        console.warn('Department service not available. Using default departments as fallback.');
      } else {
        console.warn('Failed to fetch departments. Using default departments as fallback.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple approach for createdBy field
    const departmentData = {
      ...formData,
      createdBy: 'admin@internsmart.com' // Will be updated by backend or can be enhanced later
    };
    
    try {
      console.log('Creating department with data:', departmentData);
      const response = await api.post('/users/departments', departmentData);
      console.log('Department created successfully:', response.data);
      
      setFormData({ name: '', description: '' });
      setShowCreateForm(false);
      
      // Force refresh immediately
      await fetchDepartments();
      
      // Also add the new department directly to the state for immediate feedback
      setDepartments(prevDepts => {
        const exists = prevDepts.some(dept => dept.name === formData.name);
        if (!exists && response.data) {
          console.log('Adding new department to state:', response.data);
          return [...prevDepts, response.data];
        }
        return prevDepts;
      });
      
    } catch (error: any) {
      console.error('Error creating department:', error);
      if (error.response?.status === 404) {
        alert('Department service not available. Please restart the user-service backend to enable department management.');
      } else {
        alert('Failed to create department: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const handleUpdateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDepartment) return;
    
    try {
      await api.put(`/users/departments/${editingDepartment.id}`, formData);
      setEditingDepartment(null);
      setFormData({ name: '', description: '' });
      fetchDepartments();
    } catch (error: any) {
      console.error('Error updating department:', error);
      if (error.response?.status === 404) {
        alert('Department service not available. Please restart the user-service backend.');
      } else {
        alert('Failed to update department: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const handleDeleteDepartment = async (id: number) => {
    try {
      await api.delete(`/users/departments/${id}`);
      fetchDepartments();
    } catch (error: any) {
      console.error('Error deleting department:', error);
      if (error.response?.status === 404) {
        alert('Department service not available. Please restart the user-service backend.');
      } else {
        alert('Failed to delete department: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const confirmDepartmentDelete = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!deleteConfirmTarget) return;

    const adminEmail = getLoggedInAdminEmail();
    const trimmedPassword = deletePassword.trim();

    if (!adminEmail) {
      setDeletePasswordError('Admin session not found. Please log in again.');
      return;
    }

    if (!trimmedPassword) {
      setDeletePasswordError('Admin password is required to delete a department.');
      return;
    }

    setVerifyingDeletePassword(true);
    setDeletePasswordError('');

    try {
      await api.post('/auth/token', {
        email: adminEmail,
        password: trimmedPassword,
      });

      await handleDeleteDepartment(deleteConfirmTarget.id);
      setDeleteConfirmTarget(null);
      setDeletePassword('');
      setDeletePasswordError('');
    } catch (error: any) {
      console.error('Department delete password verification failed:', error);
      setDeletePasswordError(
        error?.response?.data?.error ||
        error?.response?.data ||
        'Incorrect admin password. Please try again.'
      );
    } finally {
      setVerifyingDeletePassword(false);
    }
  };

  const startEdit = (department: Department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      description: department.description
    });
    setShowCreateForm(false);
    setDeleteConfirmTarget(null);
    setDeletePassword('');
    setDeletePasswordError('');
  };

  const cancelEdit = () => {
    setEditingDepartment(null);
    setFormData({ name: '', description: '' });
  };

  const beginDeleteDepartment = (department: Department) => {
    setDeleteConfirmTarget(department);
    setDeletePassword('');
    setDeletePasswordError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-slate-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <BuildingIcon className="w-8 h-8 text-white" />
            <h2 className="text-2xl font-bold text-white">Department Management</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Create/Edit Form */}
          {(showCreateForm || editingDepartment) && (
            <div className="mb-6 bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">
                {editingDepartment ? 'Edit Department' : 'Create New Department'}
              </h3>
              <form onSubmit={editingDepartment ? handleUpdateDepartment : handleCreateDepartment}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Department Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="e.g., Electrical Engineering"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Brief description of the department"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {editingDepartment ? 'Update Department' : 'Create Department'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      cancelEdit();
                    }}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>

                {/* Prominent Delete Button for Editing */}
                {editingDepartment && (
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <button
                      type="button"
                      onClick={() => beginDeleteDepartment(editingDepartment)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors w-full"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Department
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* Add Department Button */}
          {!showCreateForm && !editingDepartment && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="mb-6 flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add New Department
            </button>
          )}

          {/* Departments List */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departments.map((department) => (
                <div
                  key={department.id}
                  className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 hover:border-indigo-500/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-white">{department.name}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(department)}
                        className="text-slate-400 hover:text-indigo-400 transition-colors"
                        title="Edit Department"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => beginDeleteDepartment(department)}
                        className="text-slate-400 hover:text-red-400 transition-colors"
                        title="Delete Department"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {department.description && (
                    <p className="text-slate-400 text-sm mb-2">{department.description}</p>
                  )}
                  <div className="text-xs text-slate-500">
                    Created by {department.createdBy} • {new Date(department.createdAt).toLocaleDateString()}
                  </div>
                  
                  {/* Prominent Delete Button */}
                  <button
                    onClick={() => beginDeleteDepartment(department)}
                    className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-600/30 rounded-lg transition-colors text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Department
                  </button>
                </div>
              ))}
            </div>
          )}

          {departments.length === 0 && !loading && (
            <div className="text-center py-12 text-slate-400">
              <BuildingIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No departments found. Create your first department to get started.</p>
            </div>
          )}
        </div>
      </div>

      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-700 px-5 py-4">
              <div>
                <h3 className="text-lg font-bold text-white">Confirm Department Delete</h3>
                <p className="text-xs text-slate-400 mt-1">This action is restricted to the logged-in admin.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDeleteConfirmTarget(null);
                  setDeletePassword('');
                  setDeletePasswordError('');
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={confirmDepartmentDelete} className="p-5">
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-200 mb-4">
                You are about to delete <span className="font-bold text-white">{deleteConfirmTarget.name}</span>. This action cannot be undone.
              </div>

              <label className="block text-xs font-bold uppercase tracking-[0.12em] text-slate-300 mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Enter your admin password"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-white placeholder:text-slate-500 focus:border-red-500 focus:outline-none"
                autoFocus
              />

              {deletePasswordError && (
                <p className="mt-3 text-sm text-red-300">{deletePasswordError}</p>
              )}

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteConfirmTarget(null);
                    setDeletePassword('');
                    setDeletePasswordError('');
                  }}
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifyingDeletePassword}
                  className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-500 disabled:opacity-60"
                >
                  {verifyingDeletePassword ? 'Verifying...' : 'Delete Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManagementModal;