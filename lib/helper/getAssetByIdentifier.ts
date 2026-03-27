import { PredefinedAsset } from "@/app/Types";
import { PREDEFINED_ASSETS } from "@/constants";

export function getAssetByIdentifier(
  identifier: string,
): PredefinedAsset | undefined {
  return PREDEFINED_ASSETS.find((a) => a.identifier === identifier);
}
