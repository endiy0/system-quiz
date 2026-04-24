import "./DisplayPage.css";
import { useRoleRegistration } from "./RoutePage";
import { useEffect, useState } from "react";
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
  const [timecount, setTimeCount] = useState<number>(20000);
  const [settedTime, setSettedTime] = useState<number>(0);
  const [timer, setTimer] = useState<number>(0);
  setInterval(() => {
    if(settedTime >= Date.now()) {
      setTimer(settedTime - Date.now());
    }
  }, 100);
  useEffect(() => {
    socket.on("quiz_start", (data: { problem: Problem; duration: number }) => {
      setProblems(data.problem);
      setAnswer(null);
      setTimeCount(data.duration);
      setSettedTime(Date.now() + (data.duration || 0));
    });

    socket.on("next_quiz", (data: Problem) => {
      setProblems(data);
      setAnswer(null);
      setSettedTime(Date.now() + (timecount || 0));
    });
    socket.on("show_answer", (data: string) => {
      setAnswer(data);
    });
  }, []);
  return (
    <main className="screen-page screen-page--display">
      <h1>Display</h1>
      <div className="clock">
        <p>{Math.floor((timer) / 1000.0) ?? "-"}</p>
        <div className="clockbar">
          <div
            className="clockbar-fill"
            style={{ width: `${(timer / timecount) * 100}%` }}
          />
        </div>
      </div>
      <h2>{problems?.question}</h2>
      <h2>{problems?.choices.join(", ")}</h2>
      <h2>{answer ? "答え:" : null}</h2>
      <h2>{answer}</h2>
    </main>
  );
}

export default DisplayPage;
