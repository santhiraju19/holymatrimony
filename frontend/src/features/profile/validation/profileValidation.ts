import type {
  AboutInfo,
  BasicInfo,
  ChurchInfo,
  EducationInfo,
  FamilyInfo,
  LocationInfo,
  PreferenceInfo,
} from "@/features/profile/types";

export type FieldErrors<T> =
  Partial<
    Record<keyof T, string>
  >;

export interface LocationSelection {
  state: string;
  district: string;
  city: string;
}

/*
 * Basic Information also owns
 * Current Location + About Me in the UI.
 */
export type BasicFormErrors =
  FieldErrors<BasicInfo> & {
    city?: string;
    state?: string;
    country?: string;
    aboutMe?: string;
  };

export type ChurchFormErrors =
  FieldErrors<ChurchInfo> & {
    churchState?: string;
    churchDistrict?: string;
    churchCity?: string;
  };

export type FamilyFormErrors =
  FieldErrors<FamilyInfo> & {
    familyState?: string;
    familyDistrict?: string;
    familyCity?: string;
  };

// =========================================================
// Helpers
// =========================================================

function isBlank(
  value: string
): boolean {
  return !value.trim();
}

function calculateAge(
  dateOfBirth: string
): number | null {
  if (!dateOfBirth) {
    return null;
  }

  const birthDate =
    new Date(
      dateOfBirth
    );

  if (
    Number.isNaN(
      birthDate.getTime()
    )
  ) {
    return null;
  }

  const today =
    new Date();

  let age =
    today.getFullYear() -
    birthDate.getFullYear();

  const monthDifference =
    today.getMonth() -
    birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (
      monthDifference === 0 &&
      today.getDate() <
        birthDate.getDate()
    )
  ) {
    age -= 1;
  }

  return age;
}

function validateIntegerRange(
  value: string,
  minimum: number,
  maximum: number
): boolean {
  if (!value.trim()) {
    return false;
  }

  const numericValue =
    Number(value);

  return (
    Number.isInteger(
      numericValue
    ) &&
    numericValue >= minimum &&
    numericValue <= maximum
  );
}

// =========================================================
// Basic + Personal + Current Location + About Me
// =========================================================

