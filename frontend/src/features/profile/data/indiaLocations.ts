import {
  City,
  State,
} from "country-state-city";

export interface LocationOption {
  value: string;
  label: string;
}

export interface IndiaStateOption
  extends LocationOption {
  isoCode: string;
}

export const INDIA_COUNTRY_NAME =
  "India";

const INDIA_CODE = "IN";

/*
 * =========================================================
 * States / Union Territories
 * =========================================================
 */

export const INDIA_STATES: IndiaStateOption[] = [
  // =========================================================
  // 28 States
  // =========================================================

  {
    value: "Andhra Pradesh",
    label: "Andhra Pradesh",
    isoCode: "AP",
  },
  {
    value: "Arunachal Pradesh",
    label: "Arunachal Pradesh",
    isoCode: "AR",
  },
  {
    value: "Assam",
    label: "Assam",
    isoCode: "AS",
  },
  {
    value: "Bihar",
    label: "Bihar",
    isoCode: "BR",
  },
  {
    value: "Chhattisgarh",
    label: "Chhattisgarh",
    isoCode: "CG",
  },
  {
    value: "Goa",
    label: "Goa",
    isoCode: "GA",
  },
  {
    value: "Gujarat",
    label: "Gujarat",
    isoCode: "GJ",
  },
  {
    value: "Haryana",
    label: "Haryana",
    isoCode: "HR",
  },
  {
    value: "Himachal Pradesh",
    label: "Himachal Pradesh",
    isoCode: "HP",
  },
  {
    value: "Jharkhand",
    label: "Jharkhand",
    isoCode: "JH",
  },
  {
    value: "Karnataka",
    label: "Karnataka",
    isoCode: "KA",
  },
  {
    value: "Kerala",
    label: "Kerala",
    isoCode: "KL",
  },
  {
    value: "Madhya Pradesh",
    label: "Madhya Pradesh",
    isoCode: "MP",
  },
  {
    value: "Maharashtra",
    label: "Maharashtra",
    isoCode: "MH",
  },
  {
    value: "Manipur",
    label: "Manipur",
    isoCode: "MN",
  },
  {
    value: "Meghalaya",
    label: "Meghalaya",
    isoCode: "ML",
  },
  {
    value: "Mizoram",
    label: "Mizoram",
    isoCode: "MZ",
  },
  {
    value: "Nagaland",
    label: "Nagaland",
    isoCode: "NL",
  },
  {
    value: "Odisha",
    label: "Odisha",
    isoCode: "OD",
  },
  {
    value: "Punjab",
    label: "Punjab",
    isoCode: "PB",
  },
  {
    value: "Rajasthan",
    label: "Rajasthan",
    isoCode: "RJ",
  },
  {
    value: "Sikkim",
    label: "Sikkim",
    isoCode: "SK",
  },
  {
    value: "Tamil Nadu",
    label: "Tamil Nadu",
    isoCode: "TN",
  },
  {
    value: "Telangana",
    label: "Telangana",
    isoCode: "TS",
  },
  {
    value: "Tripura",
    label: "Tripura",
    isoCode: "TR",
  },
  {
    value: "Uttar Pradesh",
    label: "Uttar Pradesh",
    isoCode: "UP",
  },
  {
    value: "Uttarakhand",
    label: "Uttarakhand",
    isoCode: "UK",
  },
  {
    value: "West Bengal",
    label: "West Bengal",
    isoCode: "WB",
  },

  // =========================================================
  // 8 Union Territories
  // =========================================================

  {
    value: "Andaman and Nicobar Islands",
    label: "Andaman and Nicobar Islands",
    isoCode: "AN",
  },
  {
    value: "Chandigarh",
    label: "Chandigarh",
    isoCode: "CH",
  },
  {
    value: "Dadra and Nagar Haveli and Daman and Diu",
    label: "Dadra and Nagar Haveli and Daman and Diu",
    isoCode: "DH",
  },
  {
    value: "Delhi",
    label: "Delhi",
    isoCode: "DL",
  },
  {
    value: "Jammu and Kashmir",
    label: "Jammu and Kashmir",
    isoCode: "JK",
  },
  {
    value: "Ladakh",
    label: "Ladakh",
    isoCode: "LA",
  },
  {
    value: "Lakshadweep",
    label: "Lakshadweep",
    isoCode: "LD",
  },
  {
    value: "Puducherry",
    label: "Puducherry",
    isoCode: "PY",
  },
].sort(
  (first, second) =>
    first.label.localeCompare(
      second.label
    )
);

