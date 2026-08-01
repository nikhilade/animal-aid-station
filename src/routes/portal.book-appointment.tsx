import { createFileRoute } from "@tanstack/react-router";
import { PortalLayout } from "@/components/app/PortalLayout";
import { Panel } from "@/components/app/ui";
import { BookingForm } from "@/components/app/BookingForm";

export const Route = createFileRoute("/portal/book-appointment")({
  head: () => ({
    meta: [
      { title: "Book an Appointment | Pet Good Owner Portal" },
      { name: "description", content: "Schedule a visit for your pet with your preferred doctor and time." },
      { property: "og:title", content: "Book an Appointment | Pet Good Owner Portal" },
      { property: "og:description", content: "Schedule your next visit in under a minute." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PortalBooking,
});

function PortalBooking() {
  return (
    <PortalLayout title="Book Appointment">
      <Panel>
        <BookingForm />
      </Panel>
    </PortalLayout>
  );
}