export function validateBasicInfo(
  values: BasicInfo,
  location: LocationInfo,
  about: AboutInfo
): BasicFormErrors {
  const errors:
    BasicFormErrors = {};

  // =====================================================
  // Account / identity
  // =====================================================

  if (
    isBlank(
      values.fullName
    )
  ) {
    errors.fullName =
      "Please enter your full name.";
  } else if (
    values.fullName
      .trim()
      .length < 3
  ) {
    errors.fullName =
      "Full name must contain at least 3 characters.";
  }

  if (
    isBlank(
      values.email
    )
  ) {
    errors.email =
      "Please enter your email address.";
  } else {
    const validEmail =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !validEmail.test(
        values.email.trim()
      )
    ) {
      errors.email =
        "Please enter a valid email address.";
    }
  }

  if (
    isBlank(
      values.mobile
    )
  ) {
    errors.mobile =
      "Please enter your mobile number.";
  } else {
    const digits =
      values.mobile.replace(
        /\D/g,
        ""
      );

    if (
      digits.length < 10 ||
      digits.length > 15
    ) {
      errors.mobile =
        "Please enter a valid mobile number.";
    }
  }

  // =====================================================
  // Date of birth / age
  // =====================================================

  if (
    isBlank(
      values.dateOfBirth
    )
  ) {
    errors.dateOfBirth =
      "Please select your date of birth.";
  } else {
    const calculatedAge =
      calculateAge(
        values.dateOfBirth
      );

    if (
      calculatedAge === null
    ) {
      errors.dateOfBirth =
        "Please select a valid date of birth.";
    } else if (
      calculatedAge < 18
    ) {
      errors.dateOfBirth =
        "You must be at least 18 years old.";
    } else if (
      calculatedAge > 100
    ) {
      errors.dateOfBirth =
        "Please select a valid date of birth.";
    }
  }

  if (
    values.age.trim() &&
    (
      Number(
        values.age
      ) < 18 ||
      Number(
        values.age
      ) > 100
    )
  ) {
    errors.age =
      "Age must be between 18 and 100.";
  }

  // =====================================================
  // Basic matrimonial details
  // =====================================================

  if (
    isBlank(
      values.gender
    )
  ) {
    errors.gender =
      "Please select your gender.";
  }

  if (
    isBlank(
      values.maritalStatus
    )
  ) {
    errors.maritalStatus =
      "Please select your marital status.";
  }

  // =====================================================
  // Height
  // =====================================================

  if (
    isBlank(
      values.heightCm
    )
  ) {
    errors.heightCm =
      "Please select your height.";
  } else if (
    !validateIntegerRange(
      values.heightCm,
      100,
      250
    )
  ) {
    errors.heightCm =
      "Please enter a valid height.";
  }

  // =====================================================
  // Weight — optional
  // =====================================================

  if (
    values.weightKg.trim() &&
    !validateIntegerRange(
      values.weightKg,
      25,
      300
    )
  ) {
    errors.weightKg =
      "Weight must be between 25 and 300 kg.";
  }

  // =====================================================
  // Mother tongue
  // =====================================================

  if (
    isBlank(
      values.motherTongue
    )
  ) {
    errors.motherTongue =
      "Please select your mother tongue.";
  }

  // =====================================================
  // Religion
  // =====================================================

  if (
    isBlank(
      values.religion
    )
  ) {
    errors.religion =
      "Please select your religion.";
  }

  /*
   * Religion, denomination and community are separate.
   *
   * Example:
   *
   * Religion:
   * Christianity
   *
   * Denomination:
   * Pentecostal
   *
   * Community:
   * Reddy
   *
   * Community remains optional.
   */

  // =====================================================
  // Community / caste — optional
  // =====================================================

  if (
    values.community
      .trim()
      .length > 120
  ) {
    errors.community =
      "Community cannot exceed 120 characters.";
  }

  if (
    values.subCommunity
      .trim()
      .length > 120
  ) {
    errors.subCommunity =
      "Sub-community cannot exceed 120 characters.";
  }

  // =====================================================
  // Optional physical / lifestyle fields
  // =====================================================

  if (
    values.complexion
      .trim()
      .length > 50
  ) {
    errors.complexion =
      "Complexion cannot exceed 50 characters.";
  }

  if (
    values.bodyType
      .trim()
      .length > 50
  ) {
    errors.bodyType =
      "Body type cannot exceed 50 characters.";
  }

  if (
    values.faithBackground
      .trim()
      .length > 80
  ) {
    errors.faithBackground =
      "Faith background cannot exceed 80 characters.";
  }

  if (
    values.physicalStatus
      .trim()
      .length > 80
  ) {
    errors.physicalStatus =
      "Physical status cannot exceed 80 characters.";
  }

  // =====================================================
  // Current Location
  // =====================================================

  if (
    isBlank(
      location.country
    )
  ) {
    errors.country =
      "Please select your current country.";
  }

  if (
    isBlank(
      location.state
    )
  ) {
    errors.state =
      "Please select your current state.";
  }

  if (
    isBlank(
      location.city
    )
  ) {
    errors.city =
      "Please select your current city.";
  }

  // =====================================================
  // About Me
  // =====================================================

  if (
    isBlank(
      about.aboutMe
    )
  ) {
    errors.aboutMe =
      "Please tell us a little about yourself.";
  } else if (
    about.aboutMe
      .trim()
      .length < 30
  ) {
    errors.aboutMe =
      "About Me should contain at least 30 characters.";
  } else if (
    about.aboutMe
      .trim()
      .length > 2000
  ) {
    errors.aboutMe =
      "About Me cannot exceed 2000 characters.";
  }

  return errors;
}

// =========================================================
// Church Information
// =========================================================

export function validateChurchInfo(
  values: ChurchInfo,
  location: LocationSelection
): ChurchFormErrors {
  const errors:
    ChurchFormErrors = {};

  if (
    isBlank(
      values.churchName
    )
  ) {
    errors.churchName =
      "Please enter your church name.";
  } else if (
    values.churchName
      .trim()
      .length < 2
  ) {
    errors.churchName =
      "Church name must contain at least 2 characters.";
  }

  if (
    isBlank(
      values.denomination
    )
  ) {
    errors.denomination =
      "Please select your denomination.";
  }

  /*
   * Pastor name is part of the backend
   * profile-completion calculation.
   */
  if (
    isBlank(
      values.pastorName
    )
  ) {
    errors.pastorName =
      "Please enter your pastor's name.";
  } else if (
    values.pastorName
      .trim()
      .length < 2
  ) {
    errors.pastorName =
      "Please enter a valid pastor name.";
  }

  /*
   * Baptism answer is required.
   *
   * Both Yes and No are valid answers.
   */
  if (
    isBlank(
      values.baptized
    )
  ) {
    errors.baptized =
      "Please select your baptism status.";
  }

  /*
   * Membership ID remains optional.
   */

  if (
    values.membershipId
      .trim()
      .length > 60
  ) {
    errors.membershipId =
      "Membership ID cannot exceed 60 characters.";
  }

  // =====================================================
  // Church location
  // =====================================================

  if (
    isBlank(
      location.state
    )
  ) {
    errors.churchState =
      "Please select the church state.";
  }

  if (
    !isBlank(
      location.state
    ) &&
    isBlank(
      location.district
    )
  ) {
    errors.churchDistrict =
      "Please select the church district.";
  }

  if (
    !isBlank(
      location.state
    ) &&
    isBlank(
      location.city
    )
  ) {
    errors.churchCity =
      "Please select the church city.";
  }

  /*
   * ChurchInfoForm serializes State/District/City
   * into churchAddress.
   */

  return errors;
}

