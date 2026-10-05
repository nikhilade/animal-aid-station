import { useEffect, useState } from "react";
import { Building2, CheckCircle2, ChevronsUpDown } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { endpoints } from "@/lib/api/endpoints";
import { useAuth, authStore } from "@/lib/auth/store";

export function AdminHospitalSelector() {
  const { role, adminHospitalId } = useAuth();
  const [hospitals, setHospitals] = useState<{ id: string; name: string; hospitalStatus?: string }[]>([]);

  useEffect(() => {
    if (role === "SUPER_ADMIN") {
      apiClient.get<any[]>(endpoints.tenants.list).then((res: any) => {
        let arr: any[] = [];
        if (Array.isArray(res)) arr = res;
        else if (res && Array.isArray(res.data)) arr = res.data;
        else if (res && Array.isArray(res.content)) arr = res.content;
        else if (res && Array.isArray(res.items)) arr = res.items;

        const mapped = arr.map((t: any) => ({
          id: t.hospitalId || t.id,
          name: t.name || t.hospitalName || "Unnamed Hospital",
          hospitalStatus: t.hospitalStatus
        }));

        setHospitals(mapped);
        if (mapped.length > 0 && !authStore.get().adminHospitalId) {
          const firstActive = mapped.find(h => h.hospitalStatus !== 'PENDING');
          if (firstActive) {
            authStore.setAdminHospital(firstActive.id);
          }
        }
      }).catch(console.error);
    }
  }, [role]);

  if (role !== "SUPER_ADMIN" || hospitals.length === 0) return null;

  return (
    <div className="admin-panel mb-6 flex flex-col gap-3 rounded-lg border border-forest/20 bg-sage/45 px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-lg bg-forest text-primary-foreground shadow-sm"><Building2 className="size-5" /></span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Active hospital</p>
          <p className="mt-0.5 text-sm font-semibold text-forest">Viewing this hospital’s workspace</p>
        </div>
      </div>
      <div className="relative min-w-64">
        <select
          aria-label="Active hospital"
          className="h-11 w-full appearance-none rounded-lg border border-border bg-card pl-4 pr-10 text-sm font-semibold text-foreground outline-none transition-all hover:border-forest/40 focus:border-forest focus:ring-2 focus:ring-forest/10"
          value={adminHospitalId || ""}
          onChange={(e) => authStore.setAdminHospital(e.target.value)}
        >
          {hospitals.map(h => (
            <option key={h.id} value={h.id} disabled={h.hospitalStatus === 'PENDING'}>
              {h.name} {h.hospitalStatus === 'PENDING' ? '(Pending Verification)' : ''}
            </option>
          ))}
        </select>
        <ChevronsUpDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      </div>
      <span className="hidden items-center gap-1.5 text-xs font-semibold text-forest lg:flex"><CheckCircle2 className="size-4" /> Live context</span>
    </div>
  );
}
