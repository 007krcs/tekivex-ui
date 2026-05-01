// ─────────────────────────────────────────────────────────────────────────────
// Dummy / sample data shipped with the templates so the picker can show
// realistic previews before the user fills the form. Realistic but
// fictional — names are deliberately diverse, contact info is non-routable.
// ─────────────────────────────────────────────────────────────────────────────

import type { ResumeData, BiodataData } from './types';

export const SAMPLE_RESUME: ResumeData = {
  fullName: 'Aria Solis',
  title: 'Senior Frontend Engineer',
  email: 'aria.solis@example.com',
  phone: '+1 (555) 423-9012',
  location: 'San Francisco, CA',
  links: [
    { label: 'linkedin.com/in/ariasolis', url: 'https://linkedin.com/in/ariasolis' },
    { label: 'github.com/ariasolis', url: 'https://github.com/ariasolis' },
    { label: 'aria.dev', url: 'https://aria.dev' },
  ],
  summary:
    'Frontend engineer with 8+ years shipping accessible, performant React apps at scale. Led the design-system rebuild at Northwind that cut Time-to-Interactive by 41% and unblocked four product teams.',
  experience: [
    {
      role: 'Senior Frontend Engineer',
      company: 'Northwind Labs',
      location: 'San Francisco, CA',
      start: 'Mar 2022',
      end: '',
      summary: 'Lead the platform team — design system, performance, accessibility.',
      bullets: [
        'Migrated 120+ components from class to functional + hooks; cut bundle size 28%',
        'Owned WCAG 2.1 AAA conformance audit; closed 240 violations across 7 product surfaces',
        'Mentored 4 junior engineers; ran weekly architecture reviews',
      ],
    },
    {
      role: 'Frontend Engineer',
      company: 'Helio Health',
      location: 'Remote',
      start: 'Jul 2019',
      end: 'Mar 2022',
      bullets: [
        'Built the patient portal (Next.js + GraphQL); 1.2M monthly active users',
        'Rolled out E2E testing with Playwright; brought escaped-defect rate from 14% to 3%',
      ],
    },
    {
      role: 'Junior Engineer',
      company: 'Solstice Studio',
      location: 'San Francisco, CA',
      start: 'Aug 2017',
      end: 'Jul 2019',
      bullets: [
        'Shipped marketing-site templates for 30+ Series-A startups on Gatsby + Tailwind',
      ],
    },
  ],
  education: [
    {
      degree: 'B.S. Computer Science',
      institution: 'University of California, Berkeley',
      start: '2013',
      end: '2017',
      grade: 'GPA 3.84',
      details: 'Concentration in HCI · Dean\'s list 2015 / 2016',
    },
  ],
  skills: ['TypeScript', 'React 19', 'Next.js', 'Vite', 'three.js', 'WebXR', 'GraphQL', 'PostgreSQL'],
  skillGroups: [
    { category: 'Languages', items: ['TypeScript', 'JavaScript', 'Python', 'Go'] },
    { category: 'Frameworks', items: ['React 19', 'Next.js', 'Remix', 'Vite'] },
    { category: '3D / spatial', items: ['three.js', 'WebXR', 'WebGL', 'GLSL'] },
    { category: 'Tooling', items: ['Vitest', 'Playwright', 'Storybook', 'Chromatic'] },
  ],
  projects: [
    {
      name: 'tekivex-3d',
      url: 'https://github.com/tekivex/tekivex-3d',
      summary: 'Open-source WebGL component library — 14 spatial primitives, 1.2k★ on GitHub.',
      tech: ['three.js', 'TypeScript', 'WebXR'],
    },
    {
      name: 'a11y-dashboard',
      summary: 'Internal axe-core dashboard at Northwind — surfaces live a11y violations across all surfaces.',
      tech: ['React', 'axe-core', 'D3'],
    },
  ],
  certifications: [
    { name: 'IAAP Web Accessibility Specialist', issuer: 'IAAP', year: '2023' },
    { name: 'AWS Solutions Architect — Associate', issuer: 'AWS', year: '2022' },
  ],
  languages: [
    { name: 'English', level: 'Native' },
    { name: 'Spanish', level: 'Professional' },
    { name: 'Mandarin', level: 'Conversational' },
  ],
  awards: [
    { title: 'Engineering Excellence Award', issuer: 'Northwind Labs', year: '2024' },
  ],
};

export const SAMPLE_BIODATA: BiodataData = {
  fullName: 'Priya Sharma',
  dateOfBirth: '1996-08-14',
  timeOfBirth: '04:32 AM',
  placeOfBirth: 'Pune, Maharashtra',
  height: "5'5\"",
  weight: '54 kg',
  complexion: 'Wheatish',
  bloodGroup: 'B+',

  religion: 'Hindu',
  caste: 'Brahmin',
  subCaste: 'Deshastha',
  manglik: 'no',
  rashi: 'Vrishabha (Taurus)',
  nakshatra: 'Rohini',
  gotra: 'Vasishtha',
  motherTongue: 'Marathi',

  education: [
    { degree: 'M.Tech in Data Science', institution: 'IIT Bombay',  year: '2020' },
    { degree: 'B.E. in Computer Engineering', institution: 'COEP, Pune', year: '2018' },
  ],
  occupation: 'Senior Data Scientist',
  company: 'Volans Analytics, Mumbai',
  income: '₹ 18 LPA',

  fatherName: 'Mr. Rajesh Sharma',
  fatherOccupation: 'Retired Bank Manager',
  motherName: 'Mrs. Sunita Sharma',
  motherOccupation: 'Homemaker',
  siblings: [
    { relation: 'Elder brother', status: 'Married, software architect at Infosys' },
    { relation: 'Younger sister', status: 'Final-year medical student' },
  ],

  contactPhone: '+91 98230 12345',
  contactEmail: 'priya.sharma@example.com',
  address: 'Flat 802, Bluebell Heights, Baner, Pune — 411045',

  hobbies: ['Classical music', 'Travel photography', 'Trekking', 'Cooking'],
  about:
    'A practising data scientist who values family, traditions, and continuous learning. Looking for a partner who is honest, well-educated, and shares similar values around career and family.',
  expectations:
    'Well-educated (Master\'s preferred), settled professional, family-oriented, vegetarian preferred. Open to relocation within India.',
};