// =========================================================
// Education & Career
// =========================================================

export function validateEducationInfo(
  values: EducationInfo
): FieldErrors<EducationInfo> {
  const errors:
    FieldErrors<EducationInfo> =
      {};

  if (
    isBlank(
      values.highestEducation
    )
  ) {
    errors.highestEducation =
      "Please select your highest education.";
  }

  /*
   * V25:
   * Education specialization / field is now part
   * of the core profile-completion calculation.
   */
  if (
    isBlank(
      values.educationField
    )
  ) {
    errors.educationField =
      "Please enter your field of study or specialization.";
  } else if (
    values.educationField
      .trim()
      .length < 2
  ) {
    errors.educationField =
      "Please enter a valid field of study.";
  } else if (
    values.educationField
      .trim()
      .length > 120
  ) {
    errors.educationField =
      "Education field cannot exceed 120 characters.";
  }

  if (
    isBlank(
      values.profession
    )
  ) {
    errors.profession =
      "Please select your profession.";
  }

  /*
   * Company is optional.
   *
   * This supports self-employed members,
   * freelancers, homemakers, students,
   * retired members, etc.
   */
  if (
    values.company.trim() &&
    values.company
      .trim()
      .length < 2
  ) {
    errors.company =
      "Please enter a valid company or organization.";
  }

  if (
    values.company
      .trim()
      .length > 120
  ) {
    errors.company =
      "Company or organization cannot exceed 120 characters.";
  }

  /*
   * Annual income remains part of
   * core profile completion.
   */
  if (
    isBlank(
      values.annualIncome
    )
  ) {
    errors.annualIncome =
      "Please enter your annual income.";
  } else if (
    values.annualIncome
      .trim()
      .length < 2
  ) {
    errors.annualIncome =
      "Please enter a valid annual income.";
  }

  return errors;
}

// =========================================================
// Family Information
// =========================================================

export function validateFamilyInfo(
  values: FamilyInfo,
  location: LocationSelection
): FamilyFormErrors {
  const errors:
    FamilyFormErrors = {};

  if (
    isBlank(
      values.fatherName
    )
  ) {
    errors.fatherName =
      "Please enter your father's name.";
  } else if (
    values.fatherName
      .trim()
      .length < 2
  ) {
    errors.fatherName =
      "Father's name must contain at least 2 characters.";
  }

  if (
    isBlank(
      values.motherName
    )
  ) {
    errors.motherName =
      "Please enter your mother's name.";
  } else if (
    values.motherName
      .trim()
      .length < 2
  ) {
    errors.motherName =
      "Mother's name must contain at least 2 characters.";
  }

  /*
   * Siblings is useful matrimonial information,
   * but it is no longer mandatory for 100%
   * profile completion.
   *
   * Validate it only when supplied.
   */
  if (
    values.siblings.trim()
  ) {
    const siblings =
      Number(
        values.siblings
      );

    if (
      !Number.isInteger(
        siblings
      ) ||
      siblings < 0 ||
      siblings > 20
    ) {
      errors.siblings =
        "Number of siblings must be between 0 and 20.";
    }
  }

  /*
   * V25:
   * Family Type is part of core completion.
   */
  if (
    isBlank(
      values.familyType
    )
  ) {
    errors.familyType =
      "Please select your family type.";
  }

  /*
   * Family values is optional.
   */
  if (
    values.familyValues
      .trim()
      .length > 50
  ) {
    errors.familyValues =
      "Family values cannot exceed 50 characters.";
  }

  // =====================================================
  // Family location
  // =====================================================

  if (
    isBlank(
      location.state
    )
  ) {
    errors.familyState =
      "Please select your family state.";
  }

  if (
    !isBlank(
      location.state
    ) &&
    isBlank(
      location.district
    )
  ) {
    errors.familyDistrict =
      "Please select your family district.";
  }

  if (
    !isBlank(
      location.state
    ) &&
    isBlank(
      location.city
    )
  ) {
    errors.familyCity =
      "Please select your family city.";
  }

  return errors;
}

// =========================================================
// Partner Preferences
// =========================================================

