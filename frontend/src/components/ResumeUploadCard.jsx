import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadPdf } from "../api/backend";
import useAppStore from "../store/useAppStore";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const DocumentIcon = () => (
  <svg viewBox="0 0 48 48" aria-hidden="true" className="document-icon !h-[66px] !w-[66px]  !translate-x-2 !translate-y-2">
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
      className={`upload-card  
         w-[45vw]
    min-h-[700vh]
    max-w-[600px]
    rounded-[30px] 
     border
    border-[#dce9e5]
    bg-white
    p-10
    shadow-[0_15px_40px_rgba(22,139,120,0.08)]
    flex
    items-center
    justify-center

    ${isDragging ? "is-dragging" : ""} ${file ? "has-file" : ""}`}
      onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      {isAnalyzing ? (
        <div className="loading-state ">
          <div className="loading-mark" aria-hidden="true"><span /><span /><span /></div>
          <h2 >Uploading your resume...</h2>
          <p>Finding projects, skills, and experiences...</p>
          <p>Creating your speaking topics...</p>
          <div className="progress-track"><span /></div>
        </div>
      ) : (
        <div className="empty-upload-state">
          <div className="upload-icon-wrap relative mb-6 flex h-[80px] w-[80px] !items-center !justify-center  bg-[#EEF8F4] text-[#07152f]  shadow-[0_8px_25px_rgba(22,139,120,0.08)] rounded-[24px] "><DocumentIcon /><span  className="
      absolute
      bottom-1
      right-1
      flex
      h-7
      w-7
      items-center
      justify-center
      rounded-full
      bg-[#176B5B]
      text-lg
      font-bold
      text-white
    ">↑</span></div>
          <h2 className="text=[50px] font-extrabold  leading-tight tracking-[-0.8px] text-[#07152f]">Upload Your Resume</h2>
          <p className="file-types !text-[13px] font-bold ">PDF or DOCX <span>·</span> Max 5 MB</p>
          <button className="primary-button !w-full
    rounded-xl
    !text-xl
    !font-semibold
    transition-all
    duration-300
    
    " onClick={() => inputRef.current?.click()}>Choose file</button>
          <input ref={inputRef} type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(event) => selectFile(event.target.files[0])} hidden />
          <p className="drop-hint !mt-4 !text-[15px] !font-semibold text-[#68736F]">or drag and drop it here</p>
          <p className="privacy-note mt-6 max-w-[320px] !text-[13px] !font-medium leading-relaxed text-[#98A29E]">Your resume is used only to create your personalized topics.</p>
        </div>
      )}
      {error && <p className="upload-error">{error}</p>}
    </section>
  );
};

export default ResumeUploadCard;





