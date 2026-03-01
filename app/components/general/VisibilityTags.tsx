import { Visibility } from "@/schemas/post";

interface VisibilityTagProps {
  visibility: string;
}

const visibilityStyles: Record<Visibility, string> = {
  PUBLIC: "bg-green-100 text-green-800",
  PRIVATE: "bg-blue-100 text-blue-800",
  FOLLOWERS: "bg-orange-100 text-orange-800",
};

export const VisibilityTag = ({ visibility }: VisibilityTagProps) => {
  const key = visibility.toUpperCase() as Visibility;

  return (
    <span
      className={`text-xs px-2 py-1 rounded-full font-medium ${visibilityStyles[key]}`}
    >
      {key.charAt(0) + key.slice(1).toLowerCase()}
    </span>
  );
};
