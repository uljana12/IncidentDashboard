/**
 * Main application component for the Team Incident Dashboard.
 * 
 * Provides:
 * - React Query provider for data fetching/caching
 * - Main layout with header and incident list
 * - Modal management for create and detail views
 * - Unsaved changes confirmation handling
 */

import { useState, useRef, useCallback } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IncidentList } from "./components/IncidentList/IncidentList";
import { IncidentDetail } from "./components/IncidentDetail/IncidentDetail";
import { IncidentForm } from "./components/IncidentForm/IncidentForm";
import { Modal, Button } from "./components/common";
import type { Incident } from "./api/types";
import "./App.css";

/**
 * React Query client configuration.
 * 
 * Settings:
 * - staleTime: 1 minute before data is considered stale
 * - retry: 2 automatic retries on failure
 * - refetchOnWindowFocus: disabled to prevent unexpected refetches
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Main dashboard component containing the incident list and modals.
 * 
 * Manages three pieces of state:
 * 1. selectedIncident: Currently viewed incident (null when modal closed)
 * 2. isCreateModalOpen: Whether the create incident modal is open
 * 3. hasUnsavedChangesRef: Tracks if detail modal has unsaved edits
 * 
 * The unsaved changes tracking uses a ref instead of state to avoid
 * re-renders when the value changes, since it's only needed when
 * closing the modal.
 */
function Dashboard() {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Ref to track if IncidentDetail has unsaved changes (avoids re-renders)
  const hasUnsavedChangesRef = useRef(false);

  /**
   * Closes the create modal after successful incident creation.
   */
  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
  };

  /**
   * Opens the detail modal for the selected incident.
   */
  const handleIncidentSelect = (incident: Incident) => {
    setSelectedIncident(incident);
  };

  /**
   * Closes the detail modal and resets unsaved changes tracking.
   * Used for direct close (after save) without confirmation.
   */
  const handleDetailClose = useCallback(() => {
    setSelectedIncident(null);
    hasUnsavedChangesRef.current = false;
  }, []);

  /**
   * Handles close request from modal (X button, overlay, Escape).
   * Shows confirmation dialog if there are unsaved changes.
   */
  const handleDetailModalClose = useCallback(() => {
    if (hasUnsavedChangesRef.current) {
      const confirmed = window.confirm("You have unsaved changes. Are you sure you want to close?");
      if (!confirmed) {
        return;
      }
    }
    handleDetailClose();
  }, [handleDetailClose]);

  /**
   * Callback for IncidentDetail to report unsaved changes state.
   * Updates the ref so the close handler can check it.
   */
  const handleUnsavedChanges = useCallback((hasChanges: boolean) => {
    hasUnsavedChangesRef.current = hasChanges;
  }, []);

  return (
    <div className="app">
      <header className="header">
        <h1>Team Incident Dashboard</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          + New Incident
        </Button>
      </header>

      <main className="main">
        <IncidentList onSelectIncident={handleIncidentSelect} />
      </main>

      {/* Incident Detail Modal */}
      <Modal
        isOpen={!!selectedIncident}
        onClose={handleDetailModalClose}
        title={selectedIncident?.title || "Incident Details"}
        size="large"
      >
        {selectedIncident && (
          <IncidentDetail 
            incident={selectedIncident} 
            onClose={handleDetailClose}
            onUnsavedChanges={handleUnsavedChanges}
          />
        )}
      </Modal>

      {/* Create Incident Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Incident"
      >
        <IncidentForm
          onSuccess={handleCreateSuccess}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  );
}

export default App;
