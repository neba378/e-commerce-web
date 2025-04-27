"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

interface Product {
  id: string;
  name: string;
  primaryImageUrl: string;
  price: number;
  shortDescription?: string;
  location?: string;
  isActive: boolean;
}

const ProductStorePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/products", {
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.statusText}`);
        }
        const data: Product[] = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to load products. Please try again later.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg font-semibold">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-red-500">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">No products available.</p>
      </div>
    );
  }

  return (
    <div className="product-store container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Our Products</h1>
      <div className="product-list grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="product-card border rounded-lg shadow-md p-4 hover:shadow-lg transition"
          >
            <Image
              src={
                product.primaryImageUrl.startsWith("http")
                  ? product.primaryImageUrl
                  : `/${product.primaryImageUrl}`
              }
              alt={product.name}
              className="product-image rounded-md object-cover"
              width={200}
              height={200}
              placeholder="blur"
              blurDataURL="/placeholder-image.jpg" // Replace with a low-res placeholder
            />
            <h2 className="product-name text-xl font-semibold mt-4">
              {product.name}
            </h2>
            <p className="product-price text-lg text-green-600">
              Br {product.price.toFixed(2)}
            </p>
            {product.shortDescription && (
              <p className="product-description text-gray-600 mt-2">
                {product.shortDescription}
              </p>
            )}
            {product.location && (
              <p className="product-location text-sm text-gray-500 mt-1">
                Location: {product.location}
              </p>
            )}
            <Link href={`/products/${product.id}`}>
              <button
                className={`product-button w-full mt-4 py-2 rounded-md text-white ${
                  product.isActive
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
                disabled={!product.isActive}
              >
                {product.isActive ? "View Details" : "Unavailable"}
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductStorePage;
