import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Main from './pages/Main';
import Detail from './pages/Detail';
import Checkout from './pages/Checkout';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white">
        <header className="border-b sticky top-0 z-50 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <div className="text-2xl font-bold text-rose-500 tracking-tighter">ZENITH</div>
            <nav className="hidden md:flex space-x-8">
              <a href="/" className="text-gray-600 hover:text-gray-900 font-medium">Home</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 font-medium">Experiences</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 font-medium">Online Experiences</a>
            </nav>
            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
              </button>
              <div className="border border-gray-300 rounded-full p-1 pl-3 pr-1 flex items-center space-x-2 hover:shadow-md transition cursor-pointer">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                <div className="bg-gray-500 text-white rounded-full p-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/property/:id" element={<Detail />} />
            <Route path="/checkout/:id" element={<Checkout />} />
          </Routes>
        </main>
        
        <footer className="border-t bg-gray-50 mt-12 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500">
            &copy; 2026 ZENITH. All rights reserved. (Internal QA Sandbox)
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
