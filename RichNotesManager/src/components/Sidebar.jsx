import React, { useState, useEffect } from "react";
import { getFolders, createFolder, deleteFolder } from "../api/data"; // Import deleteFolder
import "./Sidebar.css";

function Sidebar({ selectedFolderId, onSelectFolder, onFoldersUpdate }) {
	const [folders, setFolders] = useState([]);
	const [newFolderName, setNewFolderName] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isCreating, setIsCreating] = useState(false);

	const fetchFolders = async () => {
		setIsLoading(true);
		try {
			const fetchedFolders = await getFolders();
			setFolders(fetchedFolders);
			if (onFoldersUpdate) onFoldersUpdate(fetchedFolders); // Notify parent about folder list
			// If no folder is selected, or the selected one doesn't exist anymore, select the first one
			if (
				fetchedFolders.length > 0 &&
				(!selectedFolderId || !fetchedFolders.some((f) => f.id === selectedFolderId))
			) {
				if (onSelectFolder) onSelectFolder(fetchedFolders[0].id);
			} else if (fetchedFolders.length === 0) {
				if (onSelectFolder) onSelectFolder(null); // No folders left
			}
		} catch (error) {
			console.error("Failed to fetch folders:", error);
			// Handle error display if needed
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchFolders();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []); // Fetch folders on mount

	const handleCreateFolder = async (e) => {
		e.preventDefault();
		if (!newFolderName.trim()) return;
		setIsCreating(true);
		try {
			const newFolder = await createFolder(newFolderName.trim());
			// Instead of just adding, refetch to ensure consistency (or update state carefully)
			await fetchFolders(); // Refetch folders including the new one
			setNewFolderName(""); // Clear input
			if (onSelectFolder) onSelectFolder(newFolder.id); // Select the new folder
		} catch (error) {
			console.error("Failed to create folder:", error);
		} finally {
			setIsCreating(false);
		}
	};

	const handleDeleteFolder = async (folderIdToDelete, event) => {
		event.stopPropagation(); // Prevent folder selection when clicking delete
		if (window.confirm(`Are you sure you want to delete this folder and all its notes?`)) {
			setIsLoading(true); // Use loading state for deletion as well
			try {
				await deleteFolder(folderIdToDelete);
				await fetchFolders(); // Refetch folders
				// Parent (DashboardPage) will handle selecting a new folder if the deleted one was active
			} catch (error) {
				console.error("Failed to delete folder:", error);
			} finally {
				setIsLoading(false);
			}
		}
	};

	return (
		<div className="sidebar">
			<h2>Folders</h2>
			{isLoading && <p>Loading folders...</p>}
			<ul>
				{folders.map((folder) => (
					<li
						key={folder.id}
						className={folder.id === selectedFolderId ? "selected" : ""}
						onClick={() => onSelectFolder(folder.id)}
					>
						<span>{folder.name}</span>
						{/* Add a delete button - careful with styling */}
						<button
							className="delete-folder-btn"
							onClick={(e) => handleDeleteFolder(folder.id, e)}
							title="Delete Folder"
						>
							× {/* Simple X symbol */}
						</button>
					</li>
				))}
			</ul>
			<form onSubmit={handleCreateFolder} className="new-folder-form">
				<input
					type="text"
					value={newFolderName}
					onChange={(e) => setNewFolderName(e.target.value)}
					placeholder="New folder name"
					disabled={isCreating}
				/>
				<button type="submit" disabled={isCreating || !newFolderName.trim()}>
					{isCreating ? "Creating..." : "+ Add"}
				</button>
			</form>
		</div>
	);
}

export default Sidebar;
