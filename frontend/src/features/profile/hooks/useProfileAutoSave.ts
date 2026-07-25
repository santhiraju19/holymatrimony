import { useEffect } from "react";

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