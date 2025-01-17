import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, MoreVertical, X, GripHorizontal, ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const TodoBoard = () => {
    const [board, setBoard] = useState(null);
    const [columns, setColumns] = useState([]);
    const [isAddingCard, setIsAddingCard] = useState({ columnId: null, value: '' });
    const [isAddingColumn, setIsAddingColumn] = useState(false);
    const [newColumnTitle, setNewColumnTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { boardId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, [boardId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            console.log('Fetching data for boardId:', boardId);

            const boardRes = await axios.get(`http://localhost:5005/api/boards/${boardId}`);
            console.log('Board data:', boardRes.data);

            const columnsRes = await axios.get(`http://localhost:5005/api/columns?boardId=${boardId}`);
            console.log('Columns data:', columnsRes.data);

            setBoard(boardRes.data);

            if (columnsRes.data.length === 0) {
                // If no columns exist, create a default one
                const defaultColumn = await axios.post('http://localhost:5005/api/columns', {
                    title: 'To Do',
                    boardId: boardId
                });
                console.log('Created default column:', defaultColumn.data);
                setColumns([{ ...defaultColumn.data, items: [] }]);
            } else {
                const todosRes = await axios.get(`http://localhost:5005/api/todos?boardId=${boardId}`);
                console.log('Todos data:', todosRes.data);

                const columnsWithTodos = columnsRes.data.map(column => ({
                    ...column,
                    items: todosRes.data
                        .filter(todo => todo.columnId === column._id)
                        .sort((a, b) => a.order - b.order)
                }));

                console.log('Final columns with todos:', columnsWithTodos);
                setColumns(columnsWithTodos);
            }

            setLoading(false);
        } catch (error) {
            console.error('Full error:', error);
            setError('Failed to load board');
            setLoading(false);
        }
    };

    const onDragEnd = async (result) => {
        if (!result.destination) return;

        const { source, destination, type } = result;

        if (type === 'column') {
            const reorderedColumns = Array.from(columns);
            const [removed] = reorderedColumns.splice(source.index, 1);
            reorderedColumns.splice(destination.index, 0, removed);

            setColumns(reorderedColumns);

            try {
                await axios.patch(`http://localhost:5005/api/columns/reorder/${boardId}/batch`, {
                    columns: reorderedColumns.map(col => ({ _id: col._id }))
                });
            } catch (error) {
                console.error('Error reordering columns:', error);
                fetchData(); // Refetch data if the update fails
            }
            return;
        }

        // Handle card reordering
        const sourceColumn = columns.find(col => col._id === source.droppableId);
        const destColumn = columns.find(col => col._id === destination.droppableId);
        const draggedItem = sourceColumn.items[source.index];

        if (source.droppableId === destination.droppableId) {
            // Same column
            const newItems = Array.from(sourceColumn.items);
            newItems.splice(source.index, 1);
            newItems.splice(destination.index, 0, draggedItem);

            const newColumns = columns.map(col =>
                col._id === sourceColumn._id ? { ...col, items: newItems } : col
            );
            setColumns(newColumns);
        } else {
            // Different columns
            const sourceItems = Array.from(sourceColumn.items);
            const destItems = Array.from(destColumn.items);
            sourceItems.splice(source.index, 1);
            destItems.splice(destination.index, 0, draggedItem);

            const newColumns = columns.map(col => {
                if (col._id === sourceColumn._id) return { ...col, items: sourceItems };
                if (col._id === destColumn._id) return { ...col, items: destItems };
                return col;
            });
            setColumns(newColumns);
        }

        try {
            await axios.patch(`http://localhost:5005/api/todos/${draggedItem._id}`, {
                columnId: destination.droppableId,
                order: destination.index
            });
        } catch (error) {
            console.error('Error updating todo:', error);
            fetchData();
        }
    };

    const handleAddCard = async (columnId) => {
        if (isAddingCard.value.trim()) {
            try {
                const response = await axios.post('http://localhost:5005/api/todos', {
                    content: isAddingCard.value,
                    columnId: columnId,
                    boardId: boardId
                });

                const newColumns = columns.map(col => {
                    if (col._id === columnId) {
                        return {
                            ...col,
                            items: [...col.items, response.data]
                        };
                    }
                    return col;
                });

                setColumns(newColumns);
                setIsAddingCard({ columnId: null, value: '' });
            } catch (error) {
                console.error('Error adding todo:', error);
            }
        }
    };

    const handleDeleteCard = async (columnId, cardId) => {
        try {
            await axios.delete(`http://localhost:5005/api/todos/${cardId}`);

            const newColumns = columns.map(col => {
                if (col._id === columnId) {
                    return {
                        ...col,
                        items: col.items.filter(item => item._id !== cardId)
                    };
                }
                return col;
            });

            setColumns(newColumns);
        } catch (error) {
            console.error('Error deleting todo:', error);
        }
    };

    const handleAddColumn = async () => {
        if (newColumnTitle.trim()) {
            try {
                const response = await axios.post('http://localhost:5005/api/columns', {
                    title: newColumnTitle,
                    boardId: boardId,
                    order: columns.length
                });

                setColumns([...columns, { ...response.data, items: [] }]);
                setNewColumnTitle('');
                setIsAddingColumn(false);
            } catch (error) {
                console.error('Error adding column:', error);
            }
        }
    };

    const handleDeleteColumn = async (columnId) => {
        try {
            await axios.delete(`http://localhost:5005/api/columns/${columnId}`);
            setColumns(columns.filter(col => col._id !== columnId));
        } catch (error) {
            console.error('Error deleting column:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                Loading...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen text-red-500">
                {error}
            </div>
        );
    }

    return (
        <div className="bg-white w-full min-h-screen p-7">
            <div className="flex items-center justify-between mt-7 mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/todos')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-3xl font-semibold">{board?.title}</h1>
                </div>

                {isAddingColumn ? (
                    <div className="flex gap-2 items-center">
                        <input
                            type="text"
                            value={newColumnTitle}
                            onChange={(e) => setNewColumnTitle(e.target.value)}
                            placeholder="Enter column title"
                            className="border p-2 rounded"
                            autoFocus
                        />
                        <button
                            onClick={handleAddColumn}
                            className="bg-[#6D70E0] text-white px-4 py-2 rounded"
                        >
                            Add
                        </button>
                        <button
                            onClick={() => {
                                setIsAddingColumn(false);
                                setNewColumnTitle('');
                            }}
                            className="bg-gray-200 px-4 py-2 rounded"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsAddingColumn(true)}
                        className="bg-[#6D70E0] text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <Plus /> Add Column
                    </button>
                )}
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="board" type="column" direction="horizontal">
                    {(provided) => (
                        <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="flex gap-6 overflow-x-auto pb-4 p-4 rounded-lg min-h-screen"
                        >
                            {columns.map((column, index) => (
                                <Draggable
                                    key={column._id}
                                    draggableId={column._id}
                                    index={index}
                                >
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className="bg-gray-100 p-4 rounded-lg min-w-[300px] h-fit max-h-[80vh] flex flex-col"
                                        >
                                            <div
                                                className="flex items-center justify-between mb-4"
                                                {...provided.dragHandleProps}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <GripHorizontal size={16} className="text-gray-400"/>
                                                    <h2 className="font-semibold">{column.title}</h2>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteColumn(column._id)}
                                                    className="text-gray-400 hover:text-red-500"
                                                >
                                                    <X size={16}/>
                                                </button>
                                            </div>

                                            <Droppable droppableId={column._id}>
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.droppableProps}
                                                        className="overflow-y-auto flex-1 scrollbar-hide"
                                                    >
                                                        {column.items.map((item, index) => (
                                                            <Draggable
                                                                key={item._id}
                                                                draggableId={item._id}
                                                                index={index}
                                                            >
                                                                {(provided) => (
                                                                    <div
                                                                        ref={provided.innerRef}
                                                                        {...provided.draggableProps}
                                                                        {...provided.dragHandleProps}
                                                                        className="bg-white p-3 rounded-lg shadow-sm mb-2 flex justify-between items-start"
                                                                    >
                                                                        <span className="text-sm">{item.content}</span>
                                                                        <button
                                                                            onClick={() => handleDeleteCard(column._id, item._id)}
                                                                            className="text-gray-400 hover:text-red-500"
                                                                        >
                                                                            <X size={14}/>
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </Draggable>
                                                        ))}
                                                        {provided.placeholder}

                                                        {isAddingCard.columnId === column._id ? (
                                                            <div className="mt-2">
                                                                <textarea
                                                                    autoFocus
                                                                    value={isAddingCard.value}
                                                                    onChange={(e) => setIsAddingCard({
                                                                        ...isAddingCard,
                                                                        value: e.target.value
                                                                    })}
                                                                    onKeyDown={async (e) => {
                                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                                            e.preventDefault();
                                                                            await handleAddCard(column._id);
                                                                            // Keep focus in the same column and clear the input
                                                                            setIsAddingCard({
                                                                                columnId: column._id,
                                                                                value: ''
                                                                            });
                                                                        }
                                                                    }}
                                                                    placeholder="Enter a title for this card..."
                                                                    className="w-full p-2 border rounded resize-none focus:outline-none focus:border-[#6D70E0]"
                                                                    rows="2"
                                                                />
                                                                <div className="flex gap-2 mt-2">
                                                                    <button
                                                                        onClick={() => handleAddCard(column._id)}
                                                                        className="px-3 py-1 bg-[#6D70E0] text-white rounded text-sm"
                                                                    >
                                                                        Add Card
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setIsAddingCard({
                                                                            columnId: null,
                                                                            value: ''
                                                                        })}
                                                                        className="px-3 py-1 bg-gray-200 rounded text-sm"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => setIsAddingCard({
                                                                    columnId: column._id,
                                                                    value: ''
                                                                })}
                                                                className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mt-2 text-sm"
                                                            >
                                                                <Plus size={16}/>
                                                                Add a card
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </Droppable>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
};

export default TodoBoard;