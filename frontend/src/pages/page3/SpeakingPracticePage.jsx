import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Lightbulb, Mic, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAppStore from "../../store/useAppStore";

const durations = [30, 60, 120, 180];

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
};



const SpeakingPracticePage = () => {
  const navigate = useNavigate();
  const { topics, selectedTopic, secondsLeft, isTimerRunning, toggleTimer, tickTimer, setTimer } = useAppStore();
  const [duration, setDuration] = useState(120);
  const [customMinutes, setCustomMinutes] = useState("2");

  const topicNumber = useMemo(() => {
    const index = topics.findIndex((topic) => topic.title === selectedTopic?.title);
    return index >= 0 ? index + 1 : 1;
  }, [selectedTopic, topics]);

  useEffect(() => {
    if (!isTimerRunning) return undefined;
    const timer = setInterval(tickTimer, 1000);
    return () => clearInterval(timer);
  }, [isTimerRunning, tickTimer]);

  const chooseDuration = (value) => {
    setDuration(value);
    setTimer(value);
  };

  const chooseCustomDuration = () => {
    const minutes = Number(customMinutes);
    if (!Number.isFinite(minutes) || minutes <= 0) return;

    const seconds = Math.round(minutes * 60);
    setDuration(seconds);
    setTimer(seconds);
  };

  if (!selectedTopic) {
    return (
      <main className="practice-page empty-practice-page">
        <h1>Choose a topic first.</h1>
        <button className="practice-primary-button" onClick={() => navigate("/topics")}>Back to topics</button>
      </main>
    );
  }

  return (
    <main className="practice-page">
      <header className="practice-header">
        <a className="wordmark" href="/" aria-label="SpeechPact home"><span className="wordmark-mark" aria-hidden="true"><i /><i /><i /></span>SpeechPact</a>
        <button className="end-session-button" onClick={() => navigate("/topics")}><X size={18} /> End Session</button>
      </header>

      <div className="practice-topline">
        <button className="practice-back-button" onClick={() => navigate("/topics")} aria-label="Back to topics"><ArrowLeft size={23} /></button>
        <span className="practice-counter">{topicNumber} / {topics.length}</span>
      </div>

      <section className="practice-content">
        <div className="practice-category">{selectedTopic.category || "Speaking practice"}</div>
        <div className="practice-prompt">{selectedTopic.description || selectedTopic.title}</div>

        <div className="duration-row">
          <span>Select Time</span>
          {durations.map((value) => (
            <button key={value} className={duration === value ? "active" : ""} onClick={() => chooseDuration(value)}>
              {value < 60 ? `${value} sec` : `${value / 60} min`}
            </button>
          ))}
          <label className="custom-duration">
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={customMinutes}
              onChange={(event) => setCustomMinutes(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") chooseCustomDuration();
              }}
              onBlur={chooseCustomDuration}
              aria-label="Custom duration in minutes"
            />
            <span>min</span>
          </label>
        </div>

        <div className="practice-stage">
          <div className={`voice-orb ${isTimerRunning ? "speaking" : ""}`}>
            <div className="voice-waves"><span /><span /><span /><span /><span /></div>
            <button className="mic-button" onClick={toggleTimer} aria-label={isTimerRunning ? "Pause speaking session" : "Start speaking session"}>
              <Mic size={42} strokeWidth={1.8} />
            </button>
            <div className="voice-waves right"><span /><span /><span /><span /><span /></div>
          </div>
          <strong className="timer-display">{formatTime(secondsLeft)}</strong>
          <p>{isTimerRunning ? "Speaking session in progress" : "Click to start speaking"}</p>
        </div>

        <aside className="practice-tips">
          <h2><Lightbulb size={21} /> Tips</h2>
          <ul><li>Speak naturally</li><li>Take your time</li><li>Explain with examples</li><li>Try to be concise</li></ul>
        </aside>

      </section>
      <p className="practice-note">Good<br />Speakers<br /><span>Build Better Futures.</span></p>
    </main>
  );
};


export default SpeakingPracticePage;