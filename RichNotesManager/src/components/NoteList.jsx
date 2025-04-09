import React, { useState, useEffect } from "react";
import { getNotesByFolder, createNote, deleteNote } from "../api/data";
// import "./NoteList.css";

// const getSnippet = (htmlContent) => {
// 	const tempDiv = document.createElement("div");
// 	tempDiv.innerHTML = htmlContent || "";
// 	return tempDiv.textContent || tempDiv.innerText || "";
// };

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

		const noteTitle = window.prompt("Enter note title:");
		if (!noteTitle) return;

		setIsCreating(true);
		try {
			const newNote = await createNote(selectedFolderId, noteTitle); // Pass the title to the function
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
		<div
			className="d-flex flex-column h-100"
			style={{ backgroundColor: "#1a202c", color: "#edf2f7", padding: "16px" }}
		>
			<div className="d-flex justify-content-between align-items-center mb-3">
				<h5 className="mb-0" style={{ color: "#edf2f7" }}>
					Notes
				</h5>
				<button
					onClick={handleCreateNote}
					className="btn btn-sm"
					style={{
						backgroundColor: "#38a169",
						color: "white",
						cursor: !selectedFolderId ? "not-allowed" : "pointer",
						opacity: !selectedFolderId || isCreating || isLoading ? 0.6 : 1,
					}}
					disabled={!selectedFolderId || isCreating || isLoading}
					title={!selectedFolderId ? "Select a folder first" : "Create New Note"}
				>
					{isCreating ? "Creating..." : "+ New Note"}
				</button>
			</div>
			<hr/>

			{isLoading && <p className="text-muted">Loading notes...</p>}
			{!isLoading && !selectedFolderId && (
				<p style={{ color: "#a0aec0" }}>Select a folder to see notes.</p>
			)}
			{!isLoading && selectedFolderId && notes.length === 0 && (
				<p style={{ color: "#a0aec0" }}>No notes in this folder. Create one!</p>
			)}

			<ul className="list-group flex-grow-1 overflow-auto" style={{ gap: "8px" }}>
				{notes.map((note) => {
					const isSelected = note.id === selectedNoteId;
					return (
						<li
							key={note.id}
							className="list-group-item d-flex justify-content-between align-items-start"
							onClick={() => handleNoteSelect(note.id)}
							style={{
								cursor: "pointer",
								backgroundColor: isSelected ? "#2b6cb0" : "#1a202c",
								color: isSelected ? "#bee3f8" : "#edf2f7",
								border: "1px solid #2d3748",
								borderRadius: "6px",
								padding: "10px 12px",
								transition: "background-color 0.2s ease",
							}}
							onMouseOver={(e) => {
								if (!isSelected) e.currentTarget.style.backgroundColor = "#2d3748";
							}}
							onMouseOut={(e) => {
								if (!isSelected) e.currentTarget.style.backgroundColor = "#1a202c";
							}}
						>
							<div className="me-2">
								<div className="fw-bold">{note.title || "Untitled Note"}</div>
							</div>
							<button
								className="btn btn-sm"
								style={{
									backgroundColor: isSelected ? "#bee3f8" : "transparent",
									color: isSelected ? "#1a202c" : "#feb2b2",
									border: isSelected ? "none" : "1px solid #feb2b2",
									borderRadius: "4px",
									transition: "all 0.2s ease",
								}}
								onClick={(e) => handleDeleteNote(note.id, e)}
								title="Delete Note"
							>
								×
							</button>
						</li>
					);
				})}
			</ul>
		</div>
	);

}

export default NoteList;
