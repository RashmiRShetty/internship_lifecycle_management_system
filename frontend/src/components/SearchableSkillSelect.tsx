import React, { useState, useEffect } from 'react';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Search } from 'lucide-react';
import { publicApi } from '../services/api';

const AutocompleteAny: any = Autocomplete;

export interface SkillOption {
  id?: number;
  skillName: string;
  category?: string;
  isCustom?: boolean;
  inputValue?: string;
}

interface SearchableSkillSelectProps {
  label: string;
  placeholder?: string;
  value: string | string[];
  onChange: (newValue: string) => void;
  category?: string;
  disabled?: boolean;
  required?: boolean;
}

const USER_SERVICE_SKILLS_URL = 'http://localhost:8080/users/skills';
const filter = createFilterOptions<SkillOption>();

const DEFAULT_SKILLS: SkillOption[] = [
  // --- COMPUTER SCIENCE & IT (CSE / ISE / ECE) ---
  { skillName: 'Java', category: 'CS - Programming Languages' },
  { skillName: 'Python', category: 'CS - Programming Languages' },
  { skillName: 'JavaScript', category: 'CS - Programming Languages' },
  { skillName: 'TypeScript', category: 'CS - Programming Languages' },
  { skillName: 'C++', category: 'CS - Programming Languages' },
  { skillName: 'C#', category: 'CS - Programming Languages' },
  { skillName: 'C', category: 'CS - Programming Languages' },
  { skillName: 'Go', category: 'CS - Programming Languages' },
  { skillName: 'Rust', category: 'CS - Programming Languages' },
  { skillName: 'Kotlin', category: 'CS - Programming Languages' },
  { skillName: 'Swift', category: 'CS - Programming Languages' },
  { skillName: 'R Programming', category: 'CS - Data Science' },
  { skillName: 'MATLAB (CS/Math)', category: 'CS - Computing' },
  { skillName: 'Shell Scripting / Bash', category: 'CS - Scripting & OS' },
  { skillName: 'HTML / CSS', category: 'CS - Web Frontend' },
  { skillName: 'React.js', category: 'CS - Web Frontend' },
  { skillName: 'Next.js', category: 'CS - Web Frontend' },
  { skillName: 'Vue.js', category: 'CS - Web Frontend' },
  { skillName: 'Angular', category: 'CS - Web Frontend' },
  { skillName: 'Tailwind CSS', category: 'CS - Web Frontend' },
  { skillName: 'Bootstrap', category: 'CS - Web Frontend' },
  { skillName: 'Node.js', category: 'CS - Web Backend' },
  { skillName: 'Express.js', category: 'CS - Web Backend' },
  { skillName: 'Spring Boot', category: 'CS - Web Backend' },
  { skillName: 'Django', category: 'CS - Web Backend' },
  { skillName: 'Flask', category: 'CS - Web Backend' },
  { skillName: 'FastAPI', category: 'CS - Web Backend' },
  { skillName: 'ASP.NET Core', category: 'CS - Web Backend' },
  { skillName: 'Ruby on Rails', category: 'CS - Web Backend' },
  { skillName: 'REST APIs', category: 'CS - Web Backend' },
  { skillName: 'GraphQL', category: 'CS - Web Backend' },
  { skillName: 'Microservices Architecture', category: 'CS - Architecture' },
  { skillName: 'gRPC', category: 'CS - Backend' },
  { skillName: 'SQL', category: 'CS - Databases' },
  { skillName: 'PostgreSQL', category: 'CS - Databases' },
  { skillName: 'MySQL', category: 'CS - Databases' },
  { skillName: 'MariaDB', category: 'CS - Databases' },
  { skillName: 'MongoDB', category: 'CS - Databases' },
  { skillName: 'Redis', category: 'CS - Databases' },
  { skillName: 'Cassandra', category: 'CS - Databases' },
  { skillName: 'Elasticsearch', category: 'CS - Databases' },
  { skillName: 'Firebase', category: 'CS - Cloud & DB' },
  { skillName: 'AWS (Amazon Web Services)', category: 'CS - Cloud & DevOps' },
  { skillName: 'Microsoft Azure', category: 'CS - Cloud & DevOps' },
  { skillName: 'Google Cloud Platform (GCP)', category: 'CS - Cloud & DevOps' },
  { skillName: 'Docker', category: 'CS - DevOps & Containers' },
  { skillName: 'Kubernetes', category: 'CS - DevOps & Containers' },
  { skillName: 'Git / GitHub', category: 'CS - Version Control' },
  { skillName: 'GitLab / Bitbucket', category: 'CS - Version Control' },
  { skillName: 'CI / CD Pipelines', category: 'CS - DevOps' },
  { skillName: 'Terraform', category: 'CS - DevOps' },
  { skillName: 'Ansible', category: 'CS - DevOps' },
  { skillName: 'Linux System Administration', category: 'CS - OS & DevOps' },
  { skillName: 'Machine Learning', category: 'CS - AI & ML' },
  { skillName: 'Deep Learning', category: 'CS - AI & ML' },
  { skillName: 'Artificial Intelligence', category: 'CS - AI & ML' },
  { skillName: 'Data Science', category: 'CS - AI & ML' },
  { skillName: 'Data Analytics', category: 'CS - Data Analytics' },
  { skillName: 'TensorFlow', category: 'CS - AI Frameworks' },
  { skillName: 'PyTorch', category: 'CS - AI Frameworks' },
  { skillName: 'Pandas & NumPy', category: 'CS - Data Science Libraries' },
  { skillName: 'Scikit-Learn', category: 'CS - Data Science Libraries' },
  { skillName: 'Natural Language Processing (NLP)', category: 'CS - AI & ML' },
  { skillName: 'Computer Vision / OpenCV', category: 'CS - AI & ML' },
  { skillName: 'Large Language Models (LLMs)', category: 'CS - AI & ML' },
  { skillName: 'Power BI', category: 'CS - Data Analytics' },
  { skillName: 'Tableau', category: 'CS - Data Analytics' },
  { skillName: 'Cyber Security', category: 'CS - Security' },
  { skillName: 'Ethical Hacking', category: 'CS - Security' },
  { skillName: 'Network Security', category: 'CS - Security' },
  { skillName: 'Penetration Testing', category: 'CS - Security' },
  { skillName: 'Cryptography', category: 'CS - Security' },
  { skillName: 'Android Development', category: 'CS - Mobile Development' },
  { skillName: 'iOS Development', category: 'CS - Mobile Development' },
  { skillName: 'Flutter', category: 'CS - Mobile Development' },
  { skillName: 'React Native', category: 'CS - Mobile Development' },
  { skillName: 'Data Structures & Algorithms', category: 'CS - Fundamentals' },
  { skillName: 'Object-Oriented Programming (OOP)', category: 'CS - Fundamentals' },
  { skillName: 'System Design', category: 'CS - Architecture' },
  { skillName: 'Unit Testing / Jest / JUnit', category: 'CS - Testing' },
  { skillName: 'Selenium / Automated Testing', category: 'CS - Testing' },
  { skillName: 'Figma / UI Design', category: 'CS - Design' },
  { skillName: 'UI / UX Design', category: 'CS - Design' },
  { skillName: 'Agile & Scrum', category: 'CS - Methodologies' },

  // --- MECHANICAL ENGINEERING (ME) ---
  { skillName: 'AutoCAD (Mechanical)', category: 'ME - CAD & Drafting' },
  { skillName: 'SolidWorks', category: 'ME - CAD & Modeling' },
  { skillName: 'CATIA', category: 'ME - CAD & Modeling' },
  { skillName: 'PTC Creo / Pro-ENGINEER', category: 'ME - CAD & Modeling' },
  { skillName: 'Autodesk Inventor', category: 'ME - CAD & Modeling' },
  { skillName: 'Fusion 360', category: 'ME - CAD & Modeling' },
  { skillName: 'Siemens NX / NX CAD', category: 'ME - CAD & Modeling' },
  { skillName: 'ANSYS Mechanical', category: 'ME - FEA & CAE' },
  { skillName: 'ANSYS Fluent', category: 'ME - CFD & Thermal' },
  { skillName: 'Finite Element Analysis (FEA)', category: 'ME - Simulation' },
  { skillName: 'Computational Fluid Dynamics (CFD)', category: 'ME - Simulation' },
  { skillName: 'HyperMesh', category: 'ME - FEA Pre-Processing' },
  { skillName: 'COMSOL Multiphysics', category: 'ME - Simulation' },
  { skillName: 'Abaqus', category: 'ME - FEA Simulation' },
  { skillName: 'GD&T (Geometric Dimensioning & Tolerancing)', category: 'ME - Design & Quality' },
  { skillName: 'Thermodynamics', category: 'ME - Thermal Engineering' },
  { skillName: 'Heat Transfer', category: 'ME - Thermal Engineering' },
  { skillName: 'Fluid Mechanics', category: 'ME - Fluid Systems' },
  { skillName: 'HVAC Design', category: 'ME - Thermal & Building' },
  { skillName: 'Power Plant Engineering', category: 'ME - Energy Systems' },
  { skillName: 'Refrigeration & Air Conditioning (RAC)', category: 'ME - Thermal Engineering' },
  { skillName: 'CNC Programming (G-Code & M-Code)', category: 'ME - Manufacturing' },
  { skillName: 'CAM (Computer-Aided Manufacturing)', category: 'ME - Manufacturing' },
  { skillName: 'Machining & Tooling Design', category: 'ME - Manufacturing' },
  { skillName: 'Welding Technology & NDT', category: 'ME - Manufacturing' },
  { skillName: 'Casting & Forging Processes', category: 'ME - Manufacturing' },
  { skillName: 'Plastic Injection Molding Design', category: 'ME - Manufacturing' },
  { skillName: '3D Printing / Additive Manufacturing', category: 'ME - Manufacturing' },
  { skillName: 'Rapid Prototyping', category: 'ME - Product Design' },
  { skillName: 'Robotics & Automation', category: 'ME - Mechatronics' },
  { skillName: 'Mechatronics Systems', category: 'ME - Mechatronics' },
  { skillName: 'PLC Programming (Siemens/Allen-Bradley)', category: 'ME - Automation' },
  { skillName: 'SCADA Systems', category: 'ME - Industrial Automation' },
  { skillName: 'Pneumatics & Hydraulics', category: 'ME - Fluid Power' },
  { skillName: 'Industrial Automation', category: 'ME - Automation' },
  { skillName: 'Microcontrollers (Arduino / Raspberry Pi)', category: 'ME - Embedded Controls' },
  { skillName: 'Automotive Engineering', category: 'ME - Automotive' },
  { skillName: 'Internal Combustion Engines (IC Engines)', category: 'ME - Automotive' },
  { skillName: 'Electric Vehicle (EV) Technology', category: 'ME - Automotive' },
  { skillName: 'Battery Management Systems (BMS)', category: 'ME - Automotive / EV' },
  { skillName: 'Kinematics & Dynamics of Machines', category: 'ME - Mechanical Design' },
  { skillName: 'Aerodynamics', category: 'ME - Fluid Systems' },
  { skillName: 'Materials Science & Metallurgy', category: 'ME - Materials' },
  { skillName: 'Quality Control (QA/QC)', category: 'ME - Quality' },
  { skillName: 'Six Sigma & Lean Manufacturing', category: 'ME - Manufacturing Management' },
  { skillName: 'Total Quality Management (TQM)', category: 'ME - Quality' },
  { skillName: 'Non-Destructive Testing (NDT)', category: 'ME - Testing' },

  // --- CIVIL ENGINEERING (CE) ---
  { skillName: 'AutoCAD (Civil)', category: 'CE - Drafting & Design' },
  { skillName: 'AutoCAD Civil 3D', category: 'CE - Infrastructure Design' },
  { skillName: 'STAAD.Pro', category: 'CE - Structural Analysis' },
  { skillName: 'ETABS', category: 'CE - Structural Design' },
  { skillName: 'Autodesk Revit Structure', category: 'CE - BIM & Modeling' },
  { skillName: 'SAP2000', category: 'CE - Structural Engineering' },
  { skillName: 'Tekla Structures', category: 'CE - Steel & Concrete Detailing' },
  { skillName: 'MIDAS Civil', category: 'CE - Bridge & Structural Design' },
  { skillName: 'GEO5', category: 'CE - Geotechnical Analysis' },
  { skillName: 'BIM (Building Information Modeling)', category: 'CE - BIM Management' },
  { skillName: 'Autodesk Navisworks', category: 'CE - BIM Coordination' },
  { skillName: 'SketchUp', category: 'CE - 3D Architectural Modeling' },
  { skillName: 'ArchiCAD', category: 'CE - Architectural BIM' },
  { skillName: 'Structural Analysis & Design', category: 'CE - Structural Engineering' },
  { skillName: 'Reinforced Concrete Design (RCC)', category: 'CE - Structural Engineering' },
  { skillName: 'Steel Structure Design', category: 'CE - Structural Engineering' },
  { skillName: 'Earthquake Resistant Design', category: 'CE - Structural Engineering' },
  { skillName: 'Concrete Technology & Mix Design', category: 'CE - Materials' },
  { skillName: 'Pre-stressed Concrete Design', category: 'CE - Structural Engineering' },
  { skillName: 'Geotechnical Engineering', category: 'CE - Soil & Foundation' },
  { skillName: 'Soil Mechanics & Testing', category: 'CE - Geotechnical' },
  { skillName: 'Foundation Engineering Design', category: 'CE - Structural & Geo' },
  { skillName: 'Total Station Surveying', category: 'CE - Surveying' },
  { skillName: 'Land Surveying & Mapping', category: 'CE - Surveying' },
  { skillName: 'GIS (Geographic Information System)', category: 'CE - Mapping & Spatial' },
  { skillName: 'ArcGIS / QGIS', category: 'CE - GIS Software' },
  { skillName: 'Remote Sensing & Drone Surveying', category: 'CE - Geomatics' },
  { skillName: 'GPS / GNSS Surveying', category: 'CE - Surveying' },
  { skillName: 'Construction Project Management', category: 'CE - Management' },
  { skillName: 'Primavera P6', category: 'CE - Project Scheduling' },
  { skillName: 'MS Project (MSP)', category: 'CE - Project Scheduling' },
  { skillName: 'Quantity Surveying & Cost Estimation', category: 'CE - Estimation & Billing' },
  { skillName: 'Bar Bending Schedule (BBS)', category: 'CE - Structural Detailing' },
  { skillName: 'Contract Management & Tendering', category: 'CE - Management' },
  { skillName: 'IS Codes / Building Regulations', category: 'CE - Standards & Codes' },
  { skillName: 'Construction Safety Management (OSHA)', category: 'CE - Site Safety' },
  { skillName: 'Highway & Pavement Engineering', category: 'CE - Transportation' },
  { skillName: 'Traffic Engineering & Planning', category: 'CE - Transportation' },
  { skillName: 'Bentley MXRoad', category: 'CE - Highway Design' },
  { skillName: 'Environmental Engineering', category: 'CE - Environmental' },
  { skillName: 'Hydrology & Water Resources', category: 'CE - Water Engineering' },
  { skillName: 'Waste Water Treatment Design', category: 'CE - Environmental' },
  { skillName: 'Hydraulics & Open Channel Flow', category: 'CE - Fluid Mechanics' },
  { skillName: 'Stormwater Management', category: 'CE - Hydrology' },
  { skillName: 'Environmental Impact Assessment (EIA)', category: 'CE - Environmental' }
];

