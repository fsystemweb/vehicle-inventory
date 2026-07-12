export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm rounded-lg border border-line bg-background p-8">
        {children}
      </div>
    </main>
  );
}
