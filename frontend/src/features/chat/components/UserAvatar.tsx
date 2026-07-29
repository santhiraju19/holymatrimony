import {
  getInitials,
} from "@/features/chat/utils/chat.utils";

interface UserAvatarProps {
  fullName: string;
  photoUrl?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-9 w-9 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-16 w-16 text-lg",
};

export default function UserAvatar({
  fullName,
  photoUrl,
  size = "md",
}: UserAvatarProps) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={fullName}
        className={`${sizeClasses[size]} shrink-0 rounded-full object-cover ring-2 ring-white`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0B2D5C] to-blue-500 font-bold text-white ring-2 ring-white`}
    >
      {getInitials(fullName)}
    </div>
  );
}