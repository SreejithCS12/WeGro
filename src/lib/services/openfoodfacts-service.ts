import { Food } from "@/types/database";

export interface OpenFoodFactsProductResponse {
  code: string;
  status: number;
  status_verbose?: string;
  product?: {
    code?: string;
    product_name?: string;
    product_name_en?: string;
    generic_name?: string;
    brands?: string;
    categories?: string;
    serving_size?: string;
    serving_quantity?: number | string;
    image_url?: string;
    image_front_small_url?: string;
    nutriments?: Record<string, any>;
  };
}

/**
 * Extracts household unit and serving gram weight from OpenFoodFacts serving string
 * Examples: "1 bar (45 g)", "2 biscuits (25g)", "1 scoop (32 g)", "50g"
 */
function parseServingDetails(
  servingStr?: string,
  servingQty?: number | string
): { unit: string | null; grams: number | null } {
  let grams: number | null = null;

  if (typeof servingQty === "number" && servingQty > 0) {
    grams = Math.round(servingQty);
  } else if (typeof servingQty === "string" && !isNaN(parseFloat(servingQty))) {
    grams = Math.round(parseFloat(servingQty));
  }

  let unit: string | null = null;

  if (servingStr && servingStr.trim().length > 0) {
    // If grams was not found from servingQty, check regex in serving string
    if (!grams) {
      const gMatch = servingStr.match(/(\d+(?:\.\d+)?)\s*(?:g|gram|grams)\b/i);
      if (gMatch) {
        grams = Math.round(parseFloat(gMatch[1]));
      }
    }

    // Clean up unit name (e.g. remove parenthesis and numbers like (45g))
    const cleanUnit = servingStr
      .replace(/\(?\d+(?:\.\d+)?\s*(?:g|gram|grams|ml)\)?/gi, "")
      .replace(/[(),]/g, "")
      .trim();

    if (cleanUnit.length >= 2) {
      unit = cleanUnit;
    } else if (grams && grams !== 100) {
      unit = "1 serving";
    }
  }

  return { unit, grams };
}

/**
 * Converts OpenFoodFacts product payload into WeGro Food entity
 */
export function mapOpenFoodFactsToFood(
  product: NonNullable<OpenFoodFactsProductResponse["product"]>,
  barcode: string
): Food {
  const nutriments = product.nutriments || {};

  // Extract raw Name & Brand
  const rawName =
    product.product_name ||
    product.product_name_en ||
    product.generic_name ||
    "Packaged Food Item";

  const brand = product.brands?.trim();
  const displayName =
    brand && !rawName.toLowerCase().includes(brand.toLowerCase())
      ? `${rawName} (${brand})`
      : rawName;

  // Extract Serving Information
  const { unit: householdUnit, grams: householdGrams } = parseServingDetails(
    product.serving_size,
    product.serving_quantity
  );

  // Parse Calories per 100g
  let calories =
    nutriments["energy-kcal_100g"] ??
    nutriments["energy-kcal"] ??
    nutriments["energy-kcal_value"];

  if (calories === undefined || calories === null) {
    // Check energy in kJ if kcal not present (1 kcal = 4.184 kJ)
    const energyKj = nutriments["energy_100g"] ?? nutriments["energy"];
    if (energyKj) {
      calories = Math.round(Number(energyKj) / 4.184);
    } else if (nutriments["energy-kcal_serving"] && householdGrams && householdGrams > 0) {
      // Calculate 100g value from serving
      calories = Math.round((Number(nutriments["energy-kcal_serving"]) * 100) / householdGrams);
    } else {
      calories = 0;
    }
  } else {
    calories = Math.round(Number(calories));
  }

  // Parse Protein per 100g
  let protein =
    nutriments["proteins_100g"] ??
    nutriments["proteins"] ??
    nutriments["proteins_value"] ??
    0;
  if (!protein && nutriments["proteins_serving"] && householdGrams && householdGrams > 0) {
    protein = (Number(nutriments["proteins_serving"]) * 100) / householdGrams;
  }
  protein = Number(Number(protein).toFixed(1));

  // Parse Carbs per 100g
  let carbs =
    nutriments["carbohydrates_100g"] ??
    nutriments["carbohydrates"] ??
    nutriments["carbohydrates_value"] ??
    0;
  if (!carbs && nutriments["carbohydrates_serving"] && householdGrams && householdGrams > 0) {
    carbs = (Number(nutriments["carbohydrates_serving"]) * 100) / householdGrams;
  }
  carbs = Number(Number(carbs).toFixed(1));

  // Parse Fat per 100g
  let fat =
    nutriments["fat_100g"] ??
    nutriments["fat"] ??
    nutriments["fat_value"] ??
    0;
  if (!fat && nutriments["fat_serving"] && householdGrams && householdGrams > 0) {
    fat = (Number(nutriments["fat_serving"]) * 100) / householdGrams;
  }
  fat = Number(Number(fat).toFixed(1));

  const servingDesc =
    product.serving_size?.trim() ||
    (householdUnit && householdGrams ? `1 ${householdUnit} (${householdGrams}g)` : "100g");

  return {
    id: `barcode_${barcode}`,
    name: displayName,
    category: "Packaged Food",
    serving_description: servingDesc,
    reference_quantity: 100,
    reference_unit: "g",
    calories: Math.max(0, calories),
    protein: Math.max(0, protein),
    carbohydrates: Math.max(0, carbs),
    fat: Math.max(0, fat),
    household_unit: householdUnit || (householdGrams ? "1 serving" : null),
    household_grams: householdGrams || null,
    notes: `Barcode: ${barcode}${brand ? ` · Brand: ${brand}` : ""}`,
    created_at: new Date().toISOString(),
  };
}

/**
 * Fetches product data by barcode from OpenFoodFacts (via internal API proxy with client fallback)
 */
export async function fetchProductByBarcode(barcode: string): Promise<Food | null> {
  const cleanCode = barcode.trim().replace(/[^0-9a-zA-Z]/g, "");
  if (!cleanCode) return null;

  // 1. Try our Next.js API proxy route first (cached on edge & sets required User-Agent)
  try {
    const res = await fetch(`/api/barcode/${cleanCode}`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (res.ok) {
      const data: OpenFoodFactsProductResponse = await res.json();
      if (data.status === 1 && data.product) {
        return mapOpenFoodFactsToFood(data.product, cleanCode);
      }
    }
  } catch {
    // API route fetch failed, proceed to direct client fallback
  }

  // 2. Client-side direct fallback to OpenFoodFacts v2
  try {
    const directRes = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${cleanCode}.json`,
      {
        method: "GET",
        headers: { Accept: "application/json" },
      }
    );

    if (directRes.ok) {
      const data: OpenFoodFactsProductResponse = await directRes.json();
      if (data.status === 1 && data.product) {
        return mapOpenFoodFactsToFood(data.product, cleanCode);
      }
    }
  } catch {
    // Direct network query failed
  }

  return null;
}
