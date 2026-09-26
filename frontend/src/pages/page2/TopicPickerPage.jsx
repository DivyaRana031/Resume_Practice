import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Box, Dice5, Plus, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAppStore from "../../store/useAppStore";

const VISIBLE_TOPIC_COUNT = 4;

const TopicPickerPage = () => {
  const navigate = useNavigate();
  const { topics, selectedTopic, selectTopic, clearTopics, startPractice } = useAppStore();
  const [startIndex, setStartIndex] = useState(0);

  const visibleTopics = useMemo(() => {
    if (topics.length <= VISIBLE_TOPIC_COUNT) return topics;
    return Array.from(
      { length: VISIBLE_TOPIC_COUNT },
      (_, index) => topics[(startIndex + index) % topics.length]
    );
  }, [startIndex, topics]);

  const move = (direction) => {
    if (topics.length <= VISIBLE_TOPIC_COUNT) return;
    setStartIndex((current) => (current + direction + topics.length) % topics.length);
  };

  const pickRandomTopic = () => {
    if (topics.length) {
      selectTopic(topics[Math.floor(Math.random() * topics.length)]);
    }
  };

  const startNewResume = () => {
    clearTopics();
    navigate("/");
  };

  const handleStartTalking = () => {
    if (!selectedTopic) return;
    startPractice();
    navigate("/practice");
  };

  if (!topics.length) {
    return (
      <main className="topic-page empty-topic-page">
        <header className="topic-header">
          <a className="wordmark" href="/" aria-label="SpeechPact home">
            <span className="wordmark-mark" aria-hidden="true"><i /><i /><i /></span>
            SpeechPact
          </a>
        </header>
        <section className="empty-topic-state">
          <h1>Your topics are waiting.</h1>
          <p>Upload your resume first and we will turn your experience into practice.</p>
          <button className="topic-primary-button" onClick={startNewResume}>Upload resume</button>
        </section>
      </main>
    );
  }

  return (
    <main className="topic-page bg-[#efe1bb]">
      <div className="topic-decoration lavender-topic-decoration" />
      <div className="topic-decoration mint-topic-decoration" />
      <header className="topic-header">
        <a className="wordmark !text-[25px] !font-extrabold " href="/" aria-label="SpeechPact home">
          <span className="wordmark-mark font-bold" aria-hidden="true"><i /><i /><i /></span>
          SpeechPact
        </a>
        <button className="new-resume-button  !text-[20px] !font-bold" onClick={startNewResume}><Plus size={20} /> New Resume</button>
      </header>

      <section className="topic-picker-content  !flex !flex-col !items-center !text-center !w-full">
        
       <h1 className="mx-auto w-full text-center text-[32px] font-extrabold leading-tight tracking-[-1px] text-[#07152f]">Pick a Topic</h1>
        <p className="topic-subtitle font-bold">Choose a topic or let us pick one for you.</p>

        <div className="topic-carousel">
          <button className="carousel-arrow" onClick={() => move(-1)} disabled={topics.length <= VISIBLE_TOPIC_COUNT} aria-label="Previous topics"><ArrowLeft size={20} /></button>
          <div className="topic-card-list">
            {visibleTopics.map((topic, index) => {
              const isSelected = selectedTopic?.title === topic.title;
              return (
                <button className={`topic-card  ${isSelected ? "selected" : ""}`} key={`${topic.title}-${index}`} onClick={() => selectTopic(topic)}>
                  <span className="topic-card-icon"><Box size={24} strokeWidth={1.8} /></span>
                  <strong >{topic.title}</strong>
                  <small className="font-bold">{topic.category || "Speaking practice"}</small>
                </button>
              );
            })}
          </div>
          <button className="carousel-arrow " onClick={() => move(1)} disabled={topics.length <= VISIBLE_TOPIC_COUNT} aria-label="Next topics"><ArrowRight size={20} /></button>
        </div>

        <button className="random-topic-button " onClick={pickRandomTopic}><Dice5 size={22} /> Generate Random Topic</button>
        <button className="start-talking-button" onClick={handleStartTalking} disabled={!selectedTopic}>Start Talking <ArrowRight size={18} /></button>
        <button className="view-all-topics !font-bold" onClick={() => setStartIndex(0)}>View All {topics.length} Topics <ArrowRight size={20} /></button>
      </section>
      
        <div
          className="
            pointer-events-none
            absolute
            -bottom-[105px]
            -left-[100px]
            h-[250px]
            w-[520px]
            rounded-[50%]
            bg-[#edf4ef]
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -bottom-[120px]
            left-[20vw]
            h-[230px]
            w-[400px]
            rounded-[50%]
            bg-[#edf4ef]
          "
        />
      <p className="topic-progress-note font-bold">Same Resume.<br />New Conversations.  <svg
            className="
              absolute
              -right-[70px]
              bottom-0
              h-[50px]
              w-[50px]
            "
            viewBox="0 0 50 50"
            fill="none"
          >
            <path
              d="M4 40C16 35 27 22 34 7"
              stroke="#16736b"
              strokeWidth="1.7"
              strokeLinecap="round"
            />

            <path
              d="M27 8L34 6L33 14"
              stroke="#16736b"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg></p>
    </main>
  );
};

export default TopicPickerPage;