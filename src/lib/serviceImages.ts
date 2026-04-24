import hair from "@/assets/service-hair.jpg";
import nails from "@/assets/service-nails.jpg";
import makeup from "@/assets/service-makeup.jpg";
import esthetics from "@/assets/service-esthetics.jpg";
import brows from "@/assets/service-brows.jpg";

export const serviceImageByCategory: Record<string, string> = {
  cabelo: hair,
  unhas: nails,
  maquiagem: makeup,
  estetica: esthetics,
  sobrancelhas: brows,
};

import pro1 from "@/assets/pro-1.jpg";
import pro2 from "@/assets/pro-2.jpg";
import pro3 from "@/assets/pro-3.jpg";
import pro4 from "@/assets/pro-4.jpg";

export const proImages = [pro1, pro2, pro3, pro4];

export function professionalImage(image_url: string | null, index: number): string {
  if (image_url && image_url.startsWith("/src/assets/")) {
    const name = image_url.split("/").pop()!;
    const map: Record<string, string> = {
      "pro-1.jpg": pro1,
      "pro-2.jpg": pro2,
      "pro-3.jpg": pro3,
      "pro-4.jpg": pro4,
    };
    if (map[name]) return map[name];
  }
  return proImages[index % proImages.length];
}