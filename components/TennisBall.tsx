export default function TennisBall({
  size = 100,
  className = "ball",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden="true"
    >
      <circle className="skin" cx="50" cy="50" r="48" />
      <path className="seam" d="M16 16 C 42 38, 42 62, 16 84" />
      <path className="seam" d="M84 16 C 58 38, 58 62, 84 84" />
    </svg>
  );
}
