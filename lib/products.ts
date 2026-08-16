export type Product = {
  id: string;
  name: string;
  price: number;
  compareAt?: number;
  category: string;
  badge?: string;
  image: string;
};

export const products: Product[] = [
  {
    id: "aurora-lamp",
    name: "Aurora Cloud Night Lamp",
    price: 2499,
    compareAt: 3999,
    category: "Home",
    badge: "Trending",
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80",
  },
  {
    id: "wireless-earbuds",
    name: "Pulse X Wireless Earbuds",
    price: 3299,
    compareAt: 5499,
    category: "Tech",
    badge: "Bestseller",
    image:
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80",
  },
  {
    id: "mini-blender",
    name: "Whirl Mini Portable Blender",
    price: 1899,
    category: "Home",
    image:
      "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600&q=80",
  },
  {
    id: "phone-stand",
    name: "Orbit Adjustable Phone Stand",
    price: 899,
    compareAt: 1499,
    category: "Tech",
    image:
      "https://images.unsplash.com/photo-1583573636238-1f3a4173bb60?w=600&q=80",
  },
  {
    id: "canvas-tote",
    name: "Drift Canvas Tote Bag",
    price: 1299,
    category: "Fashion",
    badge: "New",
    image:
      "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600&q=80",
  },
  {
    id: "led-strip",
    name: "Glow Line RGB LED Strip",
    price: 1599,
    compareAt: 2299,
    category: "Home",
    image:
      "https://images.unsplash.com/photo-1558002038-1055907df827?w=600&q=80",
  },
  {
    id: "smart-watch",
    name: "Flux Fitness Smart Watch",
    price: 4599,
    compareAt: 6999,
    category: "Tech",
    badge: "Trending",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
  },
  {
    id: "sunglasses",
    name: "Horizon Polarized Sunglasses",
    price: 1799,
    category: "Fashion",
    image:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80",
  },
];

export const categories = [
  "New In",
  "Tech",
  "Home",
  "Fashion",
  "Under Rs 1500",
  "Trending Now",
  "Gift Ideas",
];
