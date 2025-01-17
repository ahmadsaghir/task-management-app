import React from 'react';
import { CircleCheck, Circle, Trash2, CalendarDays } from "lucide-react";
import { format, isToday, isTomorrow, isPast } from 'date-fns';

const TaskItems = ({ text, description, date, id, isComplete, deleteTask, toggle, openEditModal }) => {
    const dueDate = new Date(date);
    const formattedDate = format(dueDate, 'MMM d, yyyy h:mm a');

    let dateColor = "#64748B"; // Default color
    let dateText = formattedDate;

    if (isToday(dueDate)) {
        dateColor = "#6D70E0";
        dateText = "Today";
    } else if (isTomorrow(dueDate)) {
        dateColor = "#FFB22C";
        dateText = "Tomorrow";
    } else if (isPast(dueDate)) {
        dateColor = "#FF4C4C";
        dateText = "Overdue";
    }

    return (
        <div
            className="flex flex-col p-4 mb-4 border rounded-lg cursor-pointer dark:border-gray-700"
            style={{borderColor: '#e5e7eb'}}
            onClick={() => openEditModal({_id: id, text, description, date, isComplete})}
        >
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            toggle(id);
                        }}
                        className="cursor-pointer text-slate-700 dark:text-gray-300"
                    >
                        {isComplete ? <CircleCheck color="#6D70E0"/> : <Circle />}
                    </div>
                    <p className={`text-lg font-semibold ${isComplete ? 'line-through text-slate-500' : 'text-slate-700 dark:text-gray-200'}`}>
                        {text}
                    </p>
                </div>
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        deleteTask(id);
                    }}
                    className="cursor-pointer text-slate-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-500"
                >
                    <Trash2 />
                </div>
            </div>

            {!isComplete && (
                <>
                    <p className="mt-2 ml-8 text-slate-600 dark:text-gray-400">
                        {description}
                    </p>
                    <div className="flex items-center mt-3 ml-8 text-sm" style={{color: dateColor}}>
                        <CalendarDays className="w-4 h-4 mr-2"/>
                        <p>{dateText}</p>
                    </div>
                </>
            )}
        </div>
    );
};

export default TaskItems;