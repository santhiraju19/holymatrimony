"use client";

interface Props {
  memberId: number;
  memberName: string;
}

export default function CallRequestButton({
  memberId,
  memberName,
}: Props) {
  return (
    <button
      className="rounded-xl bg-[#0B2D5C] px-6 py-3 text-white"
    >
      Request Introduction Meeting
    </button>
  );
}