import Sidebar from "@/app/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "var(--bg-base)",
      }}
    >
      <Sidebar />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            background: "var(--bg-base)",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
