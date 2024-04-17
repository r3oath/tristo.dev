import type {Metadata} from "next";
import {Fira_Code} from "next/font/google";
import "./globals.css";

type RootLayoutProperties = {
  children: React.ReactNode;
};

const firaCode = Fira_Code({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tristo.dev",
  description: "Hi, my name is Tristan.",
};

const RootLayout = ({children}: RootLayoutProperties) => {
  return (
    <html lang="en">
      <body className={firaCode.className}>
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
