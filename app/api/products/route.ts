import { NextResponse } from "next/server";
import { getProducts } from "@/lib/supabase/data";

export async function GET() {
  try {
    const products = await getProducts();
    
    // Transform products to include only necessary data for notifications
    const transformedProducts = products.map((product) => ({
      name: product.name,
      image: product.image,
      slug: product.slug,
    }));
    
    return NextResponse.json({ products: transformedProducts });
  } catch (error) {
    console.error("[Products API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
