import { useRoleRegistration } from './RoutePage'
import { useEffect, useState } from 'react'
import { socket } from '../socket'

type Problem = {
  id: number
  question: string
  choices: string[]
}

function DisplayPage() {
  useRoleRegistration('display')
    const [problems, setProblems] = useState<Problem|null>(null);
    const [answer, setAnswer] = useState<string|null>(null);
    useEffect(() => {
      socket.on('quiz_start', (data: Problem) => {
        setProblems(data);
        setAnswer(null);
      })
  
      socket.on('next_quiz', (data: Problem) => {
        setProblems(data);
        setAnswer(null);
      });
      socket.on('show_answer', (data: string) => {
        setAnswer(data);
      });
    }, []);
  return (
    <main className="screen-page screen-page--display">
      <h1>Display</h1>
      <h2>{problems?.question}</h2>
      <h2>{problems?.choices.join(', ')}</h2>
      <h2>{answer ? '答え:' : null}</h2>
      <h2>{answer}</h2>
    </main>
  )
}

export default DisplayPage
