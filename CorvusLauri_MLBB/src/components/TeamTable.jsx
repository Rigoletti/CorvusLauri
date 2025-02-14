import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../style/TeamTable.css';

const TeamTable = () => {
    const [players, setPlayers] = useState([
        { id: 1, name: 'Тая', availability: Array(7).fill({ start: '', end: '', isDayOff: false }) },
        { id: 2, name: 'Нолик', availability: Array(7).fill({ start: '', end: '', isDayOff: false }) },
        { id: 3, name: 'Василий', availability: Array(7).fill({ start: '', end: '', isDayOff: false }) },
        { id: 4, name: 'Давид', availability: Array(7).fill({ start: '', end: '', isDayOff: false }) },
        { id: 5, name: 'Рома', availability: Array(7).fill({ start: '', end: '', isDayOff: false }) },
        { id: 6, name: 'Денис', availability: Array(7).fill({ start: '', end: '', isDayOff: false }) },
    ]);
    const [newPlayerName, setNewPlayerName] = useState('');
    const [error, setError] = useState('');

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
                if (field === 'start') {
                    newAvailability[dayIndex].end = '';
                }
                return { ...player, availability: newAvailability };
            }
            return player;
        });
        setPlayers(newPlayers);
    };

    const handleDayOffChange = (playerId, dayIndex, value) => {
        const newPlayers = players.map(player => {
            if (player.id === playerId) {
                const newAvailability = [...player.availability];
                newAvailability[dayIndex] = { ...newAvailability[dayIndex], isDayOff: value };
                if (value) {
                    newAvailability[dayIndex].start = '';
                    newAvailability[dayIndex].end = '';
                }
                return { ...player, availability: newAvailability };
            }
            return player;
        });
        setPlayers(newPlayers);
    };

    const addPlayer = () => {
        if (!newPlayerName.trim()) {
            setError('Введите имя игрока');
            return;
        }
        const newPlayer = {
            id: players.length + 1,
            name: newPlayerName,
            availability: Array(7).fill({ start: '', end: '', isDayOff: false }),
        };
        setPlayers([...players, newPlayer]);
        setNewPlayerName('');
        setError('');
    };

    const removePlayer = (playerId) => {
        const newPlayers = players.filter(player => player.id !== playerId);
        setPlayers(newPlayers);
    };

    const timeToMinutes = (time) => {
        if (!time) return null;
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    };

    const getMaxSimultaneousPlayers = (dayIndex) => {
        const intervals = players
            .map(player => player.availability[dayIndex])
            .filter(({ start, end, isDayOff }) => !isDayOff && start && end)
            .map(({ start, end }) => ({
                start: timeToMinutes(start),
                end: timeToMinutes(end),
            }));
        if (intervals.length === 0) return 0;
        const minTime = Math.min(...intervals.map(interval => interval.start));
        const maxTime = Math.max(...intervals.map(interval => interval.end));
        let maxCount = 0;
        for (let time = minTime; time <= maxTime; time += 30) {
            let currentCount = 0;
            intervals.forEach(interval => {
                if (interval.start <= time && time < interval.end) {
                    currentCount++;
                }
            });
            maxCount = Math.max(maxCount, currentCount);
        }
        return maxCount;
    };

    const getDayHeaderColor = (dayIndex) => {
        const maxSimultaneousPlayers = getMaxSimultaneousPlayers(dayIndex);
        if (maxSimultaneousPlayers >= 5) return 'bg-success'; 
        return 'bg-danger'; 
    };

    const getFilteredEndTimeOptions = (startTime) => {
        if (!startTime) return timeOptions;
        const startMinutes = timeToMinutes(startTime);
        return timeOptions.filter(time => timeToMinutes(time) > startMinutes);
    };

    return (
        <div className="container mt-5">
            <h1 className="text-center mb-4 text-primary fw-bold">Расписание команды</h1>
            <div className="mb-4">
                <div className="input-group">
                    <input
                        type="text"
                        className={`form-control ${error ? 'is-invalid' : ''}`}
                        placeholder="Введите имя нового игрока"
                        value={newPlayerName}
                        onChange={(e) => setNewPlayerName(e.target.value)}
                    />
                    <button className="btn btn-primary" onClick={addPlayer}>
                        Добавить игрока
                    </button>
                </div>
                {error && <div className="text-danger mt-2">{error}</div>}
            </div>
            <div className="table-responsive">
                <table className="table table-bordered table-hover table-striped small-table">
                    <thead className="table-dark">
                        <tr>
                            <th style={{ width: '150px' }}>Игрок</th>
                            {days.map((day, index) => (
                                <th key={index} className={`text-center ${getDayHeaderColor(index)}`} style={{ minWidth: '100px' }}>
                                    {day}
                                </th>
                            ))}
                            <th style={{ width: '100px' }}>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {players.map(player => (
                            <tr key={player.id}>
                                <td className="fw-bold">{player.name}</td>
                                {player.availability.map((time, dayIndex) => (
                                    <td key={dayIndex} className="align-middle" style={{ padding: '0.25rem' }}>
                                        <div className="d-flex flex-column gap-2" style={{ fontSize: '0.875rem' }}>
                                            {/* Чекбокс для выбора выходного дня */}
                                            <div className="form-check mb-2">
                                                <input 
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    checked={time.isDayOff}
                                                    onChange={(e) => handleDayOffChange(player.id, dayIndex, e.target.checked)}
                                                />
                                                <label className="form-check-label" style={{ fontSize: '0.875rem' }}>Выходной</label>
                                            </div>

                                            {/* Поля для выбора времени */}
                                            <select
                                                className="form-select form-select-sm"
                                                value={time.start}
                                                onChange={(e) => handleAvailabilityChange(player.id, dayIndex, 'start', e.target.value)}
                                                disabled={time.isDayOff}
                                                style={{ fontSize: '0.875rem' }}
                                            >
                                                <option value="">Начало</option>
                                                {timeOptions.map((timeOption, index) => (
                                                    <option key={index} value={timeOption}>
                                                        {timeOption}
                                                    </option>
                                                ))}
                                            </select>
                                            <select
                                                className="form-select form-select-sm"
                                                value={time.end}
                                                onChange={(e) => handleAvailabilityChange(player.id, dayIndex, 'end', e.target.value)}
                                                disabled={time.isDayOff}
                                                style={{ fontSize: '0.875rem' }}
                                            >
                                                <option value="">Конец</option>
                                                {getFilteredEndTimeOptions(time.start).map((timeOption, index) => (
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
                                        className="btn btn-danger btn-sm w-100"
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