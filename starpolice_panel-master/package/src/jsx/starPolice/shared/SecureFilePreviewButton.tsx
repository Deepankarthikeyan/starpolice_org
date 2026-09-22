import { UploadPreviewButton } from "./UploadFilePreview";
import type { FileCategory, UploadedFile } from "../types";

function inferCategory(fileName: string): FileCategory {
  const lower = fileName.toLowerCase();
  if (/\.(jpe?g|png|gif|webp|bmp|svg)$/.test(lower)) return "image";
  if (/\.(mp4|webm|mov|avi|mkv)$/.test(lower)) return "video";
  if (lower.endsWith(".pdf")) return "pdf";
  return "document";
}

export function SecureFilePreviewButton({
  fileUrl,
  name,
  className = "btn btn-sm btn-outline-primary",
}: {
  fileUrl: string;
  name: string;
  className?: string;
}) {
  const upload: UploadedFile = {
    id: fileUrl,
    date: "",
    title: name,
    name,
    category: inferCategory(name),
    fileUrl,
    uploadedAt: "",
    uploadedBy: "",
  };

  return <UploadPreviewButton upload={upload} className={className} />;
}
