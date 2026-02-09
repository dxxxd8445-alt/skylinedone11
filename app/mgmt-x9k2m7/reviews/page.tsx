import { AdminLayout } from "@/components/admin/admin-layout";
import { ReviewsManagement } from "@/components/admin/reviews-management";
import { getAllReviews } from "@/lib/supabase/data";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const reviews = await getAllReviews();

  return (
    <AdminLayout title="Reviews Management" subtitle="Approve or deny customer reviews">
      <ReviewsManagement initialReviews={reviews} />
    </AdminLayout>
  );
}
