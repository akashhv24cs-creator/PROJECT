import { useScrollReveal } from "../../hooks/useScrollReveal";

/**
 * Reusable ScrollReveal wrapper component
 * 
 * Props:
 * - as: HTML tag (default: 'div')
 * - variant: 'up' | 'scale' (default: 'up')
 * - delay: 0 | 100 | 150 | 200 | 300 | 400 (default: 0)
 * - className: string
 * - children: ReactNode
 */
export default function ScrollReveal({
  as: Component = "div",
  variant = "up",
  delay = 0,
  className = "",
  children,
  ...props
}) {
  const ref = useScrollReveal();

  const variantClass = variant === "scale" ? "scroll-reveal-scale" : "scroll-reveal";
  const delayClass =
    delay === 100
      ? "reveal-delay-100"
      : delay === 150
      ? "reveal-delay-150"
      : delay === 200
      ? "reveal-delay-200"
      : delay === 300
      ? "reveal-delay-300"
      : delay === 400
      ? "reveal-delay-400"
      : "";

  return (
    <Component
      ref={ref}
      className={`${variantClass} ${delayClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </Component>
  );
}
