import { useEffect, useRef } from "preact/hooks";

interface Props {
  total: number;
  remaining: number;
  cancelled: boolean;
}

function getCSSVar(el: Element, name: string): string {
  return getComputedStyle(el).getPropertyValue(name).trim() || "#888";
}

export function Countdown({ total, remaining, cancelled }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = 180;
  const lineWidth = 8;
  const radius = (size - lineWidth) / 2;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const progress = total > 0 ? remaining / total : 0;
    const angle = progress * 2 * Math.PI;

    // Resolve CSS custom properties
    const root = document.documentElement;
    const mutedBorder = getCSSVar(root, "--pico-muted-border-color");
    const secondaryBg = getCSSVar(root, "--pico-secondary-background");
    const primary = getCSSVar(root, "--pico-primary");
    const mutedColor = getCSSVar(root, "--pico-muted-color");
    const textColor = getCSSVar(root, "--pico-color");

    // Background circle
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = cancelled ? mutedBorder : secondaryBg;
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    // Progress arc
    if (remaining > 0 && !cancelled) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + angle);
      ctx.strokeStyle = primary;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.stroke();
    }

    // Text
    ctx.fillStyle = cancelled ? mutedColor : textColor;
    ctx.font = `bold 48px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const text = cancelled ? "—" : String(remaining);
    ctx.fillText(text, cx, cy);
  }, [total, remaining, cancelled]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        display: "block",
        margin: "0 auto",
        opacity: cancelled ? 0.5 : 1,
      }}
    />
  );
}