export function validatePreferenceInfo(
  values: PreferenceInfo
): FieldErrors<PreferenceInfo> {
  const errors:
    FieldErrors<PreferenceInfo> =
      {};

  // =====================================================
  // Preferred age
  // =====================================================

  const ageFrom =
    Number(
      values.preferredAgeFrom
    );

  const ageTo =
    Number(
      values.preferredAgeTo
    );

  if (
    isBlank(
      values.preferredAgeFrom
    )
  ) {
    errors.preferredAgeFrom =
      "Please enter the minimum preferred age.";
  } else if (
    !Number.isInteger(
      ageFrom
    ) ||
    ageFrom < 18 ||
    ageFrom > 100
  ) {
    errors.preferredAgeFrom =
      "Preferred age must be between 18 and 100.";
  }

  if (
    isBlank(
      values.preferredAgeTo
    )
  ) {
    errors.preferredAgeTo =
      "Please enter the maximum preferred age.";
  } else if (
    !Number.isInteger(
      ageTo
    ) ||
    ageTo < 18 ||
    ageTo > 100
  ) {
    errors.preferredAgeTo =
      "Preferred age must be between 18 and 100.";
  }

  if (
    !errors.preferredAgeFrom &&
    !errors.preferredAgeTo &&
    ageFrom > ageTo
  ) {
    errors.preferredAgeTo =
      "Maximum age must be greater than or equal to minimum age.";
  }

  // =====================================================
  // Preferred height
  // =====================================================

  const heightFrom =
    Number(
      values.preferredHeightFromCm
    );

  const heightTo =
    Number(
      values.preferredHeightToCm
    );

  if (
    isBlank(
      values.preferredHeightFromCm
    )
  ) {
    errors.preferredHeightFromCm =
      "Please select the minimum preferred height.";
  } else if (
    !Number.isInteger(
      heightFrom
    ) ||
    heightFrom < 100 ||
    heightFrom > 250
  ) {
    errors.preferredHeightFromCm =
      "Please select a valid minimum height.";
  }

  if (
    isBlank(
      values.preferredHeightToCm
    )
  ) {
    errors.preferredHeightToCm =
      "Please select the maximum preferred height.";
  } else if (
    !Number.isInteger(
      heightTo
    ) ||
    heightTo < 100 ||
    heightTo > 250
  ) {
    errors.preferredHeightToCm =
      "Please select a valid maximum height.";
  }

  if (
    !errors.preferredHeightFromCm &&
    !errors.preferredHeightToCm &&
    heightFrom > heightTo
  ) {
    errors.preferredHeightToCm =
      "Maximum height must be greater than or equal to minimum height.";
  }

  // =====================================================
  // Religion
  // =====================================================

  if (
    isBlank(
      values.preferredReligion
    )
  ) {
    errors.preferredReligion =
      "Please select a preferred religion.";
  }

  /*
   * Preferred denomination is optional.
   *
   * Members may select "Any" in the UI.
   */

  // =====================================================
  // Community
  // =====================================================

  /*
   * When Community No Bar is enabled,
   * preferredCommunity is intentionally ignored.
   */
  if (
    !values.communityNoBar &&
    isBlank(
      values.preferredCommunity
    )
  ) {
    errors.preferredCommunity =
      "Please enter your preferred community or select Community No Bar.";
  }

  if (
    values.preferredCommunity
      .trim()
      .length > 120
  ) {
    errors.preferredCommunity =
      "Preferred community cannot exceed 120 characters.";
  }

  // =====================================================
  // Education
  // =====================================================

  if (
    isBlank(
      values.preferredEducation
    )
  ) {
    errors.preferredEducation =
      "Please select a preferred education or Any.";
  }

  // =====================================================
  // Optional preference fields
  // =====================================================

  if (
    values.preferredProfession
      .trim()
      .length > 120
  ) {
    errors.preferredProfession =
      "Preferred profession cannot exceed 120 characters.";
  }

  if (
    values.preferredCountry
      .trim()
      .length > 120
  ) {
    errors.preferredCountry =
      "Preferred country cannot exceed 120 characters.";
  }

  if (
    values.preferredState
      .trim()
      .length > 120
  ) {
    errors.preferredState =
      "Preferred state cannot exceed 120 characters.";
  }

  if (
    values.preferredCity
      .trim()
      .length > 120
  ) {
    errors.preferredCity =
      "Preferred city cannot exceed 120 characters.";
  }

  return errors;
}

// =========================================================
// Common validation helpers
// =========================================================

export function hasValidationErrors<T>(
  errors: T
): boolean {
  return Object.keys(
    errors as object
  ).length > 0;
}

export function focusFirstInvalidField(): void {
  window.requestAnimationFrame(
    () => {
      const wrapper =
        document.querySelector<HTMLElement>(
          '[data-field-error="true"]'
        );

      if (!wrapper) {
        return;
      }

      wrapper.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      const control =
        wrapper.querySelector<
          | HTMLInputElement
          | HTMLSelectElement
          | HTMLTextAreaElement
        >(
          "input, select, textarea"
        );

      control?.focus({
        preventScroll: true,
      });
    }
  );
}