import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import axios from 'axios';

const BoardsList = () => {
    const [boards, setBoards] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newBoardTitle, setNewBoardTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchBoards();
    }, []);

    const fetchBoards = async () => {
        try {
            const response = await axios.get('http://localhost:5005/api/boards');
            setBoards(response.data);
            setLoading(false);
        } catch (error) {
            setError('Failed to load boards');
            setLoading(false);
        }
    };

    const handleCreateBoard = async () => {
        if (newBoardTitle.trim()) {
            try {
                const response = await axios.post('http://localhost:5005/api/boards', {
                    title: newBoardTitle,
                    description: ''
                });

                setBoards([response.data, ...boards]);
                setNewBoardTitle('');
                setIsCreating(false);
                navigate(`/todos/board/${response.data._id}`);
            } catch (error) {
                setError('Failed to create board');
            }
        }
    };

    const handleDeleteBoard = async (boardId, e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this board?')) {
            try {
                await axios.delete(`http://localhost:5005/api/boards/${boardId}`);
                setBoards(boards.filter(board => board._id !== boardId));
            } catch (error) {
                setError('Failed to delete board');
            }
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
    }

    return (
        <div className="bg-white w-full min-h-screen p-7">
            <div className="flex items-center justify-between mt-7 mb-6">
                <h1 className="text-3xl font-semibold">My Boards</h1>
                {isCreating ? (
                    <div className="flex gap-2 items-center">
                        <input
                            type="text"
                            value={newBoardTitle}
                            onChange={(e) => setNewBoardTitle(e.target.value)}
                            placeholder="Enter board title"
                            className="border p-2 rounded"
                            autoFocus
                        />
                        <button
                            onClick={handleCreateBoard}
                            className="bg-[#6D70E0] text-white px-4 py-2 rounded"
                        >
                            Create
                        </button>
                        <button
                            onClick={() => {
                                setIsCreating(false);
                                setNewBoardTitle('');
                            }}
                            className="bg-gray-200 px-4 py-2 rounded"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="bg-[#6D70E0] text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <Plus /> Create Board
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {boards.map(board => (
                    <div
                        key={board._id}
                        onClick={() => navigate(`/todos/board/${board._id}`)}
                        className="bg-gray-50 p-6 rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                    >
                        <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-lg">{board.title}</h3>
                            <button
                                onClick={(e) => handleDeleteBoard(board._id, e)}
                                className="text-gray-400 hover:text-red-500"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <p className="text-gray-500 text-sm mt-2">
                            Created {new Date(board.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BoardsList;