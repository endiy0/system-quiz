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
  const [timer, setTimer] = useState<number | null>(null);
  const [alltime, setAllTime] = useState<number | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<HTMLParagraphElement | null>(null);
  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimer((prev) => {
        // prev（現在の値）を見て判断するため、クロージャ問題が起きない
        if (prev === null || prev < 0) return null;
        return prev - 50;
      });
    }, 50);

    socket.on("quiz_start", (data: { problem: Problem; duration: number }) => {
      setProblems(data.problem);
      setAnswer(null);
      setTimer(data.duration);
      setAllTime(data.duration);
    });

    socket.on("next_quiz", (data: { problem: Problem; duration: number }) => {
      setProblems(data.problem);
      setAnswer(null);
      setTimer(data.duration);
      setAllTime(data.duration);
    });
    socket.on("show_answer", (data: string) => {
      setAnswer(data);
    });

    return () => {
      clearInterval(intervalId);
      socket.off("quiz_start");
      socket.off("next_quiz");
      socket.off("show_answer"); // ← ここが以前は漏れていたので追加
      clearInterval(intervalId);
    };
  }, []);
  return (
    <main className="screen-page screen-page--display">
      <p className="windowtype">Display</p>
      <div className="glass clockStage">
        <p ref={timerRef}>
          {timer === null ? "-" : Math.floor((timer ?? 0) / 1000.0)}
        </p>
        <div className="clockbar_cover">
          <div
            className="clockbar"
            ref={barRef}
            style={{
              clipPath: `inset(0 ${100 - ((timer ?? 0) / (alltime ?? 1)) * 100}% 0 0)`,
            }}
          ></div>
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
