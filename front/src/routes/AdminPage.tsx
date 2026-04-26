import { useEffect, useState } from "react";
import { socket } from "../socket";
import { useRoleRegistration } from "./RoutePage";

type Problem = {
  id: number;
  question: string;
  choices: string[];
};

function AdminPage() {
  useRoleRegistration("admin");
  const [quizStarted, setquizStarted] = useState(false);
  const [problems, setProblems] = useState<Problem | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  useEffect(() => {
    socket.on("quiz_start", (data: { problem: Problem; duration: number }) => {
      setquizStarted(true);
      setProblems(data.problem);
      setAnswer(null);
    });

    socket.on("quiz_stop", () => {
      setquizStarted(false);
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
    <main className="screen-page screen-page--admin">
      <h1>Admin</h1>
      <h2>{problems?.question}</h2>
      <h2>{problems?.choices.join(", ")}</h2>
      <h2>{answer}</h2>
      <button onClick={() => socket.emit("quiz_start")} disabled={quizStarted}>
        Quiz Start
      </button>
      <button onClick={() => socket.emit("quiz_stop")} disabled={!quizStarted}>
        Quiz Stop
      </button>
      <br />
      <br />
      <button onClick={() => socket.emit("next_quiz")} disabled={!quizStarted}>
        Next Quiz
      </button>
      <button
        onClick={() => socket.emit("open_answer")}
        disabled={!quizStarted}
      >
        Open Result
      </button>
    </main>
  );
}

export default AdminPage;
