import type { Metadata } from "next";
import {Inter} from "next/font/google";
import { Toaster } from "@/components/ui/sonner"
import "./globals.css";

const inter = Inter({subsets: ["latin"]});

export const metadata: Metadata = {
  title: "Tristo.dev",
  description: "Hi, my name is Tristan.",
};

export default function RootLayout({children}: Readonly<{children: React.ReactNode;}>) {
	return (
		<html className="dark" lang="en">
			<body className={`${inter.className} antialiased bg-neutral-950`}>
				{children}
				<Toaster/>
			</body>
		</html>
	);
}
