"use client";

import { useState, useRef } from "react";
import { Upload, X, Image, Video } from "lucide-react";

interface FileUploadProps {
  onUpload: (url: string) => void;
}

export default function FileUpload({ onUpload }: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    // Show preview
    const url = URL.createObjectURL(file);
    setPreview(url);

    // Upload to Cloudinary
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.url) {
        onUpload(data.url);
      }
    } catch {
      alert("Upload failed");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type.startsWith("image/") || file.type.startsWith("video/"))) {
      handleFile(file);
    }
  };

  const clearPreview = () => {
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  if (preview) {
    return (
      <div className="relative">
        {preview.includes("video") ? (
          <video src={preview} className="w-full h-64 object-cover rounded-xl" controls />
        ) : (
          <img src={preview} alt="Preview" className="w-full h-64 object-cover rounded-xl" />
        )}
        <button
          onClick={clearPreview}
          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
        >
          <X size={16} />
        </button>
        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
            <div className="text-white font-medium">Uploading...</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => fileRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
        dragOver ? "border-green-500 bg-green-50" : "border-gray-300 hover:border-green-400"
      }`}
    >
      <input
        ref={fileRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <Upload className="mx-auto text-gray-400 mb-3" size={40} />
      <p className="text-gray-600 font-medium">Drop your photo or video here</p>
      <p className="text-gray-400 text-sm mt-1">or click to browse</p>
      <div className="flex justify-center gap-4 mt-3 text-gray-400 text-xs">
        <span className="flex items-center gap-1"><Image size={12} /> Photos</span>
        <span className="flex items-center gap-1"><Video size={12} /> Videos</span>
      </div>
    </div>
  );
}
