import { useEffect, useState } from "react";
import { app, auth, db, storage, functions, FUNCTIONS_REGION } from "../config/firebase";

export default function FirebaseDevStatus() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    try {
      const isAppInit = !!app;
      const isAuthInit = !!auth;
      const isFirestoreInit = !!db;
      const isStorageInit = !!storage;
      const isFunctionsInit = !!functions;
      const projectId = app?.options?.projectId || "(Pending .env.local configuration)";
      const isConnected = !!(app?.options?.apiKey && app?.options?.projectId);

      const devInfo = {
        firebase: isConnected ? "Connected" : "Initialized (Pending .env.local values)",
        projectId: projectId,
        auth: isAuthInit ? "Initialized" : "Failed",
        firestore: isFirestoreInit ? "Initialized" : "Failed",
        storage: isStorageInit ? "Initialized" : "Failed",
        functions: isFunctionsInit ? `Initialized (${FUNCTIONS_REGION})` : "Failed",
      };

      setStatus(devInfo);

      // Console logging for dev inspection
      console.log("=== ZENERA FIREBASE CONNECTION VERIFICATION ===");
      console.log(`Firebase: ${devInfo.firebase}`);
      console.log(`Project ID: ${devInfo.projectId}`);
      console.log(`Auth: ${devInfo.auth}`);
      console.log(`Firestore: ${devInfo.firestore}`);
      console.log(`Storage: ${devInfo.storage}`);
      console.log(`Functions: ${devInfo.functions}`);
      console.log("================================================");
    } catch (err) {
      console.error("Firebase connection verification error:", err);
      setStatus({
        error: err.message || "Failed to initialize Firebase services",
      });
    }
  }, []);

  // Only render in development environment
  if (!import.meta.env.DEV || !status) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] bg-charcoal/90 backdrop-blur-md border border-orange/40 text-cream p-3 rounded-xl shadow-2xl text-xs max-w-xs font-mono select-none">
      <div className="flex items-center justify-between font-bold border-b border-cream/10 pb-1 mb-1.5 text-orange">
        <span>Firebase Status</span>
        <span className="text-[10px] bg-orange/20 text-orange px-1.5 py-0.5 rounded font-sans uppercase">DEV</span>
      </div>
      {status.error ? (
        <div className="text-red-400">Error: {status.error}</div>
      ) : (
        <div className="space-y-0.5 text-cream/80">
          <div><strong className="text-cream">Firebase:</strong> {status.firebase}</div>
          <div><strong className="text-cream">Project ID:</strong> <span className="text-orange">{status.projectId}</span></div>
          <div><strong className="text-cream">Auth:</strong> {status.auth}</div>
          <div><strong className="text-cream">Firestore:</strong> {status.firestore}</div>
          <div><strong className="text-cream">Storage:</strong> {status.storage}</div>
          <div><strong className="text-cream">Functions:</strong> {status.functions}</div>
        </div>
      )}
    </div>
  );
}
