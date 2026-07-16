"use client";

import MatchCard from "./MatchCard";

const profiles = [
  {
    id: 1,
    name: "John David",
    age: 28,
    profession: "Software Engineer",
    location: "Hyderabad",
    denomination: "CSI",
  },
  {
    id: 2,
    name: "Samuel Raj",
    age: 30,
    profession: "Doctor",
    location: "Vijayawada",
    denomination: "Baptist",
  },
  {
    id: 3,
    name: "Daniel Paul",
    age: 27,
    profession: "Data Analyst",
    location: "Guntur",
    denomination: "Pentecostal",
  },
  {
    id: 4,
    name: "Joshua Peter",
    age: 29,
    profession: "Business Owner",
    location: "Visakhapatnam",
    denomination: "CSI",
  },
  {
    id: 5,
    name: "Andrew Joseph",
    age: 31,
    profession: "Architect",
    location: "Bengaluru",
    denomination: "Methodist",
  },
  {
    id: 6,
    name: "Joel Mathew",
    age: 26,
    profession: "Teacher",
    location: "Chennai",
    denomination: "Independent",
  },
];

export default function MatchGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {profiles.map((profile) => (
        <MatchCard
          key={profile.id}
          profile={profile}
        />
      ))}
    </div>
  );
}