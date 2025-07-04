import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import 'bootstrap/dist/css/bootstrap.min.css';


export default function ResultModal(props) {
    const [winnerName, setWinnerName] = useState('');
    const [winnerColor, setWinnerColor] = useState('');
    const [isWinner, setIsWinner] = useState(false);

    useEffect(() => {
        if (props.myColor === props.winnerColor) {
            setIsWinner(true);
            setWinnerName(props.name);
        } else {
            setIsWinner(false);
            setWinnerName(props.otherPlayerName);
        }

        setWinnerColor(props.winnerColor === 1 ? "black" : "white");
    }, [props.myColor, props.winnerColor, props.name, props.otherPlayerName]);

    return (
        <Modal
            className="result-modal"
            show={props.show}
            onHide={props.handleClose}
            centered
            backdrop="static"
        >
            <Modal.Body style={{ textAlign: 'center', padding: '2em 1em' }}>
                <h2 style={{ marginBottom: '1.5em' }}>
                    {isWinner ? 'You win!' : 'AI wins!'}
                </h2>
                <p>
                    Winner: <span style={{ color: winnerColor }}>{winnerName}</span>
                </p>
                <div style={{ marginTop: '2em', display: 'flex', justifyContent: 'center', gap: '1em' }}>
                    <button className="btn btn-primary" onClick={props.onPlayAgain}>
                        Join a New Game
                    </button>
                    <button className="btn btn-secondary" onClick={props.handleClose}>
                        Close
                    </button>
                </div>
            </Modal.Body>
        </Modal>
    );
}
