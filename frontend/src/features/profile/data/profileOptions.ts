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
      "Counsellor",
      "Veterinarian",
      "Lab Technician",
      "Radiologist",
      "Nutritionist",
      "Healthcare Administrator",
      "Medical Representative",
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
      "Automobile Engineer",
      "Aerospace Engineer",
      "Architect",
      "Site Engineer",
      "Project Engineer",
      "Quality Engineer",
    ],
  },
  {
    label: "Education",
    professions: [
      "Teacher",
      "School Teacher",
      "College Lecturer",
      "Professor",
      "Principal",
      "Tutor",
      "Research Scholar",
      "Academic Administrator",
      "Special Education Teacher",
    ],
  },
  {
    label: "Finance and Banking",
    professions: [
      "Accountant",
      "Chartered Accountant",
      "Auditor",
      "Bank Employee",
      "Bank Manager",
      "Financial Analyst",
      "Investment Banker",
      "Tax Consultant",
      "Insurance Professional",
      "Payroll Professional",
    ],
  },
  {
    label: "Government and Public Service",
    professions: [
      "Government Employee",
      "Civil Services",
      "Police Officer",
      "Public Sector Employee",
      "Municipal Employee",
      "Postal Employee",
      "Railway Employee",
      "Government Teacher",
    ],
  },
  {
    label: "Defence",
    professions: [
      "Army",
      "Navy",
      "Air Force",
      "Coast Guard",
      "Defence Civilian",
      "Retired Defence Personnel",
    ],
  },
  {
    label: "Business and Management",
    professions: [
      "Business Owner",
      "Entrepreneur",
      "Self Employed",
      "Director",
      "General Manager",
      "Operations Manager",
      "Product Manager",
      "Project Manager",
      "Human Resources Professional",
      "Recruitment Professional",
      "Sales Manager",
      "Marketing Manager",
      "Business Analyst",
      "Business Development Manager",
    ],
  },
  {
    label: "Legal",
    professions: [
      "Advocate",
      "Lawyer",
      "Judge",
      "Legal Advisor",
      "Legal Consultant",
      "Company Secretary",
    ],
  },
  {
    label: "Media and Creative",
    professions: [
      "Journalist",
      "Content Writer",
      "Graphic Designer",
      "Photographer",
      "Videographer",
      "Film Professional",
      "Musician",
      "Singer",
      "Actor",
      "Digital Marketing Professional",
      "Social Media Manager",
    ],
  },
  {
    label: "Hospitality and Aviation",
    professions: [
      "Hotel Manager",
      "Chef",
      "Hospitality Professional",
      "Travel Consultant",
      "Pilot",
      "Cabin Crew",
      "Airport Staff",
      "Tourism Professional",
    ],
  },
  {
    label: "Agriculture and Skilled Work",
    professions: [
      "Farmer",
      "Agricultural Professional",
      "Electrician",
      "Plumber",
      "Mechanic",
      "Technician",
      "Carpenter",
      "Construction Professional",
      "Driver",
    ],
  },
  {
    label: "Christian Ministry",
    professions: [
      "Pastor",
      "Assistant Pastor",
      "Missionary",
      "Evangelist",
      "Church Administrator",
      "Christian Ministry Worker",
      "Theological Lecturer",
      "Worship Leader",
    ],
  },
  {
    label: "Other",
    professions: [
      "Student",
      "Homemaker",
      "Retired",
      "Not currently working",
      "Other",
      "Rather not say",
    ],
  },
];

export const LOCATION_DATA: Record<
  string,
  Record<string, string[]>
