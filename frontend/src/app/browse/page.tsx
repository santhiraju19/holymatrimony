
import type { Metadata } from "next";

import BrowseProfilesPage from "@/features/browse/components/BrowseProfilesPage";

export const metadata: Metadata = {
  title: "Browse Profiles | Holy Matrimony",
  description:
    "Browse verified Christian matrimony profiles and discover meaningful matches.",
};

export default function BrowsePage() {
  return <BrowseProfilesPage />;
}