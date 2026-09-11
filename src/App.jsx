import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import MarkdownViewer from './pages/MarkdownViewer';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="topic/:category/:topic" element={<MarkdownViewer />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
