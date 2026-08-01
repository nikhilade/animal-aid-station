import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { endpoints } from "@/lib/api/endpoints";
import type { AppointmentSlot } from "@/lib/api/types";

export interface SlotPickerProps {
  branchId?: string;
  doctorId: string;
  date: string; // yyyy-mm-dd
  onDateChange?: (date: string) => void;
  value?: string | null; // ISO start_at
  onChange?: (startAt: string) => void;
  /** Hide the built-in date input when the parent owns date state. */
  showDateInput?: boolean;
}

/** Available-slot grid, shared by the staff booking flow and the owner portal. */
export function SlotPicker({
  branchId = "br_1",
  doctorId,
  date,
  onDateChange,
  value = null,
  onChange,
  showDateInput = true,
}: SlotPickerProps) {
  const [slots, setSlots] = useState<AppointmentSlot[] | null>(null);

  useEffect(() => {
    let active = true;
    setSlots(null);
    apiClient
      .get<AppointmentSlot[]>(endpoints.appointments.availableSlots, {
        branch_id: branchId,
        doctor_id: doctorId,
        date,
      })
      .then((s) => active && setSlots(s))
      .catch(() => active && setSlots([]));
    return () => {
      active = false;
    };
  }, [branchId, doctorId, date]);

  return (
    <div className="space-y-3">
      {showDateInput ? (
        <div>
          <label className="mb-1.5 block text-xs font-medium text-foreground/60">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange?.(e.target.value)}
            className="rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-forest"
          />
        </div>
      ) : null}

      {!slots ? (
        <p className="flex items-center gap-2 py-4 text-sm text-foreground/60">
          <Loader2 className="size-4 animate-spin" /> Loading slots…
        </p>
      ) : slots.length === 0 ? (
        <p className="rounded-2xl bg-muted px-4 py-6 text-center text-sm text-foreground/60">No slots for this day.</p>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {slots.map((s) => {
            const label = new Date(s.start_at).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
            const selected = value === s.start_at;
            return (
              <button
                key={s.start_at}
                type="button"
                disabled={!s.available}
                onClick={() => onChange?.(s.start_at)}
                className={`rounded-full border px-2 py-2 text-xs font-medium transition ${
                  selected
                    ? "border-forest bg-forest text-primary-foreground"
                    : s.available
                      ? "border-border bg-background hover:border-forest"
                      : "cursor-not-allowed border-border bg-muted text-foreground/35 line-through"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
      <p className="text-xs text-foreground/50">Struck-through slots are already booked.</p>
    </div>
  );
}
