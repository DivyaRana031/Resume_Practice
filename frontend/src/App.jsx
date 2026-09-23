import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ResumeUploadPage from "./pages/page1/ResumeUploadPage";
import TopicPickerPage from "./pages/page2/TopicPickerPage";
import SpeakingPracticePage from "./pages/page3/SpeakingPracticePage";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<ResumeUploadPage />} />
      <Route path="/topics" element={<TopicPickerPage />} />
      <Route path="/practice" element={<SpeakingPracticePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App