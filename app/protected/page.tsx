import { DashboardLayout } from "@/components/dashboard";

export default function Dashboard() {
  return (
    <>
      <main className="min-h-screen flex flex-col items-center" dir="rtl">
        <div className="flex-1 w-full flex flex-col gap-8 items-center">
          <DashboardLayout />
        </div>
      </main>
    </>
  );
}
