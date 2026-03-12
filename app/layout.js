import "./globals.css";

export const metadata = {
  title: "TaskOrbit Board",
  description: "Trello-inspired board management application"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
