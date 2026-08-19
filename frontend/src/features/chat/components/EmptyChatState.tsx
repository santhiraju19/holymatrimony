import {
  HeartHandshake,
  MessageCircleMore,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function EmptyChatState() {
  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/60 px-6 text-center">
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-100/60 blur-3xl" />

      <div className="relative max-w-md">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-gradient-to-br from-[#0B2D5C] to-blue-700 text-white shadow-lg">
          <HeartHandshake
            size={26}
          />
        </div>

        <div className="mt-4 flex items-center justify-center gap-1.5">
          <Sparkles
            size={10}
            className="text-[#B38B19]"
          />

          <p className="text-[9px] font-black uppercase tracking-[0.13em] text-[#B38B19]">
            Faithful Connections
          </p>
        </div>

        <h2 className="mt-1 text-lg font-black tracking-[-0.025em] text-[#0B2D5C]">
          Holy Matrimony Messages
        </h2>

        <p className="mt-2 text-xs leading-6 text-slate-500">
          Select a conversation to continue communicating securely with an accepted match.
        </p>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-white px-2.5 py-1 text-[9px] font-bold text-slate-500 shadow-sm">
            <MessageCircleMore
              size={11}
              className="text-blue-600"
            />

            Private conversations
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-white px-2.5 py-1 text-[9px] font-bold text-slate-500 shadow-sm">
            <ShieldCheck
              size={11}
              className="text-emerald-600"
            />

            Safety controls
          </span>
        </div>
      </div>
    </div>
  );
}
