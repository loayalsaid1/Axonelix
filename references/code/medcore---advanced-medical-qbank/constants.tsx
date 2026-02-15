
import { Subject, Question, Topic } from './types';

export const MOCK_SUBJECTS: Subject[] = [
  {
    id: 'im',
    name: 'Internal Medicine',
    progress: 85,
    totalQuestions: 1420,
    topics: [
      { id: 'im-cv', name: 'Cardiovascular', subtopics: ['HF', 'Valvular', 'ACS'] },
      { id: 'im-gi', name: 'Gastrointestinal', subtopics: ['IBD', 'Liver', 'Peptic'] }
    ]
  },
  {
    id: 'peds',
    name: 'Pediatrics',
    progress: 42,
    totalQuestions: 850,
    topics: [
      { id: 'peds-neo', name: 'Neonatology', subtopics: ['RDS', 'Jaundice'] }
    ]
  },
  {
    id: 'obgyn',
    name: 'OB/GYN',
    progress: 12,
    totalQuestions: 600,
    topics: []
  }
];

export const MOCK_QUESTIONS: Question[] = [
  {
    id: 1,
    stem: "A 64-year-old male presents to the emergency department with a 3-day history of progressive shortness of breath and a productive cough with yellowish sputum. He has a 45 pack-year smoking history and was diagnosed with COPD five years ago. Physical examination reveals a temperature of 38.4°C (101.1°F), pulse 112/min, blood pressure 138/84 mmHg, and respiratory rate 24/min. Auscultation of the chest reveals diffuse wheezing and decreased breath sounds at the bases. Pulse oximetry shows 89% on room air.",
    labData: [
      { parameter: 'Hemoglobin', result: '12.2 g/dL', referenceRange: '13.5–17.5 g/dL', isAbnormal: true },
      { parameter: 'WBC Count', result: '14,200/mm³', referenceRange: '4,500–11,000/mm³', isAbnormal: true },
      { parameter: 'pH (Arterial)', result: '7.32', referenceRange: '7.35–7.45', isAbnormal: true },
      { parameter: 'PaCO₂', result: '52 mmHg', referenceRange: '35–45 mmHg', isAbnormal: true }
    ],
    leadIn: "Which of the following is the most appropriate next step in management for this patient?",
    status: 'current',
    options: [
      { id: 'a', label: 'A', text: 'Initiate non-invasive positive pressure ventilation (NIPPV)' },
      { id: 'b', label: 'B', text: 'Immediate endotracheal intubation' },
      { id: 'c', label: 'C', text: 'Outpatient treatment with oral levofloxacin' },
      { id: 'd', label: 'D', text: 'Start intravenous corticosteroids and broad-spectrum antibiotics' }
    ]
  },
  {
    id: 2,
    stem: "A 28-year-old female G1P0 at 32 weeks gestation presents with sudden onset of severe abdominal pain and vaginal bleeding. Her blood pressure is 160/110 mmHg. On examination, the uterus is firm and tender. The fetal heart rate tracing shows late decelerations.",
    leadIn: "What is the most likely diagnosis?",
    status: 'unseen',
    options: [
      { id: 'a', label: 'A', text: 'Placenta previa' },
      { id: 'b', label: 'B', text: 'Placental abruption' },
      { id: 'c', label: 'C', text: 'Uterine rupture' },
      { id: 'd', label: 'D', text: 'Vasa previa' }
    ]
  }
];

export const LIBRARY_TOPICS: Topic[] = [
  { id: '1', name: 'Cardiology', subtopics: ['Atrial Fibrillation', 'Heart Failure', 'Myocardial Infarction'] },
  { id: '2', name: 'Pulmonology', subtopics: ['Asthma', 'COPD', 'Pneumonia', 'PE'] },
  { id: '3', name: 'Endocrinology', subtopics: ['Diabetes Mellitus', 'Thyroid Storm', 'Addison Disease'] },
  { id: '4', name: 'Neurology', subtopics: ['Stroke', 'Multiple Sclerosis', 'Epilepsy'] },
  { id: '5', name: 'Hematology', subtopics: ['Iron Deficiency', 'Sickle Cell', 'Lymphoma'] }
];
