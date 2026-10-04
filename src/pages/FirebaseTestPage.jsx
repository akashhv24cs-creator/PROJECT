import { useEffect, useState } from "react";
import Navbar from "../../Navbar.jsx";
import Footer from "../../Footer.jsx";
import { app, auth, db, storage, functions, FUNCTIONS_REGION } from "../config/firebase";
import { usePageSEO } from "../hooks/usePageSEO";

export default function FirebaseTestPage() {
  usePageSEO({
    title: "Internal Diagnostic | Zenera Trips",
    robots: "noindex, nofollow, noarchive",
  });

  const [testResults, setTestResults] = useState({
    appStatus: "Checking...",
    projectId: "Checking...",
    authStatus: "Checking...",
    firestoreStatus: "Checking...",
    storageStatus: "Checking...",
    functionsStatus: "Checking...",
    errors: [],
  });

  useEffect(() => {
    const errors = [];
    let appStatus = "Disconnected";
    let projectId = "Unknown";
    let authStatus = "Not Initialized";
    let firestoreStatus = "Not Initialized";
    let storageStatus = "Not Initialized";
    let functionsStatus = "Not Initialized";

    // 1. Verify Firebase App
    try {
      if (app && app.name === "[DEFAULT]") {
        appStatus = "Connected";
        projectId = app.options?.projectId || "Not specified in config";
      } else {
        errors.push("Firebase App failed to initialize properly.");
      }
    } catch (err) {
      appStatus = "Error";
      errors.push(`Firebase App Error: ${err.message || String(err)}`);
    }

    // 2. Verify Firebase Auth
    try {
      if (auth && auth.app) {
        authStatus = "Initialized";
      } else {
        errors.push("Firebase Auth instance missing app binding.");
      }
    } catch (err) {
      authStatus = "Error";
      errors.push(`Firebase Auth Error: ${err.message || String(err)}`);
    }

    // 3. Verify Cloud Firestore
    try {
      if (db && db.app) {
        firestoreStatus = "Initialized";
      } else {
        errors.push("Firestore instance missing app binding.");
      }
    } catch (err) {
      firestoreStatus = "Error";
      errors.push(`Firestore Error: ${err.message || String(err)}`);
    }

    // 4. Verify Firebase Storage
    try {
      if (storage && storage.app) {
        storageStatus = "Initialized";
      } else {
        errors.push("Storage instance missing app binding.");
      }
    } catch (err) {
      storageStatus = "Error";
      errors.push(`Storage Error: ${err.message || String(err)}`);
    }

    // 5. Verify Cloud Functions
    try {
      if (functions && functions.app) {
        functionsStatus = `Initialized (${FUNCTIONS_REGION})`;
      } else {
        errors.push("Cloud Functions instance missing app binding.");
      }
    } catch (err) {
      functionsStatus = "Error";
      errors.push(`Cloud Functions Error: ${err.message || String(err)}`);
    }

    setTestResults({
      appStatus,
      projectId,
      authStatus,
      firestoreStatus,
      storageStatus,
      functionsStatus,
      errors,
    });
  }, []);

  // Development-only check
  if (!import.meta.env.DEV) {
    return (
      <div className="min-h-screen bg-charcoal text-cream flex items-center justify-center p-4">
        <div className="bg-cream/5 border border-cream/10 rounded-2xl p-6 text-center max-w-md">
          <h1 className="text-xl font-bold text-orange">Access Restricted</h1>
          <p className="text-sm text-cream/70 mt-2">
            This verification route is available in development mode only.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal text-cream flex flex-col justify-between selection:bg-orange selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 pt-28 pb-16">
        <div className="bg-cream/5 border border-cream/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="border-b border-cream/10 pb-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-orange block mb-1">
                Development Connection Verification
              </span>
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-cream">
                Firebase Web SDK Test
              </h1>
            </div>
            <span className="bg-orange/20 text-orange font-mono text-xs px-2.5 py-1 rounded-full uppercase tracking-wider font-semibold border border-orange/30">
              Dev Mode
            </span>
          </div>

          {/* Test Status Table / List */}
          <div className="space-y-3 font-mono text-sm">
            <div className="flex justify-between items-center bg-charcoal/60 p-3.5 rounded-xl border border-cream/10">
              <span className="text-cream/70">Firebase App:</span>
              <span
                className={`font-semibold ${
                  testResults.appStatus === "Connected"
                    ? "text-emerald-400"
                    : "text-rose-400"
                }`}
              >
                {testResults.appStatus}
              </span>
            </div>

            <div className="flex justify-between items-center bg-charcoal/60 p-3.5 rounded-xl border border-cream/10">
              <span className="text-cream/70">Firebase Project:</span>
              <span className="font-semibold text-orange">
                {testResults.projectId}
              </span>
            </div>

            <div className="flex justify-between items-center bg-charcoal/60 p-3.5 rounded-xl border border-cream/10">
              <span className="text-cream/70">Authentication:</span>
              <span
                className={`font-semibold ${
                  testResults.authStatus.includes("Initialized")
                    ? "text-emerald-400"
                    : "text-rose-400"
                }`}
              >
                {testResults.authStatus}
              </span>
            </div>

            <div className="flex justify-between items-center bg-charcoal/60 p-3.5 rounded-xl border border-cream/10">
              <span className="text-cream/70">Firestore:</span>
              <span
                className={`font-semibold ${
                  testResults.firestoreStatus.includes("Initialized")
                    ? "text-emerald-400"
                    : "text-rose-400"
                }`}
              >
                {testResults.firestoreStatus}
              </span>
            </div>

            <div className="flex justify-between items-center bg-charcoal/60 p-3.5 rounded-xl border border-cream/10">
              <span className="text-cream/70">Storage:</span>
              <span
                className={`font-semibold ${
                  testResults.storageStatus.includes("Initialized")
                    ? "text-emerald-400"
                    : "text-rose-400"
                }`}
              >
                {testResults.storageStatus}
              </span>
            </div>

            <div className="flex justify-between items-center bg-charcoal/60 p-3.5 rounded-xl border border-cream/10">
              <span className="text-cream/70">Cloud Functions:</span>
              <span
                className={`font-semibold ${
                  testResults.functionsStatus.includes("Initialized")
                    ? "text-emerald-400"
                    : "text-rose-400"
                }`}
              >
                {testResults.functionsStatus}
              </span>
            </div>
          </div>

          {/* Errors section if any */}
          {testResults.errors.length > 0 && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-xs font-mono space-y-2">
              <div className="text-rose-400 font-bold uppercase tracking-wide">
                Initialization Errors ({testResults.errors.length}):
              </div>
              {testResults.errors.map((err, i) => (
                <div key={i} className="text-rose-300">
                  • {err}
                </div>
              ))}
            </div>
          )}

          <div className="text-xs text-cream/40 text-center font-mono pt-2">
            No Firestore writes executed • No test documents created • Zero production data altered
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
