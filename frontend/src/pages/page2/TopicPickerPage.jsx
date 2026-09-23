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
    <main className="topic-page">
      <div className="topic-decoration lavender-topic-decoration" />
      <div className="topic-decoration mint-topic-decoration" />
      <header className="topic-header">
        <a className="wordmark" href="/" aria-label="SpeechPact home">
          <span className="wordmark-mark" aria-hidden="true"><i /><i /><i /></span>
          SpeechPact
        </a>
        <button className="new-resume-button" onClick={startNewResume}><Plus size={16} /> New Resume</button>
      </header>

      <section className="topic-picker-content">
        <div className="topic-title-accent" aria-hidden="true"><span /><span /></div>
        <p className="topic-eyebrow"><Sparkles size={14} /> YOUR EXPERIENCE, YOUR NEXT CONVERSATION</p>
        <h1>Pick a Topic</h1>
        <p className="topic-subtitle">Choose a topic or let us pick one for you.</p>

        <div className="topic-carousel">
          <button className="carousel-arrow" onClick={() => move(-1)} disabled={topics.length <= VISIBLE_TOPIC_COUNT} aria-label="Previous topics"><ArrowLeft size={20} /></button>
          <div className="topic-card-list">
            {visibleTopics.map((topic, index) => {
              const isSelected = selectedTopic?.title === topic.title;
              return (
                <button className={`topic-card ${isSelected ? "selected" : ""}`} key={`${topic.title}-${index}`} onClick={() => selectTopic(topic)}>
                  <span className="topic-card-icon"><Box size={21} strokeWidth={1.8} /></span>
                  <strong>{topic.title}</strong>
                  <small>{topic.category || "Speaking practice"}</small>
                </button>
              );
            })}
          </div>
          <button className="carousel-arrow" onClick={() => move(1)} disabled={topics.length <= VISIBLE_TOPIC_COUNT} aria-label="Next topics"><ArrowRight size={20} /></button>
        </div>

        <button className="random-topic-button" onClick={pickRandomTopic}><Dice5 size={22} /> Generate Random Topic</button>
        <button className="start-talking-button" onClick={handleStartTalking} disabled={!selectedTopic}>Start Talking <ArrowRight size={18} /></button>
        <button className="view-all-topics" onClick={() => setStartIndex(0)}>View All {topics.length} Topics <ArrowRight size={17} /></button>
      </section>
      <p className="topic-progress-note">Same Resume.<br />New Conversations. <span>↗</span></p>
    </main>
  );
};

export default TopicPickerPage;