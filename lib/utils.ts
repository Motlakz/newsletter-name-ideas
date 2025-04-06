import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const generateParticles = (count: number) => {
  // Generate particles with seeded random numbers or predetermined values
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    size: 4 + (i % 8), // Deterministic size between 4-12px
    x: `${(i * 5) % 100}%`, // Distribute evenly across width
    y: `${(i * 7) % 100}%`, // Distribute evenly across height
  }));
};
