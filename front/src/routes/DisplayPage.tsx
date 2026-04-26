import "./DisplayPage.css";
import { useRoleRegistration } from "./RoutePage";
import { useEffect, useState, useRef } from "react";
import { socket } from "../socket";

type Problem = {
  id: number;
  question: string;
  choices: string[];
};

function DisplayPage() {
  useRoleRegistration("display");
  const [problems, setProblems] = useState<Problem | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [timer, setTimer] = useState<number | null>(0);
  const barRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<HTMLParagraphElement | null>(null);
  useEffect(() => {
    setInterval(() => {
      if (timer !== null) {
        setTimer((value) => {
          if (!value) return value;
          if (value <= 0) return null;
          return value - 100;
        });
      }
    }, 100);

    socket.on("quiz_start", (data: { problem: Problem; duration: number }) => {
      setProblems(data.problem);
      setAnswer(null);
      setTimer(data.duration);
      if (barRef !== null) {
        barRef.current!.style.animation = `timeout ${Math.ceil(data.duration / 1000)}s linear forwards`;
      }
      if (timerRef !== null) {
        timerRef.current!.style.animation = `timeout2 ${Math.ceil(data.duration / 1000)}s linear forwards`;
      }
    });

    socket.on("next_quiz", (data: { problem: Problem; duration: number }) => {
      setProblems(data.problem);
      setAnswer(null);
      if (barRef !== null) {
        barRef.current!.style.animation = `timeout ${Math.ceil(data.duration / 1000)}s ease-out forwards`;
      }
    });
    socket.on("show_answer", (data: string) => {
      setAnswer(data);
    });
  }, []);
  return (
    <main className="screen-page screen-page--display">
      <p className="windowtype">Display</p>
      <div className="glass clockStage">
        <p ref={timerRef}>
          {timer === null ? "-" : Math.ceil((timer ?? 0) / 1000.0)}
        </p>
        <div className="clockbar_cover">
          <div className="clockbar" ref={barRef}></div>
        </div>
      </div>
      <section className="mainSection">
        {problems && (
          <>
            <div className="glass questionStage">
              <h2>第{problems?.id}問：</h2>
              <h3>{problems?.question}</h3>
            </div>
            <div className="glass choiceStage">
              {problems.choices.map((value) => (
                <div className="choice">{value}</div>
              ))}
            </div>
          </>
        )}
        {answer && (
          <div className="glass answerStage">
            <h2>{answer ? "答え:" : null}</h2>
            <h3>{answer}</h3>
          </div>
        )}
      </section>
    </main>
  );
}

export default DisplayPage;
