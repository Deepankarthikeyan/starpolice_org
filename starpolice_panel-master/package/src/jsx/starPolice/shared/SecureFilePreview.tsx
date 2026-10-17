import { useMemo, useState } from "react";
import { Modal } from "react-bootstrap";
import { getAbsoluteFileUrl } from "../fileUrl";

interface SecureFilePreviewProps {
  fileUrl: string;
  label?: string;
  className?: string;
  imagePreview?: boolean;
}

export function SecureFilePreview({
  fileUrl,
  label = "View",
  className = "btn btn-sm btn-outline-primary",
  imagePreview = false,
}: SecureFilePreviewProps) {
  const [open, setOpen] = useState(false);
  const absoluteUrl = useMemo(() => getAbsoluteFileUrl(fileUrl), [fileUrl]);
  const isImage = imagePreview || /\.(png|jpe?g|gif|webp|bmp)$/i.test(fileUrl);

  if (!fileUrl) {
    return <span className="text-muted">No file uploaded</span>;
  }

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {label}
      </button>
      <Modal show={open} onHide={() => setOpen(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Secure Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {isImage ? (
            <img src={absoluteUrl} alt="Preview" className="img-fluid rounded" style={{ maxHeight: "70vh" }} />
          ) : (
            <iframe
              src={absoluteUrl}
              title="Document preview"
              className="w-100 rounded"
              style={{ height: "70vh", border: "none" }}
            />
          )}
          <p className="text-muted small mt-3 mb-0">Downloads are disabled. View only.</p>
        </Modal.Body>
      </Modal>
    </>
  );
}
