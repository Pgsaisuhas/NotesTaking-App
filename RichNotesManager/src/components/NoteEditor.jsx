import React, { useState, useEffect, useCallback } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { getNoteById, updateNote } from "../api/data";
import debounce from "lodash.debounce";

function NoteEditor({ selectedNoteId, onNoteUpdate, onTitleChange }) {
	const [currentNote, setCurrentNote] = useState(null);
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState(null);
	const [lastSaved, setLastSaved] = useState(null);

	const debouncedSave = useCallback(
		debounce(async (noteId, newTitle, newContent) => {
			if (!noteId) return;
			setIsSaving(true);
			setError(null);
			try {
				const updatedNote = await updateNote(noteId, newTitle, newContent);
				if (onNoteUpdate) onNoteUpdate(updatedNote);
				setLastSaved(new Date());
			} catch (err) {
				console.error("Failed to save note:", err);
				setError("Failed to save note. Please try again.");
			} finally {
				setIsSaving(false);
			}
		}, 1500),
		[onNoteUpdate]
	);

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
				setLastSaved(new Date(noteData.lastModified));
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

	const handleTitleChange = (e) => {
		const newTitle = e.target.value;
		setTitle(newTitle);
		if (onTitleChange) onTitleChange(newTitle); // Notify parent about title change
		if (currentNote) {
			debouncedSave(currentNote.id, newTitle, content);
		}
	};

	const handleContentChange = (newContent) => {
		setContent(newContent);
		if (currentNote) {
			debouncedSave(currentNote.id, title, newContent);
		}
	};

	const quillModules = {
		toolbar: [
			[{ header: [1, 2, 3, false] }],
			["bold", "italic", "underline", "strike", "blockquote"],
			[{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
			["link"],
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
		"link",
	];

	if (isLoading) {
		return <div className="text-muted p-3">Loading note...</div>;
	}

	if (!selectedNoteId || !currentNote) {
		return <div className="text-muted p-3">Select a note to start editing.</div>;
	}

	return (
		<div className="p-3">
			{error && <div className="alert alert-danger">{error}</div>}

			<div className="d-flex justify-content-between align-items-center mb-2">
				<input
					type="text"
					className="form-control me-3"
					style={{ flex: 1 }}
					value={title}
					onChange={handleTitleChange}
					placeholder="Note Title"
				/>
				<small className="text-muted">
					{isSaving
						? "Saving..."
						: lastSaved
						? `Saved: ${lastSaved.toLocaleTimeString()}`
						: ""}
				</small>
			</div>

			<ReactQuill
				theme="snow"
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
