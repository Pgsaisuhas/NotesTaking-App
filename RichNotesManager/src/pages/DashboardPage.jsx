import React, { useState, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import NoteList from "../components/NoteList";
import NoteEditor from "../components/NoteEditor";
import { useAuth } from "../contexts/AuthContext";
// import "./DashboardPage.css"; 

function DashboardPage() {
	const [selectedFolderId, setSelectedFolderId] = useState(null);
	const [selectedNoteId, setSelectedNoteId] = useState(null);
	// Keep track of the full lists to potentially pass down or use for logic
	const [folders, setFolders] = useState([]);
	const [notes, setNotes] = useState([]);

	const { user, logout, loading: authLoading } = useAuth();

	const handleSelectFolder = (folderId) => {
		setSelectedFolderId(folderId);
		setSelectedNoteId(null); // Reset note selection when folder changes
	};

	const handleSelectNote = (noteId) => {
		setSelectedNoteId(noteId);
	};

	// Callback when Sidebar fetches/updates folders
	const handleFoldersUpdate = useCallback(
		(updatedFolders) => {
			setFolders(updatedFolders);
			// Logic if the selected folder was deleted
			if (selectedFolderId && !updatedFolders.some((f) => f.id === selectedFolderId)) {
				setSelectedFolderId(updatedFolders.length > 0 ? updatedFolders[0].id : null);
				setSelectedNoteId(null);
			} else if (!selectedFolderId && updatedFolders.length > 0) {
				// Select the first folder if none was selected initially
				setSelectedFolderId(updatedFolders[0].id);
			}
		},
		[selectedFolderId]
	); // Dependency needed

	// Callback when NoteList fetches/updates notes
	const handleNotesUpdate = useCallback(
		(updatedNotes) => {
			setNotes(updatedNotes);
			// Logic if the selected note was deleted
			if (selectedNoteId && !updatedNotes.some((n) => n.id === selectedNoteId)) {
				setSelectedNoteId(updatedNotes.length > 0 ? updatedNotes[0].id : null);
			} else if (!selectedNoteId && updatedNotes.length > 0 && !selectedNoteId) {
				// Select the first note if none was selected initially (already handled partly in NoteList)
				// This might be redundant depending on NoteList's logic, but safe to have
				// setSelectedNoteId(updatedNotes[0].id);
			}
		},
		[selectedNoteId]
	); // Dependency needed

	// Callback when a note is updated in the editor (e.g., for re-sorting list)
	const handleNoteUpdate = useCallback((updatedNote) => {
		// Find the note in the current list and update it
		setNotes((prevNotes) => {
			const index = prevNotes.findIndex((n) => n.id === updatedNote.id);
			if (index !== -1) {
				const newNotes = [...prevNotes];
				newNotes[index] = updatedNote;
				// Re-sort notes by lastModified date (most recent first)
				return newNotes.sort((a, b) => b.lastModified - a.lastModified);
			}
			return prevNotes; // Should not happen if update was successful
		});
		// No need to re-select the note, it's already selected
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
					// Pass the current notes list if NoteList needs it for immediate updates
					// (Current implementation refetches, so not strictly needed here)
					// currentNotes={notes}
				/>
				<NoteEditor
					selectedNoteId={selectedNoteId}
					key={selectedNoteId} // Force re-render/remount when note changes
					onNoteUpdate={handleNoteUpdate}
				/>
			</div>
		</div>
	);
}

export default DashboardPage;