> = {
  "Andhra Pradesh": {
    Guntur: [
      "Guntur",
      "Mangalagiri",
      "Tenali",
      "Ponnur",
      "Tadikonda",
    ],
    "NTR District": [
      "Vijayawada",
      "Jaggayyapeta",
      "Nandigama",
      "Tiruvuru",
    ],
    Krishna: [
      "Machilipatnam",
      "Gudivada",
      "Avanigadda",
      "Pedana",
    ],
    Bapatla: [
      "Bapatla",
      "Chirala",
      "Repalle",
      "Addanki",
    ],
    Palnadu: [
      "Narasaraopet",
      "Piduguralla",
      "Sattenapalle",
      "Macherla",
    ],
    Prakasam: [
      "Ongole",
      "Markapur",
      "Kandukur",
      "Chimakurthy",
    ],
    Nellore: [
      "Nellore",
      "Kavali",
      "Gudur",
      "Atmakur",
    ],
    Tirupati: [
      "Tirupati",
      "Srikalahasti",
      "Gudur",
      "Venkatagiri",
    ],
    Chittoor: [
      "Chittoor",
      "Palamaner",
      "Punganur",
      "Kuppam",
    ],
    Kadapa: [
      "Kadapa",
      "Proddatur",
      "Pulivendula",
      "Rayachoti",
    ],
    Annamayya: [
      "Rayachoti",
      "Madanapalle",
      "Rajampet",
    ],
    Anantapur: [
      "Anantapur",
      "Guntakal",
      "Tadipatri",
      "Kalyandurg",
    ],
    "Sri Sathya Sai": [
      "Puttaparthi",
      "Hindupur",
      "Dharmavaram",
      "Kadiri",
    ],
    Kurnool: [
      "Kurnool",
      "Adoni",
      "Yemmiganur",
      "Pattikonda",
    ],
    Nandyal: [
      "Nandyal",
      "Allagadda",
      "Dhone",
      "Atmakur",
    ],
    Visakhapatnam: [
      "Visakhapatnam",
      "Gajuwaka",
      "Bheemunipatnam",
    ],
    Anakapalli: [
      "Anakapalli",
      "Narsipatnam",
      "Yelamanchili",
    ],
    Vizianagaram: [
      "Vizianagaram",
      "Bobbili",
      "Parvathipuram",
    ],
    Srikakulam: [
      "Srikakulam",
      "Palasa",
      "Amadalavalasa",
      "Tekkali",
    ],
    "East Godavari": [
      "Rajahmundry",
      "Kovvur",
      "Nidadavole",
    ],
    Kakinada: [
      "Kakinada",
      "Peddapuram",
      "Samalkota",
    ],
    Konaseema: [
      "Amalapuram",
      "Mandapeta",
      "Ramachandrapuram",
    ],
    Eluru: [
      "Eluru",
      "Jangareddygudem",
      "Nuzvid",
    ],
    "West Godavari": [
      "Bhimavaram",
      "Tadepalligudem",
      "Tanuku",
      "Narasapuram",
    ],
  },

  Telangana: {
    Hyderabad: [
      "Hyderabad",
      "Secunderabad",
    ],
    Medchal: [
      "Kukatpally",
      "Malkajgiri",
      "Medchal",
      "Quthbullapur",
    ],
    Rangareddy: [
      "Shamshabad",
      "Rajendranagar",
      "Ibrahimpatnam",
      "Chevella",
    ],
    Sangareddy: [
      "Sangareddy",
      "Patancheru",
      "Zaheerabad",
    ],
    Warangal: [
      "Warangal",
      "Hanamkonda",
      "Kazipet",
    ],
    Karimnagar: [
      "Karimnagar",
      "Huzurabad",
      "Jammikunta",
    ],
    Khammam: [
      "Khammam",
      "Madhira",
      "Sathupalli",
    ],
    Nalgonda: [
      "Nalgonda",
      "Miryalaguda",
      "Devarakonda",
    ],
    Nizamabad: [
      "Nizamabad",
      "Bodhan",
      "Armoor",
    ],
    Adilabad: [
      "Adilabad",
      "Utnoor",
      "Boath",
    ],
    Mahabubnagar: [
      "Mahabubnagar",
      "Jadcherla",
      "Narayanpet",
    ],
    Siddipet: [
      "Siddipet",
      "Gajwel",
      "Husnabad",
    ],
    Suryapet: [
      "Suryapet",
      "Kodad",
      "Huzurnagar",
    ],
  },

  "Other State": {
    "Other District": [
      "Other City",
    ],
  },
};

export const STATES =
  Object.keys(LOCATION_DATA);

export function getDistricts(
  state: string
): string[] {
  if (!state || !LOCATION_DATA[state]) {
    return [];
  }

  return Object.keys(
    LOCATION_DATA[state]
  );
}

export function getCities(
  state: string,
  district: string
): string[] {
  return (
    LOCATION_DATA[state]?.[district] ??
    []
  );
}

export interface ParsedLocation {
  city: string;
  district: string;
  state: string;
}

export function parseLocation(
  location: string
): ParsedLocation {
  const values = location
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (values.length >= 3) {
    return {
      city: values[0],
      district: values[1],
      state: values.slice(2).join(", "),
    };
  }

  if (values.length === 2) {
    return {
      city: values[0],
      district: "",
      state: values[1],
    };
  }

  return {
    city: values[0] ?? "",
    district: "",
    state: "",
  };
}

export function formatLocation(
  city: string,
  district: string,
  state: string
): string {
  return [
    city,
    district,
    state,
  ]
    .filter(Boolean)
    .join(", ");
}
/*
 * Shared education options.
 *
 * Use this list in:
 * - Education & Career
 * - Partner Preferences
 * - Browse / Search
 *
 * This prevents the different areas of the application
 * from drifting apart.
 */
export const EDUCATION_OPTIONS = [
  "No Formal Education",
  "SSC",
  "Intermediate",
  "ITI",
  "Diploma",
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
  "B.Ed",
  "LLB",
  "Master's Degree",
  "M.Tech / M.E.",
  "M.Sc",
  "M.Com",
  "M.A.",
  "MBA",
  "MCA",
  "MD / MS",
  "MDS",
  "M.Pharm",
  "M.Ed",
  "LLM",
  "Doctorate",
  "Professional Qualification",
  "Other",
  "Rather not say",
] as const;

export const PREFERRED_EDUCATION_OPTIONS = [
  "Any",
  ...EDUCATION_OPTIONS,
] as const;
