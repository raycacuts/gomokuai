import React, { useState, useEffect } from 'react';
import Board from './Board';
import ResultModal from './ResultModal';
import { toast } from 'react-toastify';

const GRID_SIZE = 40;
const SIZE = 19;


const AI_API_URL = "https://your-aws-api-endpoint.com/gomoku-ai-move";


export default function PlayVsAI() {

    const [board, setBoard] = useState(Array(SIZE).fill().map(() => Array(SIZE).fill(0)));
    const [currentColor, setCurrentColor] = useState(1); // 1: Black (Player), 2: White (AI)
    
    const [winnerColor, setWinnerColor] = useState(0);
    const [showResult, setShowResult] = useState(false);

    const [gameEnded, setGameEnded] = useState(false);


    function checkWin(x, y, color) {
        const dirs = [

            [1, 0], [0, 1], [1, 1], [1, -1]
        ];
        for (let [dx, dy] of dirs) {

            let count = 1;
            for (let sign of [-1, 1]) {

                let nx = x, ny = y;
            while (true) {
                    nx += dx * sign;
                    ny += dy * sign;
                    if (nx < 0 || nx >= SIZE || ny < 0 || ny >= SIZE || board[nx][ny] !== color) break;
                    count++;
                }
            }
            if (count >= 5) return true;
        }
        return false;
    }

function getRandomEmptyPosition(board) {
        const empty = [];
        for (let i = 0; i < board.length; i++) 
            {
            for (let j = 0; j < board.length; j++) {
                if (board[i][j] === 0) empty.push([i, j]);
            }
        }
        if (empty.length === 0) return null;
        const idx = Math.floor(Math.random() * empty.length);
        return empty[idx]; 
    }




    async function aiMove(currentBoard) {
        function timeoutPromise(ms) {
            return new Promise((_, reject) =>
                setTimeout(() => reject(new Error("AI超时")), ms)
            );
        }
        try {
            const res = await Promise.race([
                fetch(AI_API_URL, 
                    {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ board: currentBoard })
                }),
                timeoutPromise(3000)
            ]);

            const data = await res.json();

            if (!data.move || data.move.length !== 2) throw new Error("AI返回无效");
            return data.move;

        } catch (error) {
            toast.warn("AI not responding！");
            return getRandomEmptyPosition(currentBoard); 
        }
    }

    async function handlePlay(i, j) {
        if (gameEnded) return;
        if (board[i][j] !== 0) {
            toast.error('That spot is taken!');
            return;
        }
        if (currentColor !== 1) return; 


        const newBoard = board.map(row => row.slice());
        newBoard[i][j] = 1;
        setBoard(newBoard);

     if (checkWin(i, j, 1)) 
        {

            setWinnerColor(1);
            setGameEnded(true);
            setShowResult(true);
            return;
        }

        setCurrentColor(2); 


        const aiMoveResult = await aiMove(newBoard);
        if (aiMoveResult && !gameEnded) {
            const [aiI, aiJ] = aiMoveResult;
            const aiBoard = newBoard.map(row => row.slice());
            aiBoard[aiI][aiJ] = 2;
            setTimeout(() => {
                setBoard(aiBoard);

                if (checkWin(aiI, aiJ, 2)) {
                    setWinnerColor(2);
                    setGameEnded(true);
                    setShowResult(true);
                    return;
                }
                setCurrentColor(1);
            }, 500);
        }
    }

function handleReset() 
{
    setBoard(Array(SIZE).fill().map(() => Array(SIZE).fill(0)));
     setCurrentColor(1);

        setWinnerColor(0);
        setShowResult(false);
        setGameEnded(false);
    }

    return (
        <div className="container board-container">
            <ResultModal
                show={showResult}
                
                handleClose={() => setShowResult(false)}
                winnerColor={winnerColor}
                myColor={winnerColor}

                name={winnerColor === 1 ? 'Player' : 'AI'}
                otherPlayerName={winnerColor === 2 ? 'Player' : 'AI'}
                opponentDisconnected={false}
                disconnectedName={''}
            />
            <div className="game-header-container">

                <div className="game-header-content">

                    <h1> Gomoku: Player vs AI </h1>

                    <p>Play against the AI (White). You play Black and go first!</p>
                    
                    <div className={winnerColor !== 0 ? "" : "hide-div"}>
                        <p>{winnerColor === 1 ? "You win!" : "AI wins!"}</p>
                        <button className="btn btn-primary" onClick={handleReset}>
                            Play Again
                        </button>
                    </div>


                    <p className={gameEnded ? "hide-div" : ""}>
                        <b>Current Turn:</b>{" "}

                        {currentColor === 1 ? "Player (Black)" : "AI (White)"}
                    </p>
                </div>
            </div>

            <div className="game-inner-container">
                <Board board={board} size={SIZE} on_play={handlePlay} grid_size={GRID_SIZE} />
            </div>
            {!gameEnded && (
                <button className="btn btn-secondary mt-3" onClick={handleReset}>
                    Reset Game
                </button>
            )}
        </div>
    );
}
