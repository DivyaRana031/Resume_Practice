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
      <main className="practice-page empty-practice-page bg-[#efe1bb]">
        <h1>Choose a topic first.</h1>
        <button className="practice-primary-button" onClick={() => navigate("/topics")}>Back to topics</button>
      </main>
    );
  }

  return (
    <main className="practice-page bg-[#efe1bb]">
      <header className="practice-header">
        <a className="wordmark flex
              items-center
              gap-3
              !text-[25px]
              !font-extrabold
              tracking-[-0.6px]
              text-[#10211f] " href="/" aria-label="SpeechPact home"><span className="wordmark-mark" aria-hidden="true"><i /><i /><i /></span>SpeechPact</a>
        <button className="end-session-button !text-[15px] !font-bold" onClick={() => navigate("/topics")}><X size={18} /> End Session</button>
      </header>

      <div className="practice-topline">
        <button className="practice-back-button" onClick={() => navigate("/topics")} aria-label="Back to topics"><ArrowLeft size={23} /></button>
        <span className="practice-counter">{topicNumber} / {topics.length}</span>
      </div>

      <section className="practice-content">
        <div className="practice-category !text-[16px] font-bold">{selectedTopic.category || "Speaking practice"}</div>
        <div className="practice-prompt  mx-auto
    !w-full
    !max-w-[720px]
    rounded-[24px]
    border
    !border-[#F4DFA8]
    !bg-[#FFF8E8]
    !px-8
    !py-6
    !text-center
    !text-[17px]
    font-semibold
    leading-[1.5]
    tracking-[-0.2px]
    !text-[#07152F]
    shadow-[0_8px_25px_rgba(244,179,41,0.08)]">{selectedTopic.description || selectedTopic.title}</div>

        <div className="duration-row flex items-center justify-center gap-3 mt-6">
          <span className="!text-[16px] !font-bold  !text-[#68736F] !mr-2 ">Select Time</span>
          {durations.map((value) => (
            <button key={value} className={duration === value ? "active" : ""} onClick={() => chooseDuration(value)}>
              {value < 60 ? `${value} sec` : `${value / 60} min`}
            </button>
          ))}
          <label className="custom-duration  flex
      !items-center
      rounded-full
      bg-[#EEF0F2]
      !px-4
      !py-2
      !text-[13px]
      !font-semibold
      !text-[#52605C]">
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
               className="
        !w-[45px]
        !bg-transparent
        !text-center
        outline-none
      "
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
          <p className="font-bold">{isTimerRunning ? "Speaking session in progress" : "Click to start speaking"}</p>
        </div>

       <aside
  className="
    practice-tips
    absolute
    !right-[2%]
    !top-1/2
    !-translate-y-1/2
    !w-[155px]
    rounded-[18px]
    bg-[#FFF4E7]
    !px-5
    !py-4
    !shadow-sm
  "
>
  <h2
    className="
      !mb-2
      !flex
      !items-center
      gap-2
      !text-[15px]
      !font-bold
      !text-[#07152F]
    "
  >
    <Lightbulb size={18} />
    Tips
  </h2>

  <ul
    className="
      space-y-1.5
      !text-[11px]
      !font-medium
      leading-[1.4]
      !text-[#68736F]
    "
  >
    <li>Speak naturally</li>
    <li>Take your time</li>
    <li>Explain with examples</li>
    <li>Try to be concise</li>
  </ul>
</aside>

      </section>
      <div
  className="
    pointer-events-none
    absolute
    -bottom-[105px]
    -right-[100px]
    h-[250px]
    w-[520px]
    rounded-[50%]
    bg-[#edf4ef]
  "
/>
      <p
  className="
    absolute
    bottom-[25px]
    right-[55px]
    rotate-[-5deg]
    !text-[15px]
    !font-bold
    leading-[1.15]
    text-[#31443F]
  "
>
  Good
  <br />
  Speakers
  <br />
  <span className="text-[#176B5B]">
    Build Better Futures.
  </span>
  </p>
    </main>
  );
};


export default SpeakingPracticePage;