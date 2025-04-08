import React, { useState, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import NoteList from "../components/NoteList";
import NoteEditor from "../components/NoteEditor";
import { useAuth } from "../contexts/AuthContext";
import "./DashboardPage.css";

function DashboardPage() {
	const [selectedFolderId, setSelectedFolderId] = useState(null);
	const [selectedNoteId, setSelectedNoteId] = useState(null);
	const [folders, setFolders] = useState([]);
	const [notes, setNotes] = useState([]);

	const { user, logout, loading: authLoading } = useAuth();

	const handleSelectFolder = (folderId) => {
		setSelectedFolderId(folderId);
		setSelectedNoteId(null);
	};

	const handleSelectNote = (noteId) => {
		setSelectedNoteId(noteId);
	};

	const handleFoldersUpdate = useCallback(
		(updatedFolders) => {
			setFolders(updatedFolders);
			if (selectedFolderId && !updatedFolders.some((f) => f.id === selectedFolderId)) {
				setSelectedFolderId(updatedFolders.length > 0 ? updatedFolders[0].id : null);
				setSelectedNoteId(null);
			} else if (!selectedFolderId && updatedFolders.length > 0) {
				setSelectedFolderId(updatedFolders[0].id);
			}
		},
		[selectedFolderId]
	);

	const handleNotesUpdate = useCallback((updatedNotes) => {
		setNotes(updatedNotes);
	}, []);

	const handleNoteUpdate = useCallback((updatedNote) => {
		setNotes((prevNotes) =>
			prevNotes.map((note) => (note.id === updatedNote.id ? updatedNote : note))
		);
	}, []);

	return (
		<div className="dashboard-container">
			<header className="dashboard-header">
				<h1>My Notes App</h1>
				<div className="user-info">
					<span>Welcome, {user?.username || "User"}!</span>
					<button onClick={logout} disabled={authLoading}>
						{authLoading ? "Logging out..." : "Logout"}
					</button>
				</div>
			</header>
			<div className="dashboard-main">
				<Sidebar
					selectedFolderId={selectedFolderId}
					onSelectFolder={handleSelectFolder}
					onFoldersUpdate={handleFoldersUpdate}
				/>
				<NoteList
					selectedFolderId={selectedFolderId}
					selectedNoteId={selectedNoteId}
					onSelectNote={handleSelectNote}
					onNotesUpdate={handleNotesUpdate}
				/>
				<NoteEditor
					selectedNoteId={selectedNoteId}
					key={selectedNoteId}
					onNoteUpdate={handleNoteUpdate}
				/>
			</div>
		</div>
	);
}

export default DashboardPage; 