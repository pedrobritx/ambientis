import type { SVGProps } from "react";
// Selected original Meridian glyphs from universal-symbols.json at d16ad6136c14.
// Small utility glyphs follow its 24px grid, 1.7px stroke and round caps/joins.
type IconProps = SVGProps<SVGSVGElement> & { size?: number };
export function Sun(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
    </Icon>
  );
}
export function Moon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M20.5 14.2A9 9 0 0 1 9.8 3.5a9 9 0 1 0 10.7 10.7Z" />
    </Icon>
  );
}
function Icon({ size = 24, children, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}
export function Home(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m3 10 9-7 9 7v11H3z" />
      <path d="M9 21v-8h6v8" />
    </Icon>
  );
}
export function Building2(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="4" y="3" width="12" height="18" rx="1" />
      <path d="M16 10h5v11H4M8 7h1m3 0h1M8 11h1m3 0h1M8 15h1m3 0h1M9 21v-4h3v4" />
    </Icon>
  );
}
export function FolderOpen(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 8V5h7l2 3h9v3M2 19l3-8h17l-3 8Z" />
    </Icon>
  );
}
export function FileText(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 3h10l4 4v14H5zM15 3v5h4M8 12h8M8 16h8" />
    </Icon>
  );
}
export function Users(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6m1 5a5 5 0 0 1 4 5" />
    </Icon>
  );
}
export function Search(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 5 5" />
    </Icon>
  );
}
export function Bell(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 10h18c0-2-3-3-3-10M10 21h4" />
    </Icon>
  );
}
export function AlertCircle(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3 22 21H2Zm0 7v5m0 3h.01" />
    </Icon>
  );
}
export function Plus(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 4v16M4 12h16" />
    </Icon>
  );
}
export function ArrowRight(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 12h16m-6-6 6 6-6 6" />
    </Icon>
  );
}
export function ArrowLeft(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M20 12H4m6-6-6 6 6 6" />
    </Icon>
  );
}
export function ChevronRight(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m9 5 7 7-7 7" />
    </Icon>
  );
}
export function Mail(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="m3 7 9 6 9-6" />
    </Icon>
  );
}
export function Check(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m5 12 4 4L19 6" />
    </Icon>
  );
}
export function Download(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3v12m-4-4 4 4 4-4M4 17v4h16v-4" />
    </Icon>
  );
}
export function Package(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m3 7 9-4 9 4v10l-9 4-9-4Z" />
      <path d="m3 7 9 5 9-5M12 12v9M7 5l10 5" />
    </Icon>
  );
}
export function CheckCircle2(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m7 12 3 3 7-7" />
    </Icon>
  );
}
export function LockKeyhole(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="5" y="10" width="14" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
    </Icon>
  );
}
export function X(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </Icon>
  );
}

export function ChevronDown(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m6 9 6 6 6-6" />
    </Icon>
  );
}
export function Upload(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 16V3m-5 5 5-5 5 5M4 15v6h16v-6" />
    </Icon>
  );
}
export function Camera(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 7h4l2-3h6l2 3h4v14H3z" />
      <circle cx="12" cy="13" r="4" />
    </Icon>
  );
}
export function ImageIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <circle cx="8" cy="8" r="1" />
      <path d="m3 17 5-5 4 4 4-6 5 7" />
    </Icon>
  );
}
