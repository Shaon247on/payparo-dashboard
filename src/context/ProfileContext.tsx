"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface ProfileState {
  photoUrl: string | null;
  initials: string;
  name: string;
}

interface ProfileContextValue {
  profile: ProfileState;
  setProfile: (p: Partial<ProfileState>) => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

const DEFAULT: ProfileState = { photoUrl: null, initials: "SA", name: "" };

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<ProfileState>(DEFAULT);

  const setProfile = useCallback((update: Partial<ProfileState>) => {
    setProfileState((prev) => ({ ...prev, ...update }));
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used inside <ProfileProvider>");
  return ctx;
}
