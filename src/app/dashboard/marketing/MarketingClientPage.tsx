"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  Plus, 
  Trash2, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  Loader2, 
  AlertCircle,
  CheckCircle,
  Megaphone
} from "lucide-react";
import { 
  createMarketingBannerAction, 
  deleteMarketingBannerAction,
  type MarketingBanner 
} from "@/actions/marketing.action";

export default function MarketingClientPage({
  initialBanners,
}: {
  initialBanners: MarketingBanner[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Status states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Handle local image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  // Submit banner form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      setError("An image file is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    if (title.trim()) formData.append("title", title.trim());
    if (link.trim()) formData.append("link", link.trim());
    formData.append("image", imageFile);

    const result = await createMarketingBannerAction(formData);
    setIsSubmitting(false);

    if (result.success) {
      setSuccess("Marketing banner created successfully!");
      setTitle("");
      setLink("");
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      router.refresh();
    } else {
      setError(result.error || "Failed to create marketing banner.");
    }
  };

  // Delete banner
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this marketing banner?")) return;
    setDeletingId(id);
    setError(null);
    setSuccess(null);

    const result = await deleteMarketingBannerAction(id);
    setDeletingId(null);

    if (result.success) {
      setSuccess("Marketing banner deleted successfully!");
      router.refresh();
    } else {
      setError(result.error || "Failed to delete marketing banner.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      
      {/* Form Card */}
      <div className="lg:col-span-1 bg-[#13151e] border border-white/5 rounded-xl p-5 space-y-4">
        <h3 className="text-white text-base font-bold flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#0091e5]" />
          Add New Banner
        </h3>
        
        {error && (
          <div className="flex items-start gap-2.5 rounded-lg border border-rose-500/10 bg-rose-500/5 px-3.5 py-3 text-xs text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-2.5 rounded-lg border border-emerald-500/10 bg-emerald-500/5 px-3.5 py-3 text-xs text-emerald-400">
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload Area */}
          <div className="space-y-1.5">
            <label className="text-white/60 text-xs font-semibold uppercase tracking-wider">
              Banner Image <span className="text-rose-500">*</span>
            </label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`group relative flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-5 cursor-pointer transition-all duration-150 ${
                imagePreview 
                  ? "border-[#0091e5]/30 bg-[#0091e5]/5" 
                  : "border-white/10 hover:border-white/20 bg-white/5"
              }`}
            >
              {imagePreview ? (
                <div className="relative w-full aspect-[21/9] rounded-md overflow-hidden border border-white/10">
                  <Image 
                    src={imagePreview} 
                    alt="Preview" 
                    fill 
                    className="object-cover" 
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-white text-xs font-medium bg-black/60 px-2.5 py-1.5 rounded-md">
                      Change Image
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4 text-center">
                  <ImageIcon className="w-8 h-8 text-white/20 group-hover:text-white/40 mb-2 transition-colors" />
                  <p className="text-white/50 text-xs font-medium">
                    Click to select a banner image
                  </p>
                  <p className="text-white/20 text-[10px] mt-1">
                    PNG, JPG, or WEBP. Aspect ratio 8:3 recommended
                  </p>
                </div>
              )}
              <input 
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Banner Title */}
          <div className="space-y-1.5">
            <label className="text-white/60 text-xs font-semibold uppercase tracking-wider">
              Banner Title
            </label>
            <input
              type="text"
              placeholder="e.g. Summer Promo, Special Discount"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#0091e5] focus:ring-1 focus:ring-[#0091e5] transition-all"
            />
          </div>

          {/* Banner Link */}
          <div className="space-y-1.5">
            <label className="text-white/60 text-xs font-semibold uppercase tracking-wider">
              Redirect Link (URL)
            </label>
            <div className="relative flex items-center">
              <LinkIcon className="absolute left-3 w-4 h-4 text-white/30" />
              <input
                type="url"
                placeholder="https://example.com/promo"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#0091e5] focus:ring-1 focus:ring-[#0091e5] transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center rounded-lg bg-[#0091e5] hover:bg-[#0091e5]/90 active:bg-[#0091e5]/80 disabled:bg-[#0091e5]/50 transition-colors py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#0091e5]/10 mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading Banner...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-1.5" />
                Publish Banner
              </>
            )}
          </button>
        </form>
      </div>

      {/* Grid List */}
      <div className="lg:col-span-2 space-y-4">
        <h3 className="text-white text-base font-bold flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-[#0091e5]" />
          Active Banners ({initialBanners.length})
        </h3>

        {initialBanners.length === 0 ? (
          <div className="flex flex-col items-center justify-center border border-white/5 bg-[#13151e] rounded-xl py-12 text-center">
            <Megaphone className="w-8 h-8 text-white/10 mb-2" />
            <p className="text-white/40 text-sm font-medium">
              No active marketing banners
            </p>
            <p className="text-white/20 text-xs mt-0.5">
              Add a new banner on the left to display it on the app
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {initialBanners.map((banner) => (
              <div 
                key={banner.id}
                className="group relative flex flex-col bg-[#13151e] border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-colors"
              >
                {/* Banner Image Container */}
                <div className="relative w-full aspect-[21/9] border-b border-white/5 bg-white/5">
                  {banner.image_url ? (
                    <Image 
                      src={banner.image_url} 
                      alt={banner.title || "Banner"} 
                      fill 
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-white/15" />
                    </div>
                  )}
                  
                  {/* Delete Overlay Button */}
                  <div className="absolute top-2.5 right-2.5">
                    <button
                      onClick={() => handleDelete(banner.id)}
                      disabled={deletingId === banner.id}
                      className="p-1.5 rounded-lg bg-black/60 hover:bg-rose-600 border border-white/10 text-white hover:text-white transition-all shadow-md active:scale-95 disabled:pointer-events-none"
                      title="Delete banner"
                    >
                      {deletingId === banner.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Banner Details */}
                <div className="p-3.5 space-y-1">
                  <div className="font-semibold text-white text-sm truncate">
                    {banner.title || <span className="text-white/30 italic">No Title</span>}
                  </div>
                  {banner.link ? (
                    <a 
                      href={banner.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#0091e5] hover:underline truncate max-w-full font-medium"
                    >
                      <LinkIcon className="w-3 h-3 shrink-0" />
                      <span className="truncate">{banner.link}</span>
                    </a>
                  ) : (
                    <div className="text-[10px] text-white/20 font-medium uppercase tracking-wider">
                      Static Display Image
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
