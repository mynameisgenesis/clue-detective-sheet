import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Trash2, RotateCcw, Plus, Users } from "lucide-react";
import "./styles.css";

const suspects = [
  "Miss Scarlet",
  "Colonel Mustard",
  "Mr. Green",
  "Mrs. Peacock",
  "Professor Plum",
  "Dr. Orchid",
];
const weapons = [
  "Candlestick",
  "Dagger",
  "Lead Pipe",
  "Revolver",
  "Rope",
  "Wrench",
];
const rooms = [
  "Kitchen",
  "Ballroom",
  "Conservatory",
  "Dining Room",
  "Billiard Room",
  "Library",
  "Lounge",
  "Hall",
  "Study",
];
const statusCycle = ["", "❌", "?", "✅"];

function makeRows() {
  return [
    ...suspects.map((name) => ({ category: "Suspect", name })),
    ...weapons.map((name) => ({ category: "Weapon", name })),
    ...rooms.map((name) => ({ category: "Room", name })),
  ];
}

function loadSavedState() {
  try {
    const saved = localStorage.getItem("clue-detective-sheet");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function App() {
  const saved = loadSavedState();
  const [players, setPlayers] = useState(
    saved?.players || ["Me", "Player 2", "Player 3"],
  );
  const [newPlayer, setNewPlayer] = useState("");
  const [cells, setCells] = useState(saved?.cells || {});
  const [notes, setNotes] = useState(saved?.notes || {});
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    localStorage.setItem(
      "clue-detective-sheet",
      JSON.stringify({ players, cells, notes }),
    );
  }, [players, cells, notes]);

  const rows = useMemo(() => {
    const all = makeRows();
    return filter === "All"
      ? all
      : all.filter((row) => row.category === filter);
  }, [filter]);

  const updateCell = (rowName, player) => {
    const key = `${rowName}|${player}`;
    const current = cells[key] || "";
    const next =
      statusCycle[(statusCycle.indexOf(current) + 1) % statusCycle.length];
    setCells({ ...cells, [key]: next });
  };

  const addPlayer = () => {
    const trimmed = newPlayer.trim();
    if (!trimmed || players.includes(trimmed)) return;
    setPlayers([...players, trimmed]);
    setNewPlayer("");
  };

  const removePlayer = (player) => {
    setPlayers(players.filter((p) => p !== player));
    const nextCells = { ...cells };
    Object.keys(nextCells).forEach((key) => {
      if (key.endsWith(`|${player}`)) delete nextCells[key];
    });
    setCells(nextCells);
  };

  const resetBoard = () => {
    if (!confirm("Clear all marks and notes? The murder will remain unsolved."))
      return;
    setCells({});
    setNotes({});
  };

  const possibleCards = (category) =>
    makeRows()
      .filter((row) => row.category === category)
      .filter((row) => {
        const rowCells = players.map((p) => cells[`${row.name}|${p}`]);
        return rowCells.includes("✅") || !rowCells.includes("❌");
      });

  return (
    <main className="app-shell">
      <section className="hero card">
        <div>
          <p className="eyebrow">Tiny game-night spreadsheet</p>
          <h1>Clue Detective Sheet</h1>
          <p className="subtitle">
            Click cells to cycle: blank → ❌ ruled out → ? possible → ✅
            confirmed. Saves automatically in your browser.
          </p>
        </div>
        <div className="toolbar">
          {["All", "Suspect", "Weapon", "Room"].map((item) => (
            <button
              key={item}
              className={filter === item ? "button active" : "button"}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
          <button className="button danger" onClick={resetBoard}>
            <RotateCcw size={16} /> Reset
          </button>
        </div>
      </section>

      <section className="card players-card">
        <div className="players-title">
          <Users size={20} /> Players
        </div>
        <div className="add-player">
          <input
            value={newPlayer}
            onChange={(e) => setNewPlayer(e.target.value)}
            placeholder="Add player name"
            onKeyDown={(e) => e.key === "Enter" && addPlayer()}
          />
          <button className="button primary" onClick={addPlayer}>
            <Plus size={16} /> Add
          </button>
        </div>
      </section>

      <section className="sheet-wrap card">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Card</th>
                {players.map((player) => (
                  <th key={player}>
                    <span className="player-header">
                      {player}
                      {player !== "Me" && (
                        <button
                          className="icon-button"
                          onClick={() => removePlayer(player)}
                          title="Remove player"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </span>
                  </th>
                ))}
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.name}>
                  <td className="category">{row.category}</td>
                  <td className="card-name">{row.name}</td>
                  {players.map((player) => {
                    const key = `${row.name}|${player}`;
                    return (
                      <td key={key} className="mark-cell">
                        <button onClick={() => updateCell(row.name, player)}>
                          {cells[key] || ""}
                        </button>
                      </td>
                    );
                  })}
                  <td>
                    <input
                      className="note-input"
                      value={notes[row.name] || ""}
                      onChange={(e) =>
                        setNotes({ ...notes, [row.name]: e.target.value })
                      }
                      placeholder="Who showed what?"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="possibles">
        {["Suspect", "Weapon", "Room"].map((category) => (
          <div className="card possible-card" key={category}>
            <h2>Possible {category}s</h2>
            {possibleCards(category).map((row) => (
              <div className="pill" key={row.name}>
                {row.name}
              </div>
            ))}
          </div>
        ))}
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
