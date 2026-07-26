import { useEffect } from "react";
import { ProfileState } from "../types";

export function useProfileAutoSave(
  profile: ProfileState,
  save: () => Promise<void>
) {
  useEffect(() => {
    const timer = setTimeout(() => {
      save();
    }, 2000);

    return () => clearTimeout(timer);
  }, [profile, save]);
}