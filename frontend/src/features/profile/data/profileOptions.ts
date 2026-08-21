export const DENOMINATIONS = [
  "CSI",
  "Catholic",
  "Baptist",
  "Pentecostal",
  "Lutheran",
  "Methodist",
  "Brethren",
  "Seventh-day Adventist",
  "Orthodox",
  "Marthoma",
  "Evangelical",
  "Independent",
  "Other",
  "Rather not say",
] as const;

export const PREFERRED_DENOMINATIONS = [
  "Any",
  ...DENOMINATIONS,
] as const;

export const RELIGION_OPTIONS = [
  "Christianity",
  "Hinduism",
  "Islam",
  "Sikhism",
  "Buddhism",
  "Jainism",
  "Other",
  "Prefer not to say",
] as const;

export const PREFERRED_RELIGION_OPTIONS = [
  "Any",
  ...RELIGION_OPTIONS,
] as const;

export const MOTHER_TONGUE_OPTIONS = [
  "Telugu",
  "Tamil",
  "Kannada",
  "Malayalam",
  "Hindi",
  "English",
  "Marathi",
  "Bengali",
  "Gujarati",
  "Punjabi",
  "Odia",
  "Urdu",
  "Konkani",
  "Tulu",
  "Other",
] as const;

export const COMPLEXION_OPTIONS = [
  "Very Fair",
  "Fair",
  "Wheatish",
  "Wheatish Brown",
  "Brown",
  "Dark",
  "Prefer not to say",
] as const;

export const BODY_TYPE_OPTIONS = [
  "Slim",
  "Average",
  "Athletic",
  "Heavy",
  "Prefer not to say",
] as const;

export const PHYSICAL_STATUS_OPTIONS = [
  "Normal",
  "Physically Challenged",
  "Prefer not to say",
] as const;

export const FAITH_BACKGROUND_OPTIONS = [
  {
    value: "CHRISTIAN_BY_BIRTH",
    label: "Christian by birth",
  },
  {
    value: "CONVERTED_TO_CHRISTIANITY",
    label: "Converted to Christianity",
  },
  {
    value: "CHRISTIAN_FAMILY_BACKGROUND",
    label: "Christian family background",
  },
  {
    value: "PREFER_NOT_TO_SAY",
    label: "Prefer not to say",
  },
] as const;

export const FAITH_COMMITMENT_OPTIONS = [
  {
    value: "ANY",
    label: "Any",
  },
  {
    value: "PRACTICING_CHRISTIAN",
    label: "Practicing Christian",
  },
  {
    value: "REGULAR_CHURCH_ATTENDEE",
    label: "Regular church attendee",
  },
  {
    value: "BAPTIZED_CHRISTIAN",
    label: "Baptized Christian",
  },
  {
    value: "CHURCH_VERIFIED_PREFERRED",
    label: "Church verified preferred",
  },
] as const;

export const DIET_OPTIONS = [
  "Vegetarian",
  "Non-Vegetarian",
  "Eggetarian",
  "Vegan",
  "Occasionally Non-Vegetarian",
  "Other",
  "Prefer not to say",
] as const;

export const SMOKING_OPTIONS = [
  "Never",
  "Occasionally",
  "Regularly",
  "Prefer not to say",
] as const;

export const DRINKING_OPTIONS = [
  "Never",
  "Occasionally",
  "Regularly",
  "Prefer not to say",
] as const;

export const MARITAL_STATUS_OPTIONS = [
  "Never Married",
  "Divorced",
  "Widowed",
  "Awaiting Divorce",
  "Annulled",
] as const;

export const PREFERRED_MARITAL_STATUS_OPTIONS = [
  "Any",
  ...MARITAL_STATUS_OPTIONS,
] as const;

export const FAMILY_TYPE_OPTIONS = [
  "Nuclear Family",
  "Joint Family",
  "Extended Family",
  "Other",
] as const;

export const FAMILY_VALUES_OPTIONS = [
  "Traditional",
  "Moderate",
  "Liberal",
  "Prefer not to say",
] as const;

/*
 * Heights are stored in centimeters in the backend.
 *
 * Labels display both metric and approximate imperial values.
 */
export const HEIGHT_OPTIONS = Array.from(
  {
    length: 91,
  },
  (_, index) => {
    const cm =
      140 + index;

    const totalInches =
      cm / 2.54;

    const feet =
      Math.floor(
        totalInches / 12
      );

    const inches =
      Math.round(
        totalInches -
          feet * 12
      );

    const normalizedFeet =
      inches === 12
        ? feet + 1
        : feet;

    const normalizedInches =
      inches === 12
        ? 0
        : inches;

    return {
      value: String(cm),
      label: `${normalizedFeet}' ${normalizedInches}" (${cm} cm)`,
    };
  }
);

