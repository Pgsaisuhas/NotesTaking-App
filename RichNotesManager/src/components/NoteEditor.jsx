import React, { useState, useEffect, useCallback } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import Quill styles
import { getNoteById, updateNote } from "../api/data";
import "./NoteEditor.css";
import debounce from "lodash.debounce"; // Install: npm install lodash.debounce

function NoteEditor({ selectedNoteId, onNoteUpdate }) {
	const [currentNote, setCurrentNote] = useState(null);
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState(null);
	const [lastSaved, setLastSaved] = useState(null);

	// Debounced save function
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const debouncedSave = useCallback(
		debounce(async (noteId, newTitle, newContent) => {
			if (!noteId) return;
			setIsSaving(true);
			setError(null);
			try {
				const updatedNote = await updateNote(noteId, newTitle, newContent);
				// Update parent component about the change (e.g., for sorting NoteList)
				if (onNoteUpdate) onNoteUpdate(updatedNote);
				setLastSaved(new Date());
				// Optionally update local state again if backend returns slightly different data (like lastModified)
				// setCurrentNote(updatedNote);
				// setTitle(updatedNote.title);
				// setContent(updatedNote.content);
			} catch (err) {
				console.error("Failed to save note:", err);
				setError("Failed to save note. Please try again.");
				// Optionally: Revert changes or notify user more prominently
			} finally {
				setIsSaving(false);
			}
		}, 1500), // Adjust debounce time (in ms) as needed (e.g., 1.5 seconds)
		[onNoteUpdate] // Dependency for useCallback
	);

	// Fetch note details when selectedNoteId changes
	useEffect(() => {
		if (!selectedNoteId) {
			setCurrentNote(null);
			setTitle("");
			setContent("");
			setError(null);
			setLastSaved(null);
			return;
		}

		setIsLoading(true);
		setError(null);
		setLastSaved(null);
		getNoteById(selectedNoteId)
			.then((noteData) => {
				setCurrentNote(noteData);
				setTitle(noteData.title);
				setContent(noteData.content);
				setLastSaved(new Date(noteData.lastModified)); // Show last known save time
			})
			.catch((err) => {
				console.error("Failed to fetch note:", err);
				setError("Could not load the selected note.");
				setCurrentNote(null);
				setTitle("");
				setContent("");
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, [selectedNoteId]);

	// Handle title changes
	const handleTitleChange = (e) => {
		const newTitle = e.target.value;
		setTitle(newTitle);
		if (currentNote) {
			debouncedSave(currentNote.id, newTitle, content);
		}
	};

	// Handle content changes from ReactQuill
	const handleContentChange = (newContent) => {
		setContent(newContent);
		if (currentNote) {
			debouncedSave(currentNote.id, title, newContent);
		}
	};

	// Quill modules configuration (optional, customize as needed)
	const quillModules = {
		toolbar: [
			[{ header: [1, 2, 3, false] }],
			["bold", "italic", "underline", "strike", "blockquote"],
			[{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
			["link" /*'image'*/], // Image upload requires more setup
			["clean"],
		],
	};

	const quillFormats = [
		"header",
		"bold",
		"italic",
		"underline",
		"strike",
		"blockquote",
		"list",
		"bullet",
		"indent",
		"link" /*'image'*/,
	];

	if (isLoading) {
		return <div className="note-editor placeholder">Loading note...</div>;
	}

	if (!selectedNoteId || !currentNote) {
		return <div className="note-editor placeholder">Select a note to start editing.</div>;
	}

	return (
		<div className="note-editor">
			{error && <p className="error-message">{error}</p>}
			<div className="editor-header">
				<input
					type="text"
					className="note-title-input"
					value={title}
					onChange={handleTitleChange}
					placeholder="Note Title"
				/>
				<span className="save-status">
					{isSaving
						? "Saving..."
						: lastSaved
						? `Saved: ${lastSaved.toLocaleTimeString()}`
						: ""}
				</span>
			</div>

			<ReactQuill
				theme="snow" // or "bubble"
				value={content}
				onChange={handleContentChange}
				modules={quillModules}
				formats={quillFormats}
				placeholder="Start writing your amazing note..."
			/>
		</div>
	);
}

export default NoteEditor;
