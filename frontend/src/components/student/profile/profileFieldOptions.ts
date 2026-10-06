export { DEPARTMENTS, DEFAULT_SKILLS, DEFAULT_INTERESTS } from '../../../constants/departmentsAndSkills';

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  credentialUrl?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  link?: string;
}

export const inputCls = "w-full px-3.5 py-2 rounded-xl border border-slate-700/80 text-xs font-semibold text-white bg-slate-900/80 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition placeholder-slate-500";
export const textareaCls = "w-full px-3.5 py-2.5 rounded-xl border border-slate-700/80 text-xs font-medium text-white bg-slate-900/80 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition resize-y min-h-[90px] placeholder-slate-500";
