import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const TeamTable = () => {
    const [players, setPlayers] = useState([
        { id: 1, name: 'Тая', availability: Array(7).fill({ start: '', end: '' }) },
        { id: 2, name: 'Нолик', availability: Array(7).fill({ start: '', end: '' }) },
        { id: 3, name: 'Василий', availability: Array(7).fill({ start: '', end: '' }) },
        { id: 4, name: 'Давид', availability: Array(7).fill({ start: '', end: '' }) },
        { id: 5, name: 'Рома', availability: Array(7).fill({ start: '', end: '' }) },
        { id: 6, name: 'Денис', availability: Array(7).fill({ start: '', end: '' }) },
    ]);

    const [newPlayerName, setNewPlayerName] = useState(''); 

    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

    const generateTimeOptions = () => {
        const times = [];
        for (let hour = 8; hour <= 23; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                times.push(time);
            }
        }
        return times;
    };

    const timeOptions = generateTimeOptions();
    const handleAvailabilityChange = (playerId, dayIndex, field, value) => {
        const newPlayers = players.map(player => {
            if (player.id === playerId) {
                const newAvailability = [...player.availability];
                newAvailability[dayIndex] = { ...newAvailability[dayIndex], [field]: value };
                return { ...player, availability: newAvailability };
            }
            return player;
        });
        setPlayers(newPlayers);
    };

    const addPlayer = () => {
        if (!newPlayerName.trim()) {
            alert('Пожалуйста, введите имя игрока');
            return;
        }

        const newPlayer = {
            id: players.length + 1,
            name: newPlayerName,
            availability: Array(7).fill({ start: '', end: '' }),
        };
        setPlayers([...players, newPlayer]);
        setNewPlayerName(''); 
    };

    const removePlayer = (playerId) => {
        const newPlayers = players.filter(player => player.id !== playerId);
        setPlayers(newPlayers);
    };

    const timeToMinutes = (time) => {
        if (!time) return 0;
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    };

    const isTimeOverlap = (start1, end1, start2, end2) => {
        const start1Min = timeToMinutes(start1);
        const end1Min = timeToMinutes(end1);
        const start2Min = timeToMinutes(start2);
        const end2Min = timeToMinutes(end2);

        if (!start1Min || !end1Min || !start2Min || !end2Min) return false; 
        return start1Min < end2Min && start2Min < end1Min;
    };

    const getCellColor = (playerId, dayIndex) => {
        const player = players.find(p => p.id === playerId);
        const { start, end } = player.availability[dayIndex];

        if (!start || !end) return '';

        const overlappingPlayers = players.filter(p => {
            if (p.id === playerId) return false;
            const { start: pStart, end: pEnd } = p.availability[dayIndex];
            return isTimeOverlap(start, end, pStart, pEnd);
        }).length;

        if (overlappingPlayers >= 4) return 'bg-success'; 
        if (overlappingPlayers === 3) return 'bg-warning'; 
        return ''; 
    };

    const getDayHeaderColor = (dayIndex) => {
        const availablePlayers = players.filter(player => {
            const { start, end } = player.availability[dayIndex];
            return start && end;
        }).length;
        if (availablePlayers < 4) return 'bg-danger'; 
        return '';
    };

    return (
        <div className="container mt-5">
            <h1 className="text-center mb-4 text-primary">Расписание команды</h1>
            <div className="mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Введите имя нового игрока"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                />
                <button className="btn btn-primary mt-2" onClick={addPlayer}>
                    Добавить игрока
                </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table className="table table-bordered table-hover" style={{ minWidth: '800px' }}>
                    <thead>
                        <tr>
                            <th style={{ width: '150px' }}>Игрок</th>
                            {days.map((day, index) => (
                                <th key={index} className={`text-center ${getDayHeaderColor(index)}`}>
                                    {day}
                                </th>
                            ))}
                            <th style={{ width: '100px' }}>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {players.map(player => (
                            <tr key={player.id}>
                                <td>
                                    <div>{player.name}</div>
                                </td>
                                {player.availability.map((time, dayIndex) => (
                                    <td key={dayIndex} className={getCellColor(player.id, dayIndex)}>
                                        <div className="mb-2">
                                            <select
                                                className="form-select form-select-sm"
                                                value={time.start}
                                                onChange={(e) => handleAvailabilityChange(player.id, dayIndex, 'start', e.target.value)}
                                            >
                                                <option value="">Начало</option>
                                                {timeOptions.map((timeOption, index) => (
                                                    <option key={index} value={timeOption}>
                                                        {timeOption}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="mb-2">
                                            <select
                                                className="form-select form-select-sm"
                                                value={time.end}
                                                onChange={(e) => handleAvailabilityChange(player.id, dayIndex, 'end', e.target.value)}
                                            >
                                                <option value="">Конец</option>
                                                {timeOptions.map((timeOption, index) => (
                                                    <option key={index} value={timeOption}>
                                                        {timeOption}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </td>
                                ))}
                                <td>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => removePlayer(player.id)}
                                    >
                                        Удалить
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TeamTable;