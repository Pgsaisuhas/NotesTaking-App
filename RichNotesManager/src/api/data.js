import { v4 as uuidv4 } from "uuid";

// Simulate API latency
const LATENCY = 300;

// In-memory store to simulate a database for the demo
let folders = [
	{ id: "folder-1", name: "Personal" },
	{ id: "folder-2", name: "Work" },
];

let notes = [
	{
		id: "note-1",
		folderId: "folder-1",
		title: "Grocery List",
		content: "<p>Milk, Bread, Eggs</p>",
		lastModified: Date.now(),
	},
	{
		id: "note-2",
		folderId: "folder-2",
		title: "Meeting Notes",
		content: "<p>Discuss project <strong>Alpha</strong>.</p>",
		lastModified: Date.now() - 100000,
	},
	{
		id: "note-3",
		folderId: "folder-1",
		title: "Ideas",
		content:
			"<p><em>Brainstorm new app ideas.</em></p><ul><li>Note taking app</li><li>Budget tracker</li></ul>",
		lastModified: Date.now() - 200000,
	},
];

// --- Folder API ---

export const getFolders = async () => {
	console.log("API: Fetching folders");
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve([...folders]); // Return a copy
		}, LATENCY);
	});
};

export const createFolder = async (name) => {
	console.log(`API: Creating folder "${name}"`);
	return new Promise((resolve) => {
		setTimeout(() => {
			const newFolder = { id: uuidv4(), name };
			folders.push(newFolder);
			resolve(newFolder);
		}, LATENCY);
	});
};

// --- Notes API ---

export const getNotesByFolder = async (folderId) => {
	console.log(`API: Fetching notes for folder ${folderId}`);
	return new Promise((resolve) => {
		setTimeout(() => {
			const folderNotes = notes
				.filter((note) => note.folderId === folderId)
				.sort((a, b) => b.lastModified - a.lastModified); // Sort by most recent
			resolve([...folderNotes]); // Return a copy
		}, LATENCY);
	});
};

export const getNoteById = async (noteId) => {
	console.log(`API: Fetching note ${noteId}`);
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			const note = notes.find((n) => n.id === noteId);
			if (note) {
				resolve({ ...note }); // Return a copy
			} else {
				reject(new Error("Note not found"));
			}
		}, LATENCY / 2);
	});
};

export const createNote = async (folderId, title = "New Note") => {
	console.log(`API: Creating note in folder ${folderId}`);
	return new Promise((resolve) => {
		setTimeout(() => {
			const newNote = {
				id: uuidv4(),
				folderId,
				title,
				content: "<p>Start typing here...</p>", // Default content
				lastModified: Date.now(),
			};
			notes.push(newNote);
			resolve(newNote);
		}, LATENCY);
	});
};

export const updateNote = async (noteId, title, content) => {
	console.log(`API: Updating note ${noteId}`);
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			const noteIndex = notes.findIndex((n) => n.id === noteId);
			if (noteIndex !== -1) {
				notes[noteIndex] = {
					...notes[noteIndex],
					title,
					content,
					lastModified: Date.now(),
				};
				resolve({ ...notes[noteIndex] }); // Return a copy
			} else {
				reject(new Error("Note not found for update"));
			}
		}, LATENCY);
	});
};

export const deleteNote = async (noteId) => {
	console.log(`API: Deleting note ${noteId}`);
	return new Promise((resolve) => {
		setTimeout(() => {
			notes = notes.filter((n) => n.id !== noteId);
			resolve({ success: true });
		}, LATENCY);
	});
};

// Optional: Delete Folder (would also need to delete its notes)
export const deleteFolder = async (folderId) => {
	console.log(`API: Deleting folder ${folderId}`);
	return new Promise((resolve) => {
		setTimeout(() => {
			folders = folders.filter((f) => f.id !== folderId);
			// Also delete notes associated with this folder
			notes = notes.filter((n) => n.folderId !== folderId);
			resolve({ success: true });
		}, LATENCY);
	});
};