export interface ProfessionGroup {
  label: string;
  professions: string[];
}

export const PROFESSION_GROUPS: ProfessionGroup[] = [
  {
    label: "Information Technology",
    professions: [
      "Software Engineer",
      "Frontend Developer",
      "Backend Developer",
      "Full Stack Developer",
      "Mobile App Developer",
      "UI/UX Designer",
      "QA Engineer",
      "Automation Test Engineer",
      "DevOps Engineer",
      "Cloud Engineer",
      "Cybersecurity Professional",
      "Network Engineer",
      "System Administrator",
      "Database Administrator",
      "Data Analyst",
      "Data Engineer",
      "Data Scientist",
      "AI / Machine Learning Engineer",
      "IT Project Manager",
      "SAP Consultant",
      "Workday Consultant",
      "Technical Support Engineer",
    ],
  },

  {
    label: "Healthcare",
    professions: [
      "Doctor",
      "Dentist",
      "Nurse",
      "Pharmacist",
      "Physiotherapist",
      "Psychologist",
      "Medical Technician",
      "Healthcare Administrator",
      "Other Healthcare Professional",
    ],
  },

  {
    label: "Engineering",
    professions: [
      "Civil Engineer",
      "Mechanical Engineer",
      "Electrical Engineer",
      "Electronics Engineer",
      "Chemical Engineer",
      "Industrial Engineer",
      "Aerospace Engineer",
      "Other Engineer",
    ],
  },

  {
    label: "Business & Management",
    professions: [
      "Business Owner",
      "Entrepreneur",
      "Manager",
      "Project Manager",
      "Product Manager",
      "Operations Manager",
      "HR Professional",
      "Recruiter",
      "Sales Professional",
      "Marketing Professional",
      "Business Analyst",
      "Consultant",
    ],
  },

  {
    label: "Finance & Accounting",
    professions: [
      "Chartered Accountant",
      "Accountant",
      "Auditor",
      "Banker",
      "Financial Analyst",
      "Investment Professional",
      "Insurance Professional",
      "Tax Consultant",
    ],
  },

  {
    label: "Education",
    professions: [
      "Teacher",
      "Lecturer",
      "Professor",
      "Researcher",
      "Education Administrator",
      "Tutor",
    ],
  },

  {
    label: "Government & Public Service",
    professions: [
      "Government Employee",
      "Civil Services",
      "Police",
      "Defence",
      "Public Sector Employee",
    ],
  },

  {
    label: "Legal",
    professions: [
      "Lawyer",
      "Legal Consultant",
      "Judge",
      "Legal Professional",
    ],
  },

  {
    label: "Creative & Media",
    professions: [
      "Designer",
      "Photographer",
      "Videographer",
      "Writer",
      "Journalist",
      "Media Professional",
      "Content Creator",
      "Artist",
      "Musician",
    ],
  },

  {
    label: "Hospitality & Travel",
    professions: [
      "Hotel Professional",
      "Chef",
      "Travel Professional",
      "Airline Professional",
      "Hospitality Professional",
    ],
  },

  {
    label: "Church & Ministry",
    professions: [
      "Pastor",
      "Minister",
      "Missionary",
      "Church Worker",
      "Theology Professional",
      "Christian Ministry Professional",
    ],
  },

  {
    label: "Other",
    professions: [
      "Student",
      "Homemaker",
      "Self Employed",
      "Freelancer",
      "Retired",
      "Not Working",
      "Other",
    ],
  },
];

export const EDUCATION_OPTIONS = [
  "High School",
  "Diploma",
  "ITI",
  "Intermediate / 12th",
  "Bachelor's Degree",
  "B.Tech / B.E.",
  "B.Sc",
  "B.Com",
  "B.A.",
  "BBA",
  "BCA",
  "MBBS",
  "BDS",
  "B.Pharm",
  "Nursing",
  "Master's Degree",
  "M.Tech / M.E.",
  "M.Sc",
  "M.Com",
  "M.A.",
  "MBA",
  "MCA",
  "MD / MS",
  "M.Pharm",
  "PhD / Doctorate",
  "Professional Degree",
  "Other",
] as const;

export const PREFERRED_EDUCATION_OPTIONS = [
  "Any",
  ...EDUCATION_OPTIONS,
] as const;

export const PREFERRED_DIET_OPTIONS = [
  "Any",
  ...DIET_OPTIONS,
] as const;

export const PREFERRED_SMOKING_OPTIONS = [
  "Any",
  ...SMOKING_OPTIONS,
] as const;

export const PREFERRED_DRINKING_OPTIONS = [
  "Any",
  ...DRINKING_OPTIONS,
] as const;