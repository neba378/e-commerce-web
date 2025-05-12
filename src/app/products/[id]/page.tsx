"use client";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Product {
  _id: string;
  sellerId: string;
  name: string;
  primaryImageUrl: string;
  additionalImageUrls: string[];
  generalCategory: string;
  specificCategory: string;
  shortDescription: string;
  price: number;
  location: string;
  contactInfo: {
    phone: string;
  };
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

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        try {
          const response = await fetch(
            `https://e-commerce-bot-1.onrender.com/api/products/${id}`,
            {
              headers: { "Content-Type": "application/json" },
              cache: "no-store",
            }
          );
          if (!response.ok) {
            throw new Error(`Failed to fetch product: ${response.statusText}`);
          }
          const data: Product = await response.json();

          // Fetch Telegram image URLs
          const primaryImageUrl = await getTelegramImageUrl(
            data.primaryImageUrl
          );
          const additionalImageUrls = await Promise.all(
            data.additionalImageUrls.map((fileId: string) =>
              getTelegramImageUrl(fileId)
            )
          );

          setProduct(data);
          setImageUrls([primaryImageUrl, ...additionalImageUrls]);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching product:", error);
          setError("Failed to load product details. Please try again later.");
          setLoading(false);
        }
      };

      fetchProduct();
    }
  }, [id]);

  // Image carousel navigation
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % imageUrls.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + imageUrls.length) % imageUrls.length
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600"></div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-lg text-red-600 font-semibold">
          {error || "Product not found."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-800 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center">{product.name}</h1>
          <p className="text-center mt-2 text-indigo-200">
            Explore the details of this unique product
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Image Carousel */}
          <div className="relative">
            <div className="relative aspect-[4/3]">
              <Image
                src={imageUrls[currentImageIndex]}
                alt={`${product.name} - Image ${currentImageIndex + 1}`}
                fill
                className="object-cover rounded-t-xl"
                placeholder="blur"
                blurDataURL="/placeholder-image.jpg"
              />
            </div>
            {imageUrls.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition"
                  aria-label="Previous image"
                >
                  ←
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition"
                  aria-label="Next image"
                >
                  →
                </button>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {imageUrls.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentImageIndex
                          ? "bg-indigo-600"
                          : "bg-gray-400"
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Product Details */}
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  {product.name}
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {product.shortDescription}
                </p>
                <p className="text-2xl font-semibold text-indigo-600 mb-4">
                  Br{" "}
                  {typeof product.price === "number"
                    ? product.price.toFixed(2)
                    : product.price}
                </p>
                <div className="space-y-2">
                  <p className="text-gray-600">
                    <strong>Category:</strong> {product.generalCategory} -{" "}
                    {product.specificCategory}
                  </p>
                  <p className="text-gray-600">
                    <strong>Location:</strong> 📍 {product.location}
                  </p>
                  <p className="text-gray-600">
                    <strong>Contact:</strong>{" "}
                    <a
                      href={`tel:${product.contactInfo.phone}`}
                      className="text-indigo-600 hover:underline"
                    >
                      {product.contactInfo.phone}
                    </a>
                  </p>
                </div>
                <div className="mt-6 flex gap-4">
                  <a
                    href={`tel:${product.contactInfo.phone}`}
                    className="inline-block bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors"
                    aria-label={`Call seller at ${product.contactInfo.phone}`}
                  >
                    Contact Seller
                  </a>
                  <Link
                    href="/products"
                    className="inline-block bg-gray-300 text-gray-800 py-2 px-6 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Back to Products
                  </Link>
                </div>
              </div>
              {imageUrls.length > 1 && (
                <div className="md:w-1/3">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Additional Images
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {imageUrls.map((url, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className="relative aspect-square rounded-lg overflow-hidden"
                      >
                        <Image
                          src={url}
                          alt={`Thumbnail ${index + 1}`}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
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

export default ProductDetailPage;
