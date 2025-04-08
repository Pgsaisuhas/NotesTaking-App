import React, { useState, useEffect } from "react";
import { getNotesByFolder, createNote, deleteNote } from "../api/data";
import NoteEditor from "./NoteEditor";

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
			onNotesUpdate?.([]);
			return;
		}
		setIsLoading(true);
		try {
			const fetchedNotes = await getNotesByFolder(folderId);
			setNotes(fetchedNotes);
			onNotesUpdate?.(fetchedNotes);

			if (
				fetchedNotes.length > 0 &&
				(!selectedNoteId || !fetchedNotes.some((n) => n.id === selectedNoteId))
			) {
				onSelectNote?.(fetchedNotes[0].id);
			} else if (fetchedNotes.length === 0) {
				onSelectNote?.(null);
			}
		} catch (error) {
			console.error(`Failed to fetch notes for folder ${folderId}:`, error);
			setNotes([]);
			onNotesUpdate?.([]);
			onSelectNote?.(null);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchNotes(selectedFolderId);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedFolderId]);

	const handleCreateNote = async () => {
		if (!selectedFolderId) return;
		setIsCreating(true);
		try {
			const newNote = await createNote(selectedFolderId);
			await fetchNotes(selectedFolderId);
			onSelectNote?.(newNote.id);
		} catch (error) {
			console.error("Failed to create note:", error);
		} finally {
			setIsCreating(false);
		}
	};

	const handleDeleteNote = async (noteIdToDelete, event) => {
		event.stopPropagation();
		if (window.confirm("Are you sure you want to delete this note?")) {
			setIsLoading(true);
			try {
				await deleteNote(noteIdToDelete);
				await fetchNotes(selectedFolderId);
			} catch (error) {
				console.error("Failed to delete note:", error);
			} finally {
				setIsLoading(false);
			}
		}
	};

	const handleNoteSelect = (noteId) => {
		onSelectNote?.(noteId);
	};

	const handleTitleChange = (newTitle) => {
		setNotes((prevNotes) =>
			prevNotes.map((note) =>
				note.id === selectedNoteId ? { ...note, title: newTitle } : note
			)
		);
	};

	return (
		<div className="d-flex flex-column h-100">
			<div className="d-flex justify-content-between align-items-center mb-3">
				<h5 className="mb-0">Notes</h5>
				<button
					onClick={handleCreateNote}
					className="btn btn-sm btn-success"
					disabled={!selectedFolderId || isCreating || isLoading}
					title={!selectedFolderId ? "Select a folder first" : "Create New Note"}
				>
					{isCreating ? "Creating..." : "+ New Note"}
				</button>
			</div>

			{isLoading && <p>Loading notes...</p>}
			{!isLoading && !selectedFolderId && (
				<p className="text-muted">Select a folder to see notes.</p>
			)}
			{!isLoading && selectedFolderId && notes.length === 0 && (
				<p className="text-muted">No notes in this folder. Create one!</p>
			)}

			<ul className="list-group flex-grow-1 overflow-auto">
				{notes.map((note) => (
					<li
						key={note.id}
						className={`list-group-item d-flex justify-content-between align-items-start ${
							note.id === selectedNoteId ? "active text-white" : ""
						}`}
						onClick={() => handleNoteSelect(note.id)}
						style={{ cursor: "pointer" }}
					>
						<div className="me-2">
							<div className="fw-bold">{note.title || "Untitled Note"}</div>
							<small>{getSnippet(note.content).substring(0, 50)}...</small>
						</div>
						<button
							className={`btn btn-sm ${
								note.id === selectedNoteId ? "btn-light" : "btn-outline-danger"
							}`}
							onClick={(e) => handleDeleteNote(note.id, e)}
							title="Delete Note"
						>
							×
						</button>
					</li>
				))}
			</ul>
			{/* <div className="note-editor">
				<NoteEditor
					selectedNoteId={selectedNoteId}
					onTitleChange={handleTitleChange}
				/>
			</div> */}
		</div>
	);
}

export default NoteList;
