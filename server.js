import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import fs from 'fs';

const problemsjson = JSON.parse(fs.readFileSync('problem.json', 'utf-8'));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const __distname = path.join(__dirname, 'front', 'dist');

let problems = problemsjson.problems;
let currentProblemIndex = 0;
let quizStatus = 'stooped'; // 'stopped', 'running'

const app = express();
const PORT = process.env.PORT || 3000;
const QUIZ_DURATION = process.env.QUIZ_DURATION || 20000; // 20 seconds

app.use(express.static(__distname));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__distname, 'index.html'));
});

app.get('/display', (req, res) => {
    res.sendFile(path.join(__distname, 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__distname, 'index.html'));
});

const server = createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
    if(quizStatus === 'running') {
        const { answer, ...problem } = problems[currentProblemIndex];
        socket.emit('quiz_start', problem);
        setTimeout(() => {
            socket.emit('show_answer', answer);
        }, QUIZ_DURATION);
    }


    socket.on('role', (message) => {
        if(message === 'admin') 
        {
            socket.join('admin');
        }
        else if(message === 'display')
        {
            socket.join('display');
        }
        else if(message === 'user')
        {
            socket.join('user');
        }
    });

    socket.on('quiz_start', () => {
        currentProblemIndex = 0;
        quizStatus = 'running';
        const { answer, ...problem } = problems[currentProblemIndex];
        io.to('display').emit('quiz_start', problem);
        io.to('admin').emit('quiz_start', problem);
        io.to('user').emit('quiz_start', problem);
    });

    socket.on('quiz_stop', () => {
        io.to('display').emit('quiz_stop');
        io.to('admin').emit('quiz_stop');
        io.to('user').emit('quiz_stop');
        currentProblemIndex = 0;
        quizStatus = 'stopped';
    });

    socket.on('next_quiz', () => {
        currentProblemIndex++;
        if(currentProblemIndex >= problems.length) {
            currentProblemIndex = 0;
            io.to('display').emit('quiz_stop');
            io.to('admin').emit('quiz_stop');
            io.to('user').emit('quiz_stop');
            return;
        }
        
        const { answer, ...problem } = problems[currentProblemIndex];
        io.to('display').emit('next_quiz', problem);
        io.to('admin').emit('next_quiz', problem);
        io.to('user').emit('next_quiz', problem);
        setTimeout(() => {
            io.to('display').emit('show_answer', answer);
            io.to('admin').emit('show_answer', answer);
            io.to('user').emit('show_answer', answer);
        }, QUIZ_DURATION);
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
