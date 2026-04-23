import { useRoleRegistration } from './RoutePage'
import { useEffect, useState } from 'react'
import { socket } from '../socket'

type Problem = {
  id: number
  question: string
  choices: string[]
}

function UserPage() {
  useRoleRegistration('user')
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
    <main className="screen-page screen-page--user">
      <h1>User</h1>
    </main>
  )
}

export default UserPage
