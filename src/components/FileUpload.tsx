/*
 * FileUpload Component
 * 
 * A reusable drag-and-drop image upload component.
 * 
 * How it works:
 * 1. User drags an image onto the drop zone OR clicks to browse files
 * 2. Client-side validation: only accepts image/* files
 * 3. Shows a preview of the selected image immediately
 * 4. Uploads the file to /api/upload (which sends it to Cloudinary)
 * 5. Shows a spinner overlay during upload
 * 6. Calls onUpload(cloudinaryUrl) when done so the parent can use the URL
 * 
 * Props:
 * - onUpload: callback function that receives the Cloudinary URL after upload
 * 
 * Why client-side validation?
 * Server also validates (5MB limit, MIME type), but client-side checks
 * give instant feedback without making an unnecessary API call.
 */"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface FileUploadProps {
  onUpload: (url: string) => void;
}

export default function FileUpload({ onUpload }: FileUploadProps) {
  // State: preview URL for the selected image (local blob URL)
  const [preview, setPreview] = useState<string | null>(null);
  // State: whether a file is currently being uploaded to Cloudinary
  const [uploading, setUploading] = useState(false);
  // State: whether a file is being dragged over the drop zone (for visual feedback)
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle file selection (from drag-drop or file picker)
  // Creates a local preview URL and uploads to Cloudinary
  const handleFile = async (file: File) => {
    setUploading(true);
    setPreview(URL.createObjectURL(file));
    // Create FormData and send to our upload API endpoint
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      // Pass the Cloudinary URL back to the parent component
      if (data.url) onUpload(data.url);
      setUploading(false);
    } catch { setUploading(false); }
  };

  // Handle drag-and-drop: extract the first image file from the drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) handleFile(file);
  };

  // Clear the selected image and reset the upload state
  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onUpload("");
    if (inputRef.current) inputRef.current.value = "";
  };

  if (preview) {
    return (
      <div className="relative group">
        <img src={preview} alt="Preview" className="w-full h-56 object-cover rounded-2xl border border-emerald-950/10 shadow-sm" />
        {uploading && (
          <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <button onClick={clear} className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={"border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 " +
        (dragOver ? "border-emerald-400 bg-emerald-50" : "border-emerald-950/15 bg-[#fafbf8] hover:border-emerald-700/35 hover:bg-emerald-50/40")}
    >
      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
        <ImageIcon size={22} className="text-gray-400" />
      </div>
      <p className="text-sm font-medium text-gray-700">Drop a photo here, or click to browse</p>
      <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP up to 10MB</p>
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
    </div>
  );
}
