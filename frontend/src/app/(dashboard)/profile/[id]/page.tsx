"use client";

import { useParams } from "next/navigation";

import Card from "@/components/ui/Card";

import InterestButton from "@/features/interests/components/InterestButton";
import CallRequestButton from "@/features/secure-connect/components/CallRequestButton";
import TrustPassport from "@/features/trust/components/TrustPassport";

const members = [
  {
    id: 1,
    name: "John David",
    age: 28,
    height: "5'10\"",
    profession: "Software Engineer",
    education: "B.Tech",
    denomination: "CSI",
    church: "St. John's Church",
    location: "Hyderabad",
    about:
      "Passionate Christian, family-oriented and looking for a God-centered marriage built on faith, love and mutual respect.",
  },
  {
    id: 2,
    name: "Samuel Raj",
    age: 30,
    height: "5'9\"",
    profession: "Doctor",
    education: "MBBS",
    denomination: "Baptist",
    church: "Bethel Church",
    location: "Vijayawada",
    about:
      "Doctor serving the community with strong Christian values and committed to building a Christ-centered family.",
  },
  {
    id: 3,
    name: "Daniel Paul",
    age: 27,
    height: "5'11\"",
    profession: "Data Analyst",
    education: "M.Tech",
    denomination: "Pentecostal",
    church: "New Life Church",
    location: "Guntur",
    about:
      "Technology enthusiast who believes in faith, family, and lifelong companionship.",
  },
  {
    id: 4,
    name: "Joshua Peter",
    age: 29,
    height: "5'10\"",
    profession: "Business Owner",
    education: "MBA",
    denomination: "CSI",
    church: "Grace Church",
    location: "Visakhapatnam",
    about:
      "Entrepreneur with a heart for ministry and serving the community.",
  },
  {
    id: 5,
    name: "Andrew Joseph",
    age: 31,
    height: "6'0\"",
    profession: "Architect",
    education: "B.Arch",
    denomination: "Methodist",
    church: "Methodist Church",
    location: "Bengaluru",
    about:
      "Creative professional seeking a partner to build a Christ-centered home together.",
  },
  {
    id: 6,
    name: "Joel Mathew",
    age: 26,
    height: "5'8\"",
    profession: "Teacher",
    education: "M.Ed",
    denomination: "Independent",
    church: "Faith Church",
    location: "Chennai",
    about:
      "Teacher passionate about faith, education and helping others grow.",
  },
];

export default function MemberProfilePage() {
  const params = useParams();

  const member = members.find(
    (m) => m.id === Number(params.id)
  );

  if (!member) {
    return (
      <Card>
        <h2 className="text-2xl font-bold text-[#0B2D5C]">
          Member Not Found
        </h2>

        <p className="mt-2 text-slate-500">
          The requested member profile could not be found.
        </p>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">

      <div className="grid gap-8 lg:grid-cols-3">

        <Card className="overflow-hidden p-0">
          <div className="flex aspect-[4/5] items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300">
            <span className="text-slate-500">
              Member Photo
            </span>
          </div>
        </Card>

        <div className="space-y-6 lg:col-span-2">

          <Card>

            <h1 className="text-4xl font-bold text-[#0B2D5C]">
              {member.name}
            </h1>

            <p className="mt-2 text-lg text-slate-500">
              {member.profession}
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">

              <Info label="Age" value={`${member.age} Years`} />
              <Info label="Height" value={member.height} />
              <Info label="Education" value={member.education} />
              <Info label="Profession" value={member.profession} />
              <Info label="Church" value={member.church} />
              <Info label="Denomination" value={member.denomination} />
              <Info label="Location" value={member.location} />

            </div>

          </Card>

          <Card>

            <h2 className="mb-4 text-2xl font-bold text-[#0B2D5C]">
              About
            </h2>

            <p className="leading-8 text-slate-600">
              {member.about}
            </p>

          </Card>

          <TrustPassport />

          <div className="flex flex-wrap gap-4">

            <InterestButton
              memberId={member.id}
              memberName={member.name}
            />

            <CallRequestButton
              memberId={member.id}
              memberName={member.name}
            />

          </div>

        </div>

      </div>

    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">

      <div className="text-sm text-slate-500">
        {label}
      </div>

      <div className="mt-1 font-semibold text-[#0B2D5C]">
        {value}
      </div>

    </div>
  );
}