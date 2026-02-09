import { AdminLayout } from "@/components/admin/admin-layout";
import { ReviewsManagement } from "@/components/admin/reviews-management";
import { getAllReviews } from "@/lib/supabase/data";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  let reviews = [];
  
  try {
    reviews = await getAllReviews();
    console.log('[Admin Reviews Page] Fetched reviews:', reviews.length);
  } catch (error) {
    console.error('[Admin Reviews Page] Error fetching reviews:', error);
  }

  return (
    <AdminLayout title="Reviews Management" subtitle="Approve or deny customer reviews">
      <ReviewsManagement initialReviews={reviews} />
    </AdminLayout>
  );
}
