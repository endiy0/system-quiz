import { useRoleRegistration } from "./RoutePage";
import { useEffect, useState, useRef } from "react";
import { socket } from "../socket";
import "./UserPage.css";

type Problem = {
  id: number;
  question: string;
  choices: string[];
};

function UserPage() {
  useRoleRegistration("user");

  const [timer, setTimer] = useState<number | null>(null); // 初期値は0ではなくnullが適切です
  const [problems, setProblems] = useState<Problem | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [nowAnswer, setNowAnswer] = useState<string | null>(null);
  const [_correctCount, setCorrectCount] = useState<number>(0);
  const [nowCorrect, setNowCorrect] = useState<boolean>(false);

  const barRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<HTMLParagraphElement | null>(null);

  // 最新の「自分の回答」をSocketイベント内で参照するためのRef
  const nowAnswerRef = useRef<string | null>(null);
  useEffect(() => {
    nowAnswerRef.current = nowAnswer;
  }, [nowAnswer]);

  useEffect(() => {
    // 1. タイマーのカウントダウン処理
    const intervalId = setInterval(() => {
      setTimer((prev) => {
        // prev（現在の値）を見て判断するため、クロージャ問題が起きない
        if (prev === null || prev < 0) return null;
        return prev - 50;
      });
    }, 50);

    // 2. クイズ開始・次のクイズ時の共通処理
    const handleQuizStart = (data: { problem: Problem; duration: number }) => {
      setProblems(data.problem);
      setTimer(data.duration);
      setAnswer(null);
      setNowAnswer(null);

      const durationSec = Math.ceil(data.duration / 1000);

      // アニメーションを一度リセットしてから再適用する（連続でアニメーションさせるための必須テクニック）
      if (barRef.current) {
        barRef.current.style.animation = "none";
        barRef.current.style.inset = "none";
        void barRef.current.offsetWidth; // 強制的に再描画（リフロー）させてアニメーションをリセット
        barRef.current.style.animation = `timeout ${durationSec}s linear forwards`;
      }
      if (timerRef.current) {
        timerRef.current.style.animation = "none";
        void timerRef.current.offsetWidth;
        timerRef.current.style.animation = `timeout2 ${durationSec}s linear`;
      }
    };

    // 3. 正解発表時の処理
    const handleShowAnswer = (data: string) => {
      const myAnswer = nowAnswerRef.current; // Refから最新の回答を取得

      if (myAnswer == data) {
        setCorrectCount((value) => value + 1);
        setNowCorrect(true);
      } else {
        setNowCorrect(false);
      }

      setTimer(null);
      setAnswer(data);
    };

    // イベントリスナーの登録
    socket.on("quiz_start", handleQuizStart);
    socket.on("next_quiz", handleQuizStart);
    socket.on("show_answer", handleShowAnswer);

    // 4. クリーンアップ処理（コンポーネントが破棄される時に実行）
    return () => {
      clearInterval(intervalId);
      socket.off("quiz_start", handleQuizStart);
      socket.off("next_quiz", handleQuizStart);
      socket.off("show_answer", handleShowAnswer); // ← ここが以前は漏れていたので追加
    };
  }, []); // 依存配列は空でOK

  // スペルミス修正 (clickHandlar -> clickHandler)
  const clickHandler = (choice: string) => {
    setNowAnswer(choice);
  };

  return (
    <div className="back">
      <main className="screen-page screen-page--user">
        <p className="windowtype">User</p>

        <div className="timer">
          <p ref={timerRef} className="glass2">
            {timer === null ? "-" : Math.floor(timer / 1000.0)}
          </p>
          <div className="glass">
            <div className="clockbar_cover">
              <div className="clockbar" ref={barRef}></div>
            </div>
          </div>
        </div>

        <div className="problem glass">
          <p>第{problems ? problems.id : "-"}問：</p>
          <h3>{problems ? problems.question : ""}</h3>
        </div>
        <div className="choice glass">
          {problems &&
            !nowAnswer &&
            !answer &&
            problems.choices.map((value, index) => (
              <button
                key={index} // Reactのmap展開では、一意の key を渡すのが必須です
                className="choicebtn"
                disabled={nowAnswer !== null}
                onClick={() => clickHandler(value)}
              >
                {value}
              </button>
            ))}
          {problems && (nowAnswer || answer) && (
            <>
              <p>あなたの回答：{nowAnswer}</p>
            </>
          )}
        </div>

        {answer && (
          <div className="answer glass">
            {answer && (
              <>
                <p>答え：</p>
                <h3>{answer}</h3>
                {nowCorrect && <h3 className="correct">正解！</h3>}
                {!nowCorrect && <h3 className="incorrect">残念...</h3>}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default UserPage;
