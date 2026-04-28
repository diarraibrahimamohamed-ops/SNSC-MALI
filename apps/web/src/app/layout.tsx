import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vaccin-Track",
  description: "Système de suivi de vaccination",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            color: #333;
          }
          
          /* Classes utilitaires Tailwind-like */
          .min-h-screen { min-height: 100vh; }
          .bg-gradient-to-br { background: linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to)); }
          .from-emerald-50 { --tw-gradient-from: #ecfdf5; }
          .to-teal-100 { --tw-gradient-to: #ccfbf1; }
          .flex { display: flex; }
          .items-center { align-items: center; }
          .justify-center { justify-content: center; }
          .py-12 { padding-top: 3rem; padding-bottom: 3rem; }
          .px-4 { padding-left: 1rem; padding-right: 1rem; }
          .sm\\:px-6 { @media (min-width: 640px) { padding-left: 1.5rem; padding-right: 1.5rem; } }
          .lg\\:px-8 { @media (min-width: 1024px) { padding-left: 2rem; padding-right: 2rem; } }
          .max-w-md { max-width: 28rem; }
          .w-full { width: 100%; }
          .space-y-8 > * + * { margin-top: 2rem; }
          .text-center { text-align: center; }
          .mx-auto { margin-left: auto; margin-right: auto; }
          .h-16 { height: 4rem; }
          .w-16 { width: 4rem; }
          .bg-gradient-to-r { background: linear-gradient(90deg, var(--tw-gradient-from), var(--tw-gradient-to)); }
          .from-emerald-500 { --tw-gradient-from: #10b981; }
          .to-teal-600 { --tw-gradient-to: #14b8a6; }
          .rounded-full { border-radius: 50%; }
          .mb-4 { margin-bottom: 1rem; }
          .text-2xl { font-size: 1.5rem; line-height: 2rem; }
          .text-white { color: white; }
          .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
          .font-bold { font-weight: 700; }
          .text-gray-900 { color: #111827; }
          .mt-2 { margin-top: 0.5rem; }
          .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
          .text-gray-600 { color: #4b5563; }
          .bg-white { background-color: white; }
          .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
          .rounded-2xl { border-radius: 1rem; }
          .p-8 { padding: 2rem; }
          .space-y-6 > * + * { margin-top: 1.5rem; }
          .block { display: block; }
          .text-gray-700 { color: #374151; }
          .font-medium { font-weight: 500; }
          .mb-2 { margin-bottom: 0.5rem; }
          .relative { position: relative; }
          .border { border-width: 1px; }
          .border-gray-300 { border-color: #d1d5db; }
          .placeholder-gray-500::placeholder { color: #6b7280; }
          .rounded-lg { border-radius: 0.5rem; }
          .focus\\:outline-none:focus { outline: 2px solid transparent; outline-offset: 2px; }
          .focus\\:ring-emerald-500:focus { --tw-ring-color: #10b981; }
          .focus\\:border-emerald-500:focus { border-color: #10b981; }
          .sm\\:text-sm { @media (min-width: 640px) { font-size: 0.875rem; line-height: 1.25rem; } }
          .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
          .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
          .text-gray-900 { color: #111827; }
          .justify-between { justify-content: space-between; }
          .h-4 { height: 1rem; }
          .w-4 { width: 1rem; }
          .text-emerald-600 { color: #059669; }
          .focus\\:ring-emerald-500:focus { --tw-ring-color: #10b981; }
          .rounded { border-radius: 0.25rem; }
          .ml-2 { margin-left: 0.5rem; }
          .hover\\:text-emerald-500:hover { color: #10b981; }
          .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
          .group { position: relative; }
          .border-transparent { border-color: transparent; }
          .transition-all { transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
          .duration-200 { transition-duration: 200ms; }
          .disabled\\:opacity-50:disabled { opacity: 0.5; }
          .animate-spin { animation: spin 1s linear infinite; }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          .h-5 { height: 1.25rem; }
          .w-5 { width: 1.25rem; }
          .absolute { position: absolute; }
          .left-0 { left: 0; }
          .inset-y-0 { top: 0; bottom: 0; }
          .pl-3 { padding-left: 0.75rem; }
          .w-full { width: 100%; }
          .justify-center { justify-content: center; }
          .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
          .px-4 { padding-left: 1rem; padding-right: 1rem; }
          .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
          .font-medium { font-weight: 500; }
          .rounded-lg { border-radius: 0.5rem; }
          .text-white { color: white; }
          .hover\\:from-emerald-600:hover { --tw-gradient-from: #059669; }
          .hover\\:to-teal-700:hover { --tw-gradient-to: #0f766e; }
          .focus\\:outline-none:focus { outline: 2px solid transparent; outline-offset: 2px; }
          .focus\\:ring-2:focus { --tw-ring-width: 2px; }
          .focus\\:ring-offset-2:focus { --tw-ring-offset-width: 2px; }
          .focus\\:ring-emerald-500:focus { --tw-ring-color: #10b981; }
          .mt-6 { margin-top: 1.5rem; }
          .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
          .border-t { border-top-width: 1px; }
          .border-gray-300 { border-color: #d1d5db; }
          .relative { position: relative; }
          .flex { display: flex; }
          .justify-center { justify-content: center; }
          .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
          .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
          .bg-white { background-color: white; }
          .text-gray-500 { color: #6b7280; }
          .text-center { text-align: center; }
          .text-gray-600 { color: #4b5563; }
          .font-medium { font-weight: 500; }
          .text-emerald-600 { color: #059669; }
          .hover\\:text-emerald-500:hover { color: #10b981; }
          .text-xs { font-size: 0.75rem; line-height: 1rem; }
          .text-gray-500 { color: #6b7280; }
        `}</style>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
