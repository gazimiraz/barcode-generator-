export interface Settings {
  siteName: string;
  siteTitle: string;
  siteDescription: string;
  googleAnalyticsId: string;
  googleSearchConsoleVerification: string;
  clarityId: string;
  headerAdCode: string;
  sidebarAdCode: string;
  contentAdCode: string;
  resultAdCode: string;
  footerAdCode: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  views: number;
  publishedAt: string;
}

export interface DayStat {
  date: string;
  visitors: number;
  qr: number;
  barcode: number;
  adClicks: number;
}

export interface Stats {
  visitors: number;
  qrGenerated: number;
  barcodeGenerated: number;
  adClicks: number;
  dailyStats: DayStat[];
}

export type QRType =
  | "url"
  | "text"
  | "email"
  | "phone"
  | "sms"
  | "whatsapp"
  | "wifi"
  | "vcard"
  | "location"
  | "event"
  | "social";

export type BarcodeType =
  | "CODE128"
  | "CODE39"
  | "EAN13"
  | "EAN8"
  | "UPCA"
  | "UPCE"
  | "ITF"
  | "CODABAR";
