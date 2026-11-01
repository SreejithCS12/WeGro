import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    if (!code) {
      return NextResponse.json({ error: "Barcode is required" }, { status: 400 });
    }

    const cleanCode = code.trim().replace(/[^0-9a-zA-Z]/g, "");
    if (!cleanCode) {
      return NextResponse.json({ error: "Invalid barcode" }, { status: 400 });
    }

    // Query OpenFoodFacts API v2
    const offUrl = `https://world.openfoodfacts.org/api/v2/product/${cleanCode}.json`;
    const response = await fetch(offUrl, {
      headers: {
        "User-Agent": "WeGroFitness - Web/PWA - Version 1.0 (https://github.com/sreejith)",
        Accept: "application/json",
      },
      // Revalidate cache for 1 hour on server/edge
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `OpenFoodFacts responded with status ${response.status}`, status: 0 },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch from OpenFoodFacts", status: 0 },
      { status: 500 }
    );
  }
}
