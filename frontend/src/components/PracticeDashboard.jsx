import { useEffect } from "react";
import { queryDocuments, uploadPdf } from "../api/backend";
import useAppStore from "../store/useAppStore";

const PracticeDashboard = () => {
  const {
    file,
    uploadMessage,
    topics,
    selectedTopic,
    secondsLeft,
    isTimerRunning,
    chatInput,
    messages,
    isLoading,
    setFile,
    setUploadMessage,
    setTopics,
    selectTopic,
    resetTimer,
    toggleTimer,
    tickTimer,
    setChatInput,
    addMessage,
    setLoading,
  } = useAppStore();

  useEffect(() => {
    if (!isTimerRunning) return undefined;
    const timer = setInterval(tickTimer, 1000);
    return () => clearInterval(timer);
  }, [isTimerRunning, tickTimer]);

  const formattedTime = `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(
    secondsLeft % 60
  ).padStart(2, "0")}`;

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile?.type === "application/pdf") {
      setFile(selectedFile);
      setUploadMessage("");
    } else {
      setFile(null);
      setUploadMessage("Please select a PDF file.");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadMessage("Please select a PDF first.");
      return;
    }

    try {
      setUploadMessage("Uploading...");
      const data = await uploadPdf(file);
      setTopics(data.topics || []);
      setUploadMessage(data.message || "PDF uploaded successfully!");
    } catch {
      setUploadMessage("Failed to upload PDF.");
    }
  };

  const handleRandomTopic = () => {
    if (topics.length) {
      selectTopic(topics[Math.floor(Math.random() * topics.length)]);
    }
  };

  const handleChat = async (event) => {
    event.preventDefault();
    const query = chatInput.trim();
    if (!query) return;

    addMessage({ role: "user", content: query });
    setChatInput("");
    setLoading(true);

    try {
      const data = await queryDocuments(query);
      addMessage({ role: "bot", content: data.answer || "No answer generated." });
    } catch {
      addMessage({ role: "bot", content: "Error: Could not get a response from the server." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col gap-8">
      <section className="bg-white p-6 rounded-xl shadow-md w-full">
        <h2 className="text-xl font-bold mb-4">Upload PDF</h2>
        <input type="file" accept="application/pdf" onChange={handleFileChange} className="mb-4 w-full text-sm" />
        {file && <p className="text-sm text-gray-600 mb-4">Selected: {file.name}</p>}
        <button onClick={handleUpload} className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition">
          Send PDF
        </button>
        {uploadMessage && <p className="mt-4 text-sm text-gray-700">{uploadMessage}</p>}
      </section>

      {topics.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          <section className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-xl font-bold">Practice topics</h2>
              <span className="text-sm text-gray-500">{topics.length} topics</span>
            </div>
            <div className="max-h-[460px] overflow-y-auto space-y-2">
              {topics.map((topic, index) => (
                <button
                  key={`${topic.title}-${index}`}
                  onClick={() => selectTopic(topic)}
                  className={`w-full text-left p-3 rounded-lg border transition ${selectedTopic?.title === topic.title ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"}`}
                >
                  <span className="block font-medium text-gray-800">{topic.title}</span>
                  <span className="text-xs text-gray-500">{topic.category} · {topic.difficulty}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Speaking practice</p>
                <h2 className="text-2xl font-bold mt-1">{selectedTopic?.title || "Choose a topic"}</h2>
                <p className="text-gray-600 mt-3 max-w-3xl">{selectedTopic?.description}</p>
              </div>
              <div className="shrink-0 text-center border border-gray-200 rounded-lg px-5 py-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">Time left</p>
                <p className="text-3xl font-mono font-bold text-gray-900">{formattedTime}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-6">
              <button onClick={toggleTimer} className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition">{isTimerRunning ? "Pause practice" : "Start practice"}</button>
              <button onClick={resetTimer} className="border border-gray-300 px-5 py-2 rounded-lg hover:bg-gray-50 transition">Reset timer</button>
              <button onClick={handleRandomTopic} className="border border-gray-300 px-5 py-2 rounded-lg hover:bg-gray-50 transition">Pick random topic</button>
            </div>
            <div className="mt-8">
              <h3 className="font-bold text-lg">Follow-up questions</h3>
              <ul className="mt-3 space-y-2 list-disc list-inside text-gray-700">
                {selectedTopic?.followUpQuestions?.map((question, index) => <li key={`${question}-${index}`}>{question}</li>)}
              </ul>
            </div>
          </section>
        </div>
      )}

      <section className="bg-white p-6 rounded-xl shadow-md flex flex-col min-h-[520px]">
        <h2 className="text-xl font-bold mb-4">Chat with Medical Assistant</h2>
        <div className="flex-1 overflow-y-auto bg-gray-50 p-4 rounded-lg mb-4 flex flex-col gap-4">
          {messages.length === 0 ? (
            <p className="text-gray-400 text-center mt-auto mb-auto">Ask a question about your documents.</p>
          ) : (
            messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`max-w-[80%] p-3 rounded-lg ${message.role === "user" ? "bg-blue-500 text-white self-end rounded-br-none" : "bg-gray-200 text-gray-800 self-start rounded-bl-none"}`}>
                {message.content}
              </div>
            ))
          )}
          {isLoading && <div className="bg-gray-200 text-gray-800 p-3 rounded-lg self-start rounded-bl-none max-w-[80%]">Thinking...</div>}
        </div>
        <form onSubmit={handleChat} className="flex gap-2">
          <input type="text" value={chatInput} onChange={(event) => setChatInput(event.target.value)} placeholder="Type your question..." className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={isLoading} />
          <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50" disabled={isLoading || !chatInput.trim()}>Send</button>
        </form>
      </section>
    </div>
  );
};

export default PracticeDashboard;