export function getStateIsoCode(
  stateName: string
): string {
  if (!stateName.trim()) {
    return "";
  }

  return (
    INDIA_STATES.find(
      (state) =>
        state.value
          .trim()
          .toLowerCase() ===
        stateName
          .trim()
          .toLowerCase()
    )?.isoCode ?? ""
  );
}

/*
 * =========================================================
 * Cities
 * =========================================================
 */

export function getCitiesForState(
  stateName: string
): LocationOption[] {
  const stateCode =
    getStateIsoCode(
      stateName
    );

  if (!stateCode) {
    return [];
  }

  const cityNames =
    new Set(
      City.getCitiesOfState(
        INDIA_CODE,
        stateCode
      )
        .map((city) =>
          city.name.trim()
        )
        .filter(Boolean)
    );

  return Array.from(
    cityNames
  )
    .sort((first, second) =>
      first.localeCompare(
        second
      )
    )
    .map((city) => ({
      value: city,
      label: city,
    }));
}

/*
 * =========================================================
 * Districts
 * =========================================================
 *
 * Browser-safe static data.
 *
 * District boundaries and names can change through
 * government notifications, so this data should be reviewed
 * periodically.
 */

export const INDIA_DISTRICTS: Record<
  string,
  string[]
> = {
  "Andaman and Nicobar Islands": [
    "Nicobars",
    "North and Middle Andaman",
    "South Andaman",
  ],

  "Andhra Pradesh": [
    "Alluri Sitharama Raju",
    "Anakapalli",
    "Ananthapuramu",
    "Annamayya",
    "Bapatla",
    "Chittoor",
    "Dr. B. R. Ambedkar Konaseema",
    "East Godavari",
    "Eluru",
    "Guntur",
    "Kakinada",
    "Krishna",
    "Kurnool",
    "Markapuram",
    "Nandyal",
    "NTR",
    "Palnadu",
    "Parvathipuram Manyam",
    "Polavaram",
    "Prakasam",
    "Sri Potti Sriramulu Nellore",
    "Sri Sathya Sai",
    "Srikakulam",
    "Tirupati",
    "Visakhapatnam",
    "Vizianagaram",
    "West Godavari",
    "YSR Kadapa",
  ],

  "Arunachal Pradesh": [
    "Anjaw",
    "Bichom",
    "Changlang",
    "Dibang Valley",
    "East Kameng",
    "East Siang",
    "Kamle",
    "Keyi Panyor",
    "Kra Daadi",
    "Kurung Kumey",
    "Leparada",
    "Lohit",
    "Longding",
    "Lower Dibang Valley",
    "Lower Siang",
    "Lower Subansiri",
    "Namsai",
    "Pakke Kessang",
    "Papum Pare",
    "Shi Yomi",
    "Siang",
    "Tawang",
    "Tirap",
    "Upper Siang",
    "Upper Subansiri",
    "West Kameng",
    "West Siang",
  ],

  Assam: [
    "Bajali",
    "Baksa",
    "Barpeta",
    "Biswanath",
    "Bongaigaon",
    "Cachar",
    "Charaideo",
    "Chirang",
    "Darrang",
    "Dhemaji",
    "Dhubri",
    "Dibrugarh",
    "Dima Hasao",
    "Goalpara",
    "Golaghat",
    "Hailakandi",
    "Hojai",
    "Jorhat",
    "Kamrup",
    "Kamrup Metropolitan",
    "Karbi Anglong",
    "Karimganj",
    "Kokrajhar",
    "Lakhimpur",
    "Majuli",
    "Morigaon",
    "Nagaon",
    "Nalbari",
    "Sivasagar",
    "Sonitpur",
    "South Salmara-Mankachar",
    "Tamulpur",
    "Tinsukia",
    "Udalguri",
    "West Karbi Anglong",
  ],

  Bihar: [
    "Araria",
    "Arwal",
    "Aurangabad",
    "Banka",
    "Begusarai",
    "Bhagalpur",
    "Bhojpur",
    "Buxar",
    "Darbhanga",
    "East Champaran",
    "Gaya",
    "Gopalganj",
    "Jamui",
    "Jehanabad",
    "Kaimur",
    "Katihar",
    "Khagaria",
    "Kishanganj",
    "Lakhisarai",
    "Madhepura",
    "Madhubani",
    "Munger",
    "Muzaffarpur",
    "Nalanda",
    "Nawada",
    "Patna",
    "Purnia",
    "Rohtas",
    "Saharsa",
    "Samastipur",
    "Saran",
    "Sheikhpura",
    "Sheohar",
    "Sitamarhi",
    "Siwan",
    "Supaul",
    "Vaishali",
    "West Champaran",
  ],

  Chandigarh: [
    "Chandigarh",
  ],

  Chhattisgarh: [
    "Balod",
    "Baloda Bazar-Bhatapara",
    "Balrampur-Ramanujganj",
    "Bastar",
    "Bemetara",
    "Bijapur",
    "Bilaspur",
    "Dantewada",
    "Dhamtari",
    "Durg",
    "Gariaband",
    "Gaurela-Pendra-Marwahi",
    "Janjgir-Champa",
    "Jashpur",
    "Kabirdham",
    "Kanker",
    "Khairagarh-Chhuikhadan-Gandai",
    "Kondagaon",
    "Korba",
    "Korea",
    "Mahasamund",
    "Manendragarh-Chirmiri-Bharatpur",
    "Mohla-Manpur-Ambagarh Chowki",
    "Mungeli",
    "Narayanpur",
    "Raigarh",
    "Raipur",
    "Rajnandgaon",
    "Sakti",
    "Sarangarh-Bilaigarh",
    "Sukma",
    "Surajpur",
    "Surguja",
  ],

  "Dadra and Nagar Haveli and Daman and Diu": [
    "Dadra and Nagar Haveli",
    "Daman",
    "Diu",
  ],

  Delhi: [
    "Central Delhi",
    "East Delhi",
    "New Delhi",
    "North Delhi",
    "North East Delhi",
    "North West Delhi",
    "Shahdara",
    "South Delhi",
    "South East Delhi",
    "South West Delhi",
    "West Delhi",
  ],

  Goa: [
    "Kushavati",
    "North Goa",
    "South Goa",
  ],

  Gujarat: [
    "Ahmedabad",
    "Amreli",
    "Anand",
    "Aravalli",
    "Banaskantha",
    "Bharuch",
    "Bhavnagar",
    "Botad",
    "Chhota Udaipur",
    "Dahod",
    "Dang",
    "Devbhumi Dwarka",
    "Gandhinagar",
    "Gir Somnath",
    "Jamnagar",
    "Junagadh",
    "Kheda",
    "Kutch",
    "Mahisagar",
    "Mehsana",
    "Morbi",
    "Narmada",
    "Navsari",
    "Panchmahal",
    "Patan",
    "Porbandar",
    "Rajkot",
    "Sabarkantha",
    "Surat",
    "Surendranagar",
    "Tapi",
    "Vadodara",
    "Valsad",
  ],

  Haryana: [
    "Ambala",
    "Bhiwani",
    "Charkhi Dadri",
    "Faridabad",
    "Fatehabad",
    "Gurugram",
    "Hansi",
    "Hisar",
    "Jhajjar",
    "Jind",
    "Kaithal",
    "Karnal",
    "Kurukshetra",
    "Mahendragarh",
    "Nuh",
    "Palwal",
    "Panchkula",
    "Panipat",
    "Rewari",
    "Rohtak",
    "Sirsa",
    "Sonipat",
    "Yamunanagar",
  ],

  "Himachal Pradesh": [
    "Bilaspur",
    "Chamba",
    "Hamirpur",
    "Kangra",
    "Kinnaur",
    "Kullu",
    "Lahaul and Spiti",
    "Mandi",
    "Shimla",
    "Sirmaur",
    "Solan",
    "Una",
  ],

  "Jammu and Kashmir": [
    "Anantnag",
    "Bandipora",
    "Baramulla",
    "Budgam",
    "Doda",
    "Ganderbal",
    "Jammu",
    "Kathua",
    "Kishtwar",
    "Kulgam",
    "Kupwara",
    "Poonch",
    "Pulwama",
    "Rajouri",
    "Ramban",
    "Reasi",
    "Samba",
    "Shopian",
    "Srinagar",
    "Udhampur",
  ],

  Jharkhand: [
    "Bokaro",
    "Chatra",
    "Deoghar",
    "Dhanbad",
    "Dumka",
    "East Singhbhum",
    "Garhwa",
    "Giridih",
    "Godda",
    "Gumla",
    "Hazaribagh",
    "Jamtara",
    "Khunti",
    "Koderma",
    "Latehar",
    "Lohardaga",
    "Pakur",
    "Palamu",
    "Ramgarh",
    "Ranchi",
    "Sahebganj",
    "Saraikela-Kharsawan",
    "Simdega",
    "West Singhbhum",
  ],

  Karnataka: [
    "Bagalkote",
    "Ballari",
    "Belagavi",
    "Bengaluru Rural",
    "Bengaluru South",
    "Bengaluru Urban",
    "Bidar",
    "Chamarajanagar",
    "Chikkaballapura",
    "Chikkamagaluru",
    "Chitradurga",
    "Dakshina Kannada",
    "Davanagere",
    "Dharwad",
    "Gadag",
    "Hassan",
    "Haveri",
    "Kalaburagi",
    "Kodagu",
    "Kolar",
    "Koppal",
    "Mandya",
    "Mysuru",
    "Raichur",
    "Shivamogga",
    "Tumakuru",
    "Udupi",
    "Uttara Kannada",
    "Vijayapura",
    "Vijayanagara",
    "Yadgir",
  ],

  Kerala: [
    "Alappuzha",
    "Ernakulam",
    "Idukki",
    "Kannur",
    "Kasaragod",
    "Kollam",
    "Kottayam",
    "Kozhikode",
    "Malappuram",
    "Palakkad",
    "Pathanamthitta",
    "Thiruvananthapuram",
    "Thrissur",
    "Wayanad",
  ],

  Ladakh: [
    "Changthang",
    "Drass",
    "Kargil",
    "Leh",
    "Nubra",
    "Sham",
    "Zanskar",
  ],

  Lakshadweep: [
    "Lakshadweep",
  ],

  "Madhya Pradesh": [
    "Agar Malwa",
    "Alirajpur",
    "Anuppur",
    "Ashoknagar",
    "Balaghat",
    "Barwani",
    "Betul",
    "Bhind",
    "Bhopal",
    "Burhanpur",
    "Chhatarpur",
    "Chhindwara",
    "Damoh",
    "Datia",
    "Dewas",
    "Dhar",
    "Dindori",
    "Guna",
    "Gwalior",
    "Harda",
    "Indore",
    "Jabalpur",
    "Jhabua",
    "Katni",
    "Khandwa",
    "Khargone",
    "Maihar",
    "Mandla",
    "Mandsaur",
    "Mauganj",
    "Morena",
    "Narmadapuram",
    "Narsinghpur",
    "Neemuch",
    "Niwari",
    "Pandhurna",
    "Panna",
    "Raisen",
    "Rajgarh",
    "Ratlam",
    "Rewa",
    "Sagar",
    "Satna",
    "Sehore",
    "Seoni",
    "Shahdol",
    "Shajapur",
    "Sheopur",
    "Shivpuri",
    "Sidhi",
    "Singrauli",
    "Tikamgarh",
    "Ujjain",
    "Umaria",
    "Vidisha",
  ],

  Maharashtra: [
    "Ahilyanagar",
    "Akola",
    "Amravati",
    "Beed",
    "Bhandara",
    "Buldhana",
    "Chandrapur",
    "Chhatrapati Sambhajinagar",
    "Dharashiv",
    "Dhule",
    "Gadchiroli",
    "Gondia",
    "Hingoli",
    "Jalgaon",
    "Jalna",
    "Kolhapur",
    "Latur",
    "Mumbai City",
    "Mumbai Suburban",
    "Nagpur",
    "Nanded",
    "Nandurbar",
    "Nashik",
    "Palghar",
    "Parbhani",
    "Pune",
    "Raigad",
    "Ratnagiri",
    "Sangli",
    "Satara",
    "Sindhudurg",
    "Solapur",
    "Thane",
    "Wardha",
    "Washim",
    "Yavatmal",
  ],

  Manipur: [
    "Bishnupur",
    "Chandel",
    "Churachandpur",
    "Imphal East",
    "Imphal West",
    "Jiribam",
    "Kakching",
    "Kamjong",
    "Kangpokpi",
    "Noney",
    "Pherzawl",
    "Senapati",
    "Tamenglong",
    "Tengnoupal",
    "Thoubal",
    "Ukhrul",
  ],

  Meghalaya: [
    "East Garo Hills",
    "East Jaintia Hills",
    "East Khasi Hills",
    "Eastern West Khasi Hills",
    "North Garo Hills",
    "Ri Bhoi",
    "South Garo Hills",
    "South West Garo Hills",
    "South West Khasi Hills",
    "West Garo Hills",
    "West Jaintia Hills",
    "West Khasi Hills",
  ],

  Mizoram: [
    "Aizawl",
    "Champhai",
    "Hnahthial",
    "Khawzawl",
    "Kolasib",
    "Lawngtlai",
    "Lunglei",
    "Mamit",
    "Saitual",
    "Serchhip",
    "Siaha",
  ],

  Nagaland: [
    "Chumoukedima",
    "Dimapur",
    "Kiphire",
    "Kohima",
    "Longleng",
    "Meluri",
    "Mokokchung",
    "Mon",
    "Niuland",
    "Noklak",
    "Peren",
    "Phek",
    "Shamator",
    "Tseminyu",
    "Tuensang",
    "Wokha",
    "Zunheboto",
  ],

  Odisha: [
    "Angul",
    "Balangir",
    "Balasore",
    "Bargarh",
    "Bhadrak",
    "Boudh",
    "Cuttack",
    "Deogarh",
    "Dhenkanal",
    "Gajapati",
    "Ganjam",
    "Jagatsinghpur",
    "Jajpur",
    "Jharsuguda",
    "Kalahandi",
    "Kandhamal",
    "Kendrapara",
    "Keonjhar",
    "Khordha",
    "Koraput",
    "Malkangiri",
    "Mayurbhanj",
    "Nabarangpur",
    "Nayagarh",
    "Nuapada",
    "Puri",
    "Rayagada",
    "Sambalpur",
    "Subarnapur",
    "Sundargarh",
  ],

  Puducherry: [
    "Karaikal",
    "Mahe",
    "Puducherry",
    "Yanam",
  ],

  Punjab: [
    "Amritsar",
    "Barnala",
    "Bathinda",
    "Faridkot",
    "Fatehgarh Sahib",
    "Fazilka",
    "Ferozepur",
    "Gurdaspur",
    "Hoshiarpur",
    "Jalandhar",
    "Kapurthala",
    "Ludhiana",
    "Malerkotla",
    "Mansa",
    "Moga",
    "Pathankot",
    "Patiala",
    "Rupnagar",
    "S.A.S. Nagar",
    "Sangrur",
    "Shaheed Bhagat Singh Nagar",
    "Sri Muktsar Sahib",
    "Tarn Taran",
  ],

  Rajasthan: [
    "Ajmer",
    "Alwar",
    "Balotra",
    "Banswara",
    "Baran",
    "Barmer",
    "Beawar",
    "Bharatpur",
    "Bhilwara",
    "Bikaner",
    "Bundi",
    "Chittorgarh",
    "Churu",
    "Dausa",
    "Deeg",
    "Dholpur",
    "Didwana-Kuchaman",
    "Dungarpur",
    "Hanumangarh",
    "Jaipur",
    "Jaisalmer",
    "Jalore",
    "Jhalawar",
    "Jhunjhunu",
    "Jodhpur",
    "Karauli",
    "Khairthal-Tijara",
    "Kota",
    "Kotputli-Behror",
    "Nagaur",
    "Pali",
    "Phalodi",
    "Pratapgarh",
    "Rajsamand",
    "Salumber",
    "Sawai Madhopur",
    "Sikar",
    "Sirohi",
    "Sri Ganganagar",
    "Tonk",
    "Udaipur",
  ],

  Sikkim: [
    "Gangtok",
    "Gyalshing",
    "Mangan",
    "Namchi",
    "Pakyong",
    "Soreng",
  ],

  "Tamil Nadu": [
    "Ariyalur",
    "Chengalpattu",
    "Chennai",
    "Coimbatore",
    "Cuddalore",
    "Dharmapuri",
    "Dindigul",
    "Erode",
    "Kallakurichi",
    "Kancheepuram",
    "Kanniyakumari",
    "Karur",
    "Krishnagiri",
    "Madurai",
    "Mayiladuthurai",
    "Nagapattinam",
    "Namakkal",
    "Nilgiris",
    "Perambalur",
    "Pudukkottai",
    "Ramanathapuram",
    "Ranipet",
    "Salem",
    "Sivaganga",
    "Tenkasi",
    "Thanjavur",
    "Theni",
    "Thoothukudi",
    "Tiruchirappalli",
    "Tirunelveli",
    "Tirupathur",
    "Tiruppur",
    "Tiruvallur",
    "Tiruvannamalai",
    "Tiruvarur",
    "Vellore",
    "Viluppuram",
    "Virudhunagar",
  ],

  Telangana: [
    "Adilabad",
    "Bhadradri Kothagudem",
    "Hanumakonda",
    "Hyderabad",
    "Jagtial",
    "Jangaon",
    "Jayashankar Bhupalpally",
    "Jogulamba Gadwal",
    "Kamareddy",
    "Karimnagar",
    "Khammam",
    "Komaram Bheem Asifabad",
    "Mahabubabad",
    "Mahabubnagar",
    "Mancherial",
    "Medak",
    "Medchal-Malkajgiri",
    "Mulugu",
    "Nagarkurnool",
    "Nalgonda",
    "Narayanpet",
    "Nirmal",
    "Nizamabad",
    "Peddapalli",
    "Rajanna Sircilla",
    "Rangareddy",
    "Sangareddy",
    "Siddipet",
    "Suryapet",
    "Vikarabad",
    "Wanaparthy",
    "Warangal",
    "Yadadri Bhuvanagiri",
  ],

  Tripura: [
    "Dhalai",
    "Gomati",
    "Khowai",
    "North Tripura",
    "Sepahijala",
    "South Tripura",
    "Unakoti",
    "West Tripura",
  ],

  "Uttar Pradesh": [
    "Agra",
    "Aligarh",
    "Ambedkar Nagar",
    "Amethi",
    "Amroha",
    "Auraiya",
    "Ayodhya",
    "Azamgarh",
    "Baghpat",
    "Bahraich",
    "Ballia",
    "Balrampur",
    "Banda",
    "Barabanki",
    "Bareilly",
    "Basti",
    "Bhadohi",
    "Bijnor",
    "Budaun",
    "Bulandshahr",
    "Chandauli",
    "Chitrakoot",
    "Deoria",
    "Etah",
    "Etawah",
    "Farrukhabad",
    "Fatehpur",
    "Firozabad",
    "Gautam Buddha Nagar",
    "Ghaziabad",
    "Ghazipur",
    "Gonda",
    "Gorakhpur",
    "Hamirpur",
    "Hapur",
    "Hardoi",
    "Hathras",
    "Jalaun",
    "Jaunpur",
    "Jhansi",
    "Kannauj",
    "Kanpur Dehat",
    "Kanpur Nagar",
    "Kasganj",
    "Kaushambi",
    "Kushinagar",
    "Lakhimpur Kheri",
    "Lalitpur",
    "Lucknow",
    "Maharajganj",
    "Mahoba",
    "Mainpuri",
    "Mathura",
    "Mau",
    "Meerut",
    "Mirzapur",
    "Moradabad",
    "Muzaffarnagar",
    "Pilibhit",
    "Pratapgarh",
    "Prayagraj",
    "Rae Bareli",
    "Rampur",
    "Saharanpur",
    "Sambhal",
    "Sant Kabir Nagar",
    "Sant Ravidas Nagar",
    "Shahjahanpur",
    "Shamli",
    "Shravasti",
    "Siddharthnagar",
    "Sitapur",
    "Sonbhadra",
    "Sultanpur",
    "Unnao",
    "Varanasi",
  ],

  Uttarakhand: [
    "Almora",
    "Bageshwar",
    "Chamoli",
    "Champawat",
    "Dehradun",
    "Haridwar",
    "Nainital",
    "Pauri Garhwal",
    "Pithoragarh",
    "Rudraprayag",
    "Tehri Garhwal",
    "Udham Singh Nagar",
    "Uttarkashi",
  ],

  "West Bengal": [
    "Alipurduar",
    "Bankura",
    "Birbhum",
    "Cooch Behar",
    "Dakshin Dinajpur",
    "Darjeeling",
    "Hooghly",
    "Howrah",
    "Jalpaiguri",
    "Jhargram",
    "Kalimpong",
    "Kolkata",
    "Malda",
    "Murshidabad",
    "Nadia",
    "North 24 Parganas",
    "Paschim Bardhaman",
    "Paschim Medinipur",
    "Purba Bardhaman",
    "Purba Medinipur",
    "Purulia",
    "South 24 Parganas",
    "Uttar Dinajpur",
  ],
};