export const SearchableSkillSelect: React.FC<SearchableSkillSelectProps> = ({
  label,
  placeholder = 'Type to search or add custom skill...',
  value,
  onChange,
  category = 'Custom',
  disabled = false,
  required = false
}) => {
  const [options, setOptions] = useState<SkillOption[]>(DEFAULT_SKILLS);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedSkills, setSelectedSkills] = useState<SkillOption[]>([]);

  // 1. Fetch Master Skills on Mount
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    publicApi.get<SkillOption[]>(USER_SERVICE_SKILLS_URL)
      .then(res => {
        if (isMounted && Array.isArray(res.data) && res.data.length > 0) {
          const merged = [...res.data];
          DEFAULT_SKILLS.forEach(ds => {
            if (!merged.some(m => m.skillName.toLowerCase() === ds.skillName.toLowerCase())) {
              merged.push(ds);
            }
          });
          setOptions(merged);
        }
      })
      .catch(err => {
        console.warn('Could not load master skills library, using fallback local options:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Parse Incoming Value prop into SkillOption objects
  useEffect(() => {
    let skillArray: string[] = [];
    if (Array.isArray(value)) {
      skillArray = value.map(v => String(v).trim()).filter(Boolean);
    } else if (typeof value === 'string' && value.trim()) {
      skillArray = value.split(',').map(s => s.trim()).filter(Boolean);
    }

    const parsedOptions: SkillOption[] = skillArray.map(name => {
      const found = options.find(o => o.skillName.toLowerCase() === name.toLowerCase());
      return found || { skillName: name, category: 'Selected' };
    });

    setSelectedSkills(parsedOptions);
  }, [value, options]);

  // 3. Save Custom Skill to Backend API
  const saveCustomSkillToBackend = async (skillName: string, cat: string): Promise<SkillOption> => {
    try {
      const res = await publicApi.post<SkillOption>(USER_SERVICE_SKILLS_URL, {
        skillName,
        category: cat
      });
      const newOption = res.data;
      setOptions(prev => [...prev, newOption]);
      return newOption;
    } catch (err) {
      console.error('Failed to save custom skill to master database:', err);
      const fallback: SkillOption = { skillName, category: cat, isCustom: true };
      setOptions(prev => [...prev, fallback]);
      return fallback;
    }
  };

  // 4. Handle Selection & Adding Custom Skills
  const handleAutocompleteChange = async (_event: any, newValue: any[]) => {
    const updatedOptions: SkillOption[] = [];

    for (const item of newValue) {
      if (typeof item === 'string') {
        const cleanName = item.trim();
        if (cleanName) {
          const existing = options.find(o => o.skillName.toLowerCase() === cleanName.toLowerCase());
          if (existing) {
            updatedOptions.push(existing);
          } else {
            const savedSkill = await saveCustomSkillToBackend(cleanName, category);
            updatedOptions.push(savedSkill);
          }
        }
      } else if (item && item.inputValue) {
        const cleanName = item.inputValue.trim();
        const savedSkill = await saveCustomSkillToBackend(cleanName, category);
        updatedOptions.push(savedSkill);
      } else if (item && item.skillName) {
        updatedOptions.push(item);
      }
    }

    setSelectedSkills(updatedOptions);
    const commaSeparated = updatedOptions.map(o => o.skillName).join(', ');
    onChange(commaSeparated);
  };

  return (
    <Box sx={{ width: '100%', my: 1.5 }}>
      <Typography variant="caption" sx={{ fontWeight: 800, color: '#cbd5e1', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1, display: 'block' }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </Typography>
      
      <AutocompleteAny
        multiple
        freeSolo
        filterSelectedOptions
        autoHighlight
        disableCloseOnSelect
        disabled={disabled}
        options={options}
        value={selectedSkills}
        slotProps={{
          paper: {
            sx: {
              backgroundColor: 'rgba(8, 22, 58, 0.98)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#ffffff',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.7)',
              '& .MuiAutocomplete-option': {
                color: '#ffffff !important',
                fontSize: '13px',
                '&[aria-selected="true"]': {
                  backgroundColor: 'rgba(59, 130, 246, 0.35) !important',
                  color: '#ffffff !important',
                },
                '&.Mui-focused, &:hover': {
                  backgroundColor: 'rgba(59, 130, 246, 0.25) !important',
                  color: '#ffffff !important',
                },
              },
            },
          },
        }}
        getOptionLabel={(option: any) => {
          if (typeof option === 'string') return option;
          if (option.inputValue) return option.inputValue;
          return option.skillName || '';
        }}
        isOptionEqualToValue={(option: SkillOption, val: any) => {
          const valName = typeof val === 'string' ? val : (val?.skillName || '');
          return (option.skillName || '').toLowerCase() === valName.toLowerCase();
        }}
        filterOptions={(optionsList: SkillOption[], params: any) => {
          const filtered = filter(optionsList, params);
          const { inputValue } = params;

          const isExisting = optionsList.some(
            (option) => inputValue.toLowerCase().trim() === (option.skillName || '').toLowerCase().trim()
          );

          if (inputValue !== '' && !isExisting) {
            filtered.push({
              inputValue: inputValue.trim(),
              skillName: `Add "${inputValue.trim()}"`,
              category: 'New Custom Skill',
              isCustom: true
            });
          }

          return filtered;
        }}
        onChange={handleAutocompleteChange}
        renderTags={(tagValue: any[], getTagProps: any) =>
          tagValue.map((option: SkillOption, index: number) => {
            const { key, ...tagProps } = getTagProps({ index });
            const name = typeof option === 'string' ? option : option.skillName;
            const isCustom = typeof option === 'object' && option.isCustom;
            return (
              <Chip
                key={key}
                label={name}
                {...tagProps}
                size="small"
                sx={{
                  bgcolor: isCustom ? 'rgba(245, 158, 11, 0.25) !important' : 'rgba(56, 189, 248, 0.2) !important',
                  color: isCustom ? '#fbbf24 !important' : '#ffffff !important',
                  fontWeight: 800,
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: isCustom ? 'rgba(251, 191, 36, 0.6)' : 'rgba(56, 189, 248, 0.6)',
                  m: '2px',
                  '&.MuiChip-root': {
                    color: isCustom ? '#fbbf24 !important' : '#ffffff !important',
                    backgroundColor: isCustom ? 'rgba(245, 158, 11, 0.25) !important' : 'rgba(56, 189, 248, 0.2) !important',
                  },
                  '& .MuiChip-label': {
                    color: isCustom ? '#fbbf24 !important' : '#ffffff !important',
                    fontWeight: 800,
                    fontSize: '12px',
                    paddingLeft: '8px',
                    paddingRight: '8px',
                  },
                  '& .MuiChip-deleteIcon': {
                    color: isCustom ? '#fbbf24 !important' : '#38bdf8 !important',
                    fontSize: '16px',
                    '&:hover': { color: '#ffffff !important' }
                  }
                }}
              />
            );
          })
        }
        renderOption={(props: any, option: SkillOption) => {
          const { key, ...optionProps } = props;
          return (
            <li key={key} {...optionProps}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: option.isCustom ? 600 : 400, color: '#ffffff' }}>
                  {option.skillName}
                </Typography>
                {option.category && (
                  <Chip
                    label={option.category}
                    size="small"
                    sx={{ height: 20, fontSize: '0.65rem', ml: 1, backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' }}
                  />
                )}
              </Box>
            </li>
          );
        }}
        renderInput={(params: any) => {
          const { InputProps, ...restParams } = params;
          const { startAdornment, endAdornment, ...restInputProps } = InputProps || {};
          return (
            <TextField
              {...restParams}
              placeholder={selectedSkills.length === 0 ? placeholder : ''}
              variant="outlined"
              size="small"
              InputProps={{
                ...restInputProps,
                startAdornment: (
                  <React.Fragment>
                    <Search style={{ width: 16, height: 16, color: '#38bdf8', marginLeft: 6, marginRight: 6, flexShrink: 0 }} />
                    {startAdornment}
                  </React.Fragment>
                ),
                endAdornment: (
                  <React.Fragment>
                    {loading ? <CircularProgress color="inherit" size={18} /> : null}
                    {endAdornment}
                  </React.Fragment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '14px',
                  backgroundColor: 'rgba(6, 22, 61, 0.95)',
                  color: '#ffffff !important',
                  minHeight: '52px',
                  '& fieldset': {
                    borderColor: 'rgba(56, 189, 248, 0.35)',
                  },
                  '&:hover fieldset': {
                    borderColor: '#38bdf8',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#38bdf8',
                    boxShadow: '0 0 12px rgba(56, 189, 248, 0.35)',
                  },
                  '& .MuiChip-root': {
                    color: '#ffffff !important',
                    backgroundColor: 'rgba(56, 189, 248, 0.2) !important',
                  },
                  '& .MuiChip-label': {
                    color: '#ffffff !important',
                    fontWeight: '800 !important',
                  },
                  '& .MuiChip-deleteIcon': {
                    color: '#38bdf8 !important',
                    '&:hover': {
                      color: '#ffffff !important',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: '#ffffff !important',
                    fontSize: '14px',
                    fontWeight: 600,
                    '&::placeholder': {
                      color: '#94a3b8',
                      opacity: 1,
                    },
                  },
                  '& .MuiSvgIcon-root': {
                    color: '#38bdf8',
                  },
                },
              }}
            />
          );
        }}
      />
    </Box>
  );
};

export default SearchableSkillSelect;
