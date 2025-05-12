"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState, useMemo } from "react";

interface Product {
  _id: string;
  name: string;
  primaryImageUrl: string;
  price: number;
  shortDescription?: string;
  location?: string;
  isActive: boolean;
}

const TELEGRAM_BOT_TOKEN = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN || "";

const getTelegramImageUrl = async (fileId: string): Promise<string> => {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`
    );
    const data = await response.json();
    if (data.ok) {
      return `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${data.result.file_path}`;
    }
    throw new Error("Failed to fetch Telegram image URL");
  } catch {
    return "/fallback-image.jpg"; // Fallback image
  }
};

const ProductStorePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [priceFilter, setPriceFilter] = useState<number | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          "https://e-commerce-bot-1.onrender.com/api/products",
          {
            headers: { "Content-Type": "application/json" },
            cache: "no-store", // Prevent stale data
          }
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.statusText}`);
        }
        const data: Product[] = await response.json();

        const updatedProducts = await Promise.all(
          data.map(async (product) => {
            const primaryImageUrl = await getTelegramImageUrl(
              product.primaryImageUrl
            );
            return { ...product, primaryImageUrl };
          })
        );

        setProducts(updatedProducts.filter((p) => p.isActive)); // Show only active products
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to load products. Please try again later.");
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Memoized filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesPrice = priceFilter ? product.price <= priceFilter : true;
      return matchesSearch && matchesPrice;
    });
  }, [products, searchQuery, priceFilter]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-lg text-red-600 font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-800 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center">
            Discover Our Products
          </h1>
          <p className="text-center mt-2 text-indigo-200">
            Shop the best deals and unique finds
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search and Filter Section */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 text-black">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              className="border rounded-lg py-2 px-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              onChange={(e) =>
                setPriceFilter(e.target.value ? Number(e.target.value) : null)
              }
            >
              <option value="">All Prices</option>
              <option value="50">Up to Br 50</option>
              <option value="100">Up to Br 100</option>
              <option value="200">Up to Br 200</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">
              No products match your search criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="relative aspect-square">
                  <Image
                    src={product.primaryImageUrl}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    placeholder="blur"
                    blurDataURL="/placeholder-image.jpg"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-indigo-600 font-bold mt-1">
                    Br{" "}
                    {typeof product.price === "number"
                      ? product.price.toFixed(2)
                      : product.price}
                  </p>
                  {product.shortDescription && (
                    <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                      {product.shortDescription}
                    </p>
                  )}
                  {product.location && (
                    <p className="text-xs text-gray-500 mt-1">
                      📍 {product.location}
                    </p>
                  )}
                  <Link href={`/products/${product._id}`}>
                    <button
                      className={`w-full mt-4 py-2 rounded-lg text-white font-medium transition-colors ${
                        product.isActive
                          ? "bg-indigo-600 hover:bg-indigo-700"
                          : "bg-gray-300 cursor-not-allowed"
                      }`}
                      disabled={!product.isActive}
                      aria-label={`View details for ${product.name}`}
                    >
                      {product.isActive ? "View Details" : "Unavailable"}
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            © {new Date().getFullYear()} E-Commerce Store. All rights reserved.
          </p>
          <div className="mt-4 flex justify-center gap-4">
            <a href="#" className="hover:text-indigo-400">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-indigo-400">
              Terms of Service
            </a>
            <a href="#" className="hover:text-indigo-400">
              Contact Us
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProductStorePage;
