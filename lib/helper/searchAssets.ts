import { PredefinedAsset } from "@/app/Types";
import { PREDEFINED_ASSETS } from "@/constants";

export function searchAssets(query: string): PredefinedAsset[] {
  const q = query.toLowerCase().trim();
  if (!q) return PREDEFINED_ASSETS;
  return PREDEFINED_ASSETS.filter(
    (a) =>
      a.label.toLowerCase().includes(q) ||
      a.identifier.toLowerCase().includes(q) ||
      a.exchange?.toLowerCase().includes(q),
  );
}
