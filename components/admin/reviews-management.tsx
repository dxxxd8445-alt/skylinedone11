"use client";

import { useState } from "react";
import { Star, Check, X, Trash2, Search, Filter, Calendar, User, MessageSquare, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { approveReview, deleteReview } from "@/lib/supabase/data";
import { useToast } from "@/hooks/use-toast";

interface Review {
  id: string;
  username: string;
  avatar?: string;
  rating: number;
  text: string;
  image_url?: string;
  is_approved: boolean;
  created_at: string;
}

interface ReviewsManagementProps {
  initialReviews: Review[];
}

export function ReviewsManagement({ initialReviews }: ReviewsManagementProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const { toast } = useToast();

  const handleApprove = async (reviewId: string) => {
    setIsProcessing(reviewId);
    try {
      const updated = await approveReview(reviewId);
      if (updated) {
        setReviews(reviews.map(r => r.id === reviewId ? { ...r, is_approved: true } : r));
        toast({
          title: "Review Approved",
          description: "The review is now visible to customers.",
        });
      } else {
        throw new Error("Failed to approve");
      }
    } catch (error) {
      console.error("Error approving review:", error);
      toast({
        title: "Error",
        description: "Failed to approve review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review? This action cannot be undone.")) {
      return;
    }

    setIsProcessing(reviewId);
    try {
      const success = await deleteReview(reviewId);
      if (success) {
        setReviews(reviews.filter(r => r.id !== reviewId));
        toast({
          title: "Review Deleted",
          description: "The review has been permanently removed.",
        });
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast({
        title: "Error",
        description: "Failed to delete review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(null);
    }
  };

  // Filter reviews
  const filteredReviews = reviews.filter(review => {
    const matchesFilter = 
      filter === "all" ? true :
      filter === "pending" ? !review.is_approved :
      review.is_approved;

    const matchesSearch = 
      searchQuery === "" ||
      review.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.text.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const pendingCount = reviews.filter(r => !r.is_approved).length;
  const approvedCount = reviews.filter(r => r.is_approved).length;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Reviews Management</h1>
        <p className="text-white/60">
          Approve or deny customer reviews before they appear on your site
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#111111] border border-[#262626] rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm mb-1">Total Reviews</p>
              <p className="text-3xl font-bold text-white">{reviews.length}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gray-500/10 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="bg-[#111111] border border-[#262626] rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm mb-1">Pending Approval</p>
              <p className="text-3xl font-bold text-yellow-400">{pendingCount}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
              <Filter className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-[#111111] border border-[#262626] rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm mb-1">Approved</p>
              <p className="text-3xl font-bold text-green-400">{approvedCount}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <Check className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#111111] border border-[#262626] rounded-xl p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by username or review text..."
                className="w-full pl-10 pr-4 py-3 bg-[#0a0a0a] border border-[#262626] rounded-lg text-white placeholder:text-white/40 focus:border-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#6b7280]/20"
              />
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                filter === "all"
                  ? "bg-[#6b7280] text-white"
                  : "bg-[#0a0a0a] border border-[#262626] text-white/60 hover:text-white hover:border-[#6b7280]/30"
              }`}
            >
              All ({reviews.length})
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                filter === "pending"
                  ? "bg-yellow-500 text-black"
                  : "bg-[#0a0a0a] border border-[#262626] text-white/60 hover:text-white hover:border-yellow-500/30"
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilter("approved")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                filter === "approved"
                  ? "bg-green-500 text-black"
                  : "bg-[#0a0a0a] border border-[#262626] text-white/60 hover:text-white hover:border-green-500/30"
              }`}
            >
              Approved ({approvedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="bg-[#111111] border border-[#262626] rounded-xl p-12 text-center">
            <MessageSquare className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Reviews Found</h3>
            <p className="text-white/60">
              {filter === "pending" 
                ? "No reviews are waiting for approval."
                : filter === "approved"
                ? "No reviews have been approved yet."
                : "No reviews match your search criteria."}
            </p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div
              key={review.id}
              className={`bg-[#111111] border rounded-xl p-6 transition-all ${
                review.is_approved 
                  ? "border-green-500/30" 
                  : "border-yellow-500/30"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Review Content */}
                <div className="flex-1 space-y-4">
                  {/* Header */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6b7280] to-[#9ca3af] flex items-center justify-center text-white text-lg font-bold">
                      {review.avatar || review.username[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-white font-semibold">{review.username}</h3>
                        {review.is_approved ? (
                          <span className="px-2 py-1 bg-green-500/20 border border-green-500/30 rounded text-green-400 text-xs font-semibold">
                            APPROVED
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded text-yellow-400 text-xs font-semibold">
                            PENDING
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-white/40 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(review.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < review.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-white/20"
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-white/60 text-sm">
                      {review.rating}/5
                    </span>
                  </div>

                  {/* Review Text */}
                  <p className="text-white/80 leading-relaxed">
                    "{review.text}"
                  </p>

                  {/* Image */}
                  {review.image_url && (
                    <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden border border-[#262626]">
                      <Image
                        src={review.image_url}
                        alt="Review attachment"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  {!review.is_approved && (
                    <button
                      onClick={() => handleApprove(review.id)}
                      disabled={isProcessing === review.id}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white rounded-lg font-semibold transition-all flex items-center gap-2 whitespace-nowrap"
                    >
                      <Check className="w-4 h-4" />
                      Approve
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(review.id)}
                    disabled={isProcessing === review.id}
                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 disabled:bg-red-500/5 border border-red-500/30 text-red-400 rounded-lg font-semibold transition-all flex items-center gap-2 whitespace-nowrap"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
