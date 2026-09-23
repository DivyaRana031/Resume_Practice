import ResumeIntro from "../../components/ResumeIntro";
import ResumeUploadCard from "../../components/ResumeUploadCard";

const ResumeUploadPage = () => (
    <main className="resume-page">
      <div className="decorative-shape lavender-shape" />
      <div className="decorative-shape mint-shape" />
      <header className="site-header">
        <a className="wordmark" href="/" aria-label="SpeechPact home">
          <span className="wordmark-mark" aria-hidden="true"><i /><i /><i /></span>
          SpeechPact
        </a>
        <nav aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#about">About</a>
        </nav>
      </header>

      <div className="hero-layout">
        <ResumeIntro />
        <ResumeUploadCard />
      </div>

      <p className="progress-note">Small steps, big progress <span>↗</span></p>
    </main>
);

export default ResumeUploadPage;