import React, { useState } from "react";

const App = () => {
  const [file, setFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");

  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile && selectedFile.type === "application/pdf") {
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

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadMessage("Uploading...");

      const response = await fetch("http://localhost:8000/api/upload-pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();

      setUploadMessage(data.message || "PDF uploaded successfully!");
    } catch (error) {
      console.error(error);
      setUploadMessage("Failed to upload PDF.");
    }
  };

  const handleChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = { role: "user", content: chatInput };
    setMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: userMessage.content, top_k: 3 }),
      });

      if (!response.ok) throw new Error("Failed to fetch response");

      const data = await response.json();
      const botMessage = { role: "bot", content: data.answer || "No answer generated." };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "Error: Could not get a response from the server." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col md:flex-row gap-8">
      {/* Sidebar: Upload PDF */}
      <div className="bg-white p-6 rounded-xl shadow-md w-full md:w-[350px] h-fit">
        <h2 className="text-xl font-bold mb-4">Upload PDF</h2>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="mb-4 w-full text-sm"
        />
        {file && <p className="text-sm text-gray-600 mb-4">Selected: {file.name}</p>}
        <button
          onClick={handleUpload}
          className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
        >
          Send PDF
        </button>
        {uploadMessage && <p className="mt-4 text-sm text-gray-700">{uploadMessage}</p>}
      </div>

      {/* Main Area: Chat Interface */}
      <div className="bg-white p-6 rounded-xl shadow-md flex-1 flex flex-col h-[80vh]">
        <h2 className="text-xl font-bold mb-4">Chat with Medical Assistant</h2>
        
        <div className="flex-1 overflow-y-auto bg-gray-50 p-4 rounded-lg mb-4 flex flex-col gap-4">
          {messages.length === 0 ? (
            <p className="text-gray-400 text-center mt-auto mb-auto">
              Ask a question about your documents.
            </p>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`max-w-[80%] p-3 rounded-lg ${
                  msg.role === "user"
                    ? "bg-blue-500 text-white self-end rounded-br-none"
                    : "bg-gray-200 text-gray-800 self-start rounded-bl-none"
                }`}
              >
                {msg.content}
              </div>
            ))
          )}
          {isLoading && (
            <div className="bg-gray-200 text-gray-800 p-3 rounded-lg self-start rounded-bl-none max-w-[80%]">
              Thinking...
            </div>
          )}
        </div>

        <form onSubmit={handleChat} className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Type your question..."
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
            disabled={isLoading || !chatInput.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default App;
