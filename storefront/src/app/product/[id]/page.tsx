import React from "react";
import ClientPage from "./ClientPage";

export async function generateStaticParams() {
  try {
    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "https://udyofflive1111111111.onrender.com").replace(/\/$/, "");
    const res = await fetch(`${apiUrl}/api/products`).catch(() => null);
    if (res && res.ok) {
      const products = await res.json();
      if (Array.isArray(products)) {
        return products.map((p: any) => ({
          id: String(p.id),
        }));
      }
    }
  } catch (e) {
    // ignore
  }
  return [{ id: "1" }];
}

export default function Page({ params }: { params: { id: string } }) {
  return <ClientPage />;
}
