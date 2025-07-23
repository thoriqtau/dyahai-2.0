import React from "react";
import { BrowserRouter as Router, Routes, Route, } from "react-router-dom";

import HomePage from "./pages/HomePage";
import GeneratePage from "./pages/GeneratePage";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/404Page";
import { AuthProvider } from "./provider/authProvider";
import RequireAuth from "./provider/requireAuth";


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/generate" element={
            <RequireAuth>
              <GeneratePage />
            </RequireAuth>
          } />
          <Route path="/profile" element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          } />
          <Route path="/*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
export default App;
