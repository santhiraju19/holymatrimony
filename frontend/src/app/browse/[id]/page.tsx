
import type { Metadata } from "next";

import ProfileDetailsPage from "@/features/browse/components/ProfileDetailsPage";

export const metadata: Metadata = {
  title: "Profile Details | Holy Matrimony",
  description:
    "View Christian matrimony profile details.",
};

interface BrowseProfileRouteProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BrowseProfileRoute({
  params,
}: BrowseProfileRouteProps) {
  const { id } = await params;

  return <ProfileDetailsPage profileId={id} />;
}