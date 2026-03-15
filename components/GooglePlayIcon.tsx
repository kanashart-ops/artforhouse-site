type GooglePlayIconProps = {
  className?: string;
};

export default function GooglePlayIcon({
  className = "h-5 w-5",
}: GooglePlayIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M4.8 3.2L13.9 12 4.8 20.8a1.8 1.8 0 0 1-.5-1.2V4.4c0-.45.18-.88.5-1.2Z" fill="#00C853" />
      <path d="M15.3 13.4 7.2 21.2l7.54-4.28c1.24-.7 1.24-2.48 0-3.18l-.44-.34Z" fill="#FFAB00" />
      <path d="M15.3 10.6 7.2 2.8l7.54 4.28c1.24.7 1.24 2.48 0 3.18l-.44.34Z" fill="#EA4335" />
      <path d="m7.2 2.8 8.1 7.8 2.1 1.4c.9.6.9 1.92 0 2.52l-2.1 1.4-8.1 7.8 11.8-6.7c1.34-.76 1.34-2.68 0-3.44L7.2 2.8Z" fill="#4285F4" />
    </svg>
  );
}
