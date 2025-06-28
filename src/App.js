import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PlayVsAI from './components/PlayVsAI';
import 'react-toastify/dist/ReactToastify.css';
import './App.scss';

function App() {
    return (
        <div>
            <Router>
                <Routes>
                    <Route path="/" element={<PlayVsAI />} />
                   
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </div>
    );
}

export default App;
