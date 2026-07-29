import {
  HeartHandshake,
} from "lucide-react";

export default function EmptyChatState() {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-[#0B2D5C]">
        <HeartHandshake size={38} />
      </div>

      <h2 className="mt-6 text-xl font-bold text-[#0B2D5C]">
        Holy Matrimony Messages
      </h2>

      <p className="mt-3 max-w-md text-sm leading-7 text-slate-500">
        Select a conversation to begin
        communicating with an accepted
        match.
      </p>
    </div>
  );
}