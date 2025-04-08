import React, { useState, useEffect } from "react";
import { getNotesByFolder, createNote, deleteNote } from "../api/data"; // Import deleteNote
import "./NoteList.css";

// Helper to get a plain text snippet
const getSnippet = (htmlContent) => {
	const tempDiv = document.createElement("div");
	tempDiv.innerHTML = htmlContent || "";
	return tempDiv.textContent || tempDiv.innerText || "";
};

function NoteList({ selectedFolderId, selectedNoteId, onSelectNote, onNotesUpdate }) {
	const [notes, setNotes] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isCreating, setIsCreating] = useState(false);

	const fetchNotes = async (folderId) => {
		if (!folderId) {
			setNotes([]);
			if (onNotesUpdate) onNotesUpdate([]); // Notify parent
			return;
		}
		setIsLoading(true);
		try {
			const fetchedNotes = await getNotesByFolder(folderId);
			setNotes(fetchedNotes);
			if (onNotesUpdate) onNotesUpdate(fetchedNotes); // Notify parent about notes list
			// If no note is selected, or selected note isn't in this folder, select the first note
			if (
				fetchedNotes.length > 0 &&
				(!selectedNoteId || !fetchedNotes.some((n) => n.id === selectedNoteId))
			) {
				if (onSelectNote) onSelectNote(fetchedNotes[0].id);
			} else if (fetchedNotes.length === 0) {
				if (onSelectNote) onSelectNote(null); // No notes in this folder
			}
		} catch (error) {
			console.error(`Failed to fetch notes for folder ${folderId}:`, error);
			setNotes([]); // Clear notes on error
			if (onNotesUpdate) onNotesUpdate([]);
			if (onSelectNote) onSelectNote(null);
		} finally {
			setIsLoading(false);
		}
	};

	// Fetch notes when the selected folder changes
	useEffect(() => {
		fetchNotes(selectedFolderId);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedFolderId]); // Dependency: selectedFolderId

	const handleCreateNote = async () => {
		if (!selectedFolderId) return; // Need a folder selected
		setIsCreating(true);
		try {
			const newNote = await createNote(selectedFolderId);
			// Refetch notes for the current folder to include the new one and re-sort
			await fetchNotes(selectedFolderId);
			if (onSelectNote) onSelectNote(newNote.id); // Select the newly created note
		} catch (error) {
			console.error("Failed to create note:", error);
		} finally {
			setIsCreating(false);
		}
	};

	const handleDeleteNote = async (noteIdToDelete, event) => {
		event.stopPropagation(); // Prevent note selection when clicking delete
		if (window.confirm(`Are you sure you want to delete this note?`)) {
			setIsLoading(true); // Use loading state for deletion
			try {
				await deleteNote(noteIdToDelete);
				await fetchNotes(selectedFolderId); // Refetch notes
				// Parent (DashboardPage) handles selecting a new note if needed
			} catch (error) {
				console.error("Failed to delete note:", error);
			} finally {
				setIsLoading(false);
			}
		}
	};

	return (
		<div className="note-list">
			<div className="note-list-header">
				<h3>Notes</h3>
				<button
					onClick={handleCreateNote}
					disabled={!selectedFolderId || isCreating || isLoading}
					title={!selectedFolderId ? "Select a folder first" : "Create New Note"}
				>
					{isCreating ? "Creating..." : "+ New Note"}
				</button>
			</div>

			{isLoading && <p>Loading notes...</p>}
			{!isLoading && !selectedFolderId && (
				<p className="placeholder-text">Select a folder to see notes.</p>
			)}
			{!isLoading && selectedFolderId && notes.length === 0 && (
				<p className="placeholder-text">No notes in this folder. Create one!</p>
			)}

			<ul>
				{notes.map((note) => (
					<li
						key={note.id}
						className={note.id === selectedNoteId ? "selected" : ""}
						onClick={() => onSelectNote(note.id)}
					>
						<div className="note-item-content">
							<h4>{note.title || "Untitled Note"}</h4>
							<p>{getSnippet(note.content).substring(0, 50)}...</p>{" "}
							{/* Show snippet */}
						</div>
						<button
							className="delete-note-btn"
							onClick={(e) => handleDeleteNote(note.id, e)}
							title="Delete Note"
						>
							×
						</button>
					</li>
				))}
			</ul>
		</div>
	);
}

export default NoteList;
