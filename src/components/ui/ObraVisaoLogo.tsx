interface ObraVisaoLogoProps {
  size?: number
}

export default function ObraVisaoLogo({ size = 32 }: ObraVisaoLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      aria-label="ObraVisão"
    >
      <rect width="64" height="64" rx="14" fill="#0F172A" />
      <text
        x="50%"
        y="54%"
        textAnchor="middle"
        fontSize="26"
        fontFamily="Arial, sans-serif"
        fontWeight="700"
        fill="#FFFFFF"
        dominantBaseline="middle"
      >
        OV
      </text>
      <circle cx="50" cy="14" r="5" fill="#22C55E" />
    </svg>
  )
}
