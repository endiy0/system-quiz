import "./DisplayPage.css";
import { useRoleRegistration } from "./RoutePage";
import { useEffect, useState, type CSSProperties } from "react";
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
  const [timecount, setTimeCount] = useState<number | null>(null);
  setInterval(() => {
    setTimeCount((value) => (value ? value - 100 : null));
  }, 100);
  useEffect(() => {
    socket.on("quiz_start", (data: { problem: Problem; duration: number }) => {
      setProblems(data.problem);
      setAnswer(null);
      setTimeCount(data.duration);
    });

    socket.on("next_quiz", (data: Problem) => {
      setProblems(data);
      setAnswer(null);
    });
    socket.on("show_answer", (data: string) => {
      setAnswer(data);
    });
  }, []);
  return (
    <main className="screen-page screen-page--display">
      <h1>Display</h1>
      <div className="clock">
        <p>{Math.floor(timecount ?? 0 / 1000) ?? "-"}</p>
        <div
          className={"clockbar progressbar" + (timecount ? "progress" : "")}
          style={
            {
              "--animeduration": `${Math.floor(timecount ?? 0 / 1000)}s`,
            } as CSSProperties
          }
        ></div>
      </div>
      <h2>{problems?.question}</h2>
      <h2>{problems?.choices.join(", ")}</h2>
      <h2>{answer ? "答え:" : null}</h2>
      <h2>{answer}</h2>
    </main>
  );
}

export default DisplayPage;