/*
 * =========================================================
 * District Helpers
 * =========================================================
 */

export function getDistrictsForState(
  stateName: string
): LocationOption[] {
  if (!stateName.trim()) {
    return [];
  }

  const normalized =
    stateName
      .trim()
      .toLowerCase();

  const matchingState =
    Object.keys(
      INDIA_DISTRICTS
    ).find(
      (state) =>
        state.toLowerCase() ===
        normalized
    );

  if (!matchingState) {
    return [];
  }

  const districts =
    INDIA_DISTRICTS[
      matchingState
    ];

  return Array.from(
    new Set(
      districts
        .map((district) =>
          district.trim()
        )
        .filter(Boolean)
    )
  )
    .sort((first, second) =>
      first.localeCompare(
        second
      )
    )
    .map((district) => ({
      value: district,
      label: district,
    }));
}

/*
 * =========================================================
 * India Helper
 * =========================================================
 */

export function isIndia(
  countryName: string
): boolean {
  return (
    countryName
      .trim()
      .toLowerCase() ===
    INDIA_COUNTRY_NAME
      .toLowerCase()
  );
}

/*
 * =========================================================
 * Legacy Combined Location Helpers
 * =========================================================
 */

export interface ParsedLocation {
  city: string;
  district: string;
  state: string;
}

export function parseLocation(
  location: string
): ParsedLocation {
  if (!location.trim()) {
    return {
      city: "",
      district: "",
      state: "",
    };
  }

  const parts =
    location
      .split(",")
      .map((part) =>
        part.trim()
      )
      .filter(Boolean);

  if (
    parts.length >= 3
  ) {
    return {
      city:
        parts[0] ?? "",

      district:
        parts[1] ?? "",

      state:
        parts
          .slice(2)
          .join(", ")
          .trim(),
    };
  }

  if (
    parts.length === 2
  ) {
    return {
      city:
        parts[0] ?? "",

      district: "",

      state:
        parts[1] ?? "",
    };
  }

  const value =
    parts[0] ?? "";

  const stateExists =
    INDIA_STATES.some(
      (state) =>
        state.value ===
        value
    );

  return stateExists
    ? {
        city: "",
        district: "",
        state: value,
      }
    : {
        city: value,
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
    city.trim(),
    district.trim(),
    state.trim(),
  ]
    .filter(Boolean)
    .join(", ");
}
