export const MOTOR_SIZES: number[] = [0.33, 0.5, 0.75, 1, 1.5, 2, 3, 5, 7.5, 10, 15, 20, 25, 30, 40, 50];

export interface HorsepowerInput {
  conveyorLength: string;
  beltWidth: string;
  beltUnitWeight: string;
  loadPerFoot: string;
  speed: string;
  angle: string;
  friction: string;
  efficiency: string;
}

export interface HorsepowerResult {
  wb: string;
  wm: string;
  te: string;
  hpRaw: string;
  motor: number;
}

// Pure math for the Horsepower calculator.
export function calcHorsepower({
  conveyorLength,
  beltWidth,
  beltUnitWeight,
  loadPerFoot,
  speed,
  angle,
  friction,
  efficiency,
}: HorsepowerInput): HorsepowerResult | null {
  const L = parseFloat(conveyorLength); // ft
  const Wwidth = parseFloat(beltWidth); // in
  const Uw = parseFloat(beltUnitWeight); // lb/ft^2
  const Lf = parseFloat(loadPerFoot); // lb/ft
  const V = parseFloat(speed);
  const ang = parseFloat(angle);
  const Cf = parseFloat(friction);
  const eff = parseFloat(efficiency) / 100;
  if ([L, Wwidth, Uw, Lf, V, ang, Cf, eff].some((n) => isNaN(n)) || !eff) return null;

  const Wb = (Wwidth / 12) * L * Uw; // belt weight, lb
  const Wm = Lf * L; // total load on conveyor, lb

  const rad = (ang * Math.PI) / 180;
  const Te = Cf * (Wb + Wm) + Wm * Math.sin(rad); // lbs
  const hpRaw = (Te * V) / 33000 / eff;
  const nextMotor = MOTOR_SIZES.find((m) => m >= hpRaw) ?? MOTOR_SIZES[MOTOR_SIZES.length - 1];

  return {
    wb: Wb.toFixed(1),
    wm: Wm.toFixed(1),
    te: Te.toFixed(1),
    hpRaw: hpRaw.toFixed(2),
    motor: nextMotor,
  };
}
