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
 * Basic Information now also owns
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

/*
 * =========================================================
 * Basic + Current Location + About Me
 * =========================================================
 */

export function validateBasicInfo(
  values: BasicInfo,
  location: LocationInfo,
  about: AboutInfo
): BasicFormErrors {
  const errors:
    BasicFormErrors = {};

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
      calculatedAge ===
      null
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

  /*
   * Current location is required.
   */

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

  /*
   * About Me is required under the
   * final unified completion rule.
   */
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

/*
 * =========================================================
 * Church Information
 * =========================================================
 */

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
   * Final rule: pastor information
   * is required.
   */
  if (
    isBlank(
      values.pastorName
    )
  ) {
    errors.pastorName =
      "Please enter your pastor's name.";
  }

  /*
   * Baptism answer is required.
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
   * Membership information is part
   * of complete church information.
   */
 

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
   * The Church form serializes the
   * selected location into churchAddress,
   * so a complete location satisfies
   * the backend churchAddress field.
   */

  return errors;
}

/*
 * =========================================================
 * Education & Career
 * =========================================================
 */

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

  if (
    isBlank(
      values.profession
    )
  ) {
    errors.profession =
      "Please select your profession.";
  }

  /*
   * Company is now required.
   */
  if (
    isBlank(
      values.company
    )
  ) {
    errors.company =
      "Please enter your company or organization. If not applicable, enter N/A.";
  } else if (
    values.company
      .trim()
      .length < 2
  ) {
    errors.company =
      "Please enter a valid company or organization.";
  }

  /*
   * Annual income is now required.
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

/*
 * =========================================================
 * Family Information
 * =========================================================
 */

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
   * Siblings is now required.
   * 0 is a valid answer.
   */
  if (
    isBlank(
      values.siblings
    )
  ) {
    errors.siblings =
      "Please enter the number of siblings. Enter 0 if none.";
  } else {
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

/*
 * =========================================================
 * Partner Preferences
 * =========================================================
 */

export function validatePreferenceInfo(
  values: PreferenceInfo
): FieldErrors<PreferenceInfo> {
  const errors:
    FieldErrors<PreferenceInfo> =
      {};

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

  if (
    isBlank(
      values.preferredDenomination
    )
  ) {
    errors.preferredDenomination =
      "Please select a preferred denomination or Any.";
  }

  if (
    isBlank(
      values.preferredEducation
    )
  ) {
    errors.preferredEducation =
      "Please select a preferred education or Any.";
  }

  return errors;
}

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