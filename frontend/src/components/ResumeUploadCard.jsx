import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadPdf } from "../api/backend";
import useAppStore from "../store/useAppStore";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const DocumentIcon = () => (
  <svg viewBox="0 0 48 48" aria-hidden="true" className="document-icon">
    <path d="M14 5h14l9 9v29H14z" />
    <path d="M28 5v10h9M20 24h11M20 31h11M20 38h7" />
  </svg>
);

const formatSize = (bytes) => `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

const ResumeUploadCard = () => {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const { file, setFile, setUploadMessage, setTopics } = useAppStore();
  const navigate = useNavigate();

  const uploadResume = async (candidate) => {
    setIsAnalyzing(true);
    setError("");
    setUploadMessage("Uploading your resume...");

    try {
      const data = await uploadPdf(candidate);
      setTopics(data.topics || []);
      setUploadMessage(data.message || "Your topics are ready.");
      navigate("/topics", { replace: true });
    } catch {
      setError("We could not upload that resume. Please try again.");
      setUploadMessage("");
      setFile(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const selectFile = (candidate) => {
    if (!candidate) return;
    const validType = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(candidate.type);
    const validExtension = /\.(pdf|docx)$/i.test(candidate.name);

    if ((!validType && !validExtension) || candidate.size > MAX_FILE_SIZE) {
      setError(candidate.size > MAX_FILE_SIZE ? "Please choose a file smaller than 5 MB." : "Please choose a PDF or DOCX file.");
      setFile(null);
      return;
    }

    setError("");
    setFile(candidate);
    uploadResume(candidate);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    selectFile(event.dataTransfer.files[0]);
  };

  return (
    <section
      className={`upload-card ${isDragging ? "is-dragging" : ""} ${file ? "has-file" : ""}`}
      onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      {isAnalyzing ? (
        <div className="loading-state">
          <div className="loading-mark" aria-hidden="true"><span /><span /><span /></div>
          <h2>Uploading your resume...</h2>
          <p>Finding projects, skills, and experiences...</p>
          <p>Creating your speaking topics...</p>
          <div className="progress-track"><span /></div>
        </div>
      ) : (
        <div className="empty-upload-state">
          <div className="upload-icon-wrap"><DocumentIcon /><span>↑</span></div>
          <h2>Upload your resume</h2>
          <p className="file-types">PDF or DOCX <span>·</span> Max 5 MB</p>
          <button className="primary-button" onClick={() => inputRef.current?.click()}>Choose file</button>
          <input ref={inputRef} type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(event) => selectFile(event.target.files[0])} hidden />
          <p className="drop-hint">or drag and drop it here</p>
          <p className="privacy-note">Your resume is used only to create your personalized topics.</p>
        </div>
      )}
      {error && <p className="upload-error">{error}</p>}
    </section>
  );
};

export default ResumeUploadCard;





