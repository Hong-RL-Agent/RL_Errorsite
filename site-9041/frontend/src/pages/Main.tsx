import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

interface Property {
  ID: number;
  NAME: string;
  LOCATION: string;
  PRICE: number;
  IMAGE_URL: string;
  [key: string]: any;
}

export default function Main() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [keyword, setKeyword] = useState('');
  const [errorData, setErrorData] = useState<string | null>(null);

  const fetchProperties = async (searchKeyword = '') => {
    try {
      const res = await fetch(`/api/v1/search?keyword=${encodeURIComponent(searchKeyword)}`);
      
      if (!res.ok) {
        const errText = await res.text();
        setErrorData(errText);
        setProperties([]);
        return;
      }
      
      const data = await res.json();
      setErrorData(null);
      // If the query returns a raw row array or objects
      if (Array.isArray(data)) {
        // H2 returns column names in uppercase by default for JdbcTemplate
        setProperties(data);
      }
    } catch (err: any) {
      setErrorData(err.toString());
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProperties(keyword);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Bar */}
      <div className="max-w-3xl mx-auto mb-12 mt-8">
        <form onSubmit={handleSearch} className="flex items-center bg-white border border-gray-300 rounded-full shadow-lg p-2 hover:shadow-xl transition duration-300">
          <input
            type="text"
            placeholder="Search by location or name... (Try: ' OR '1'='1 )"
            className="flex-grow px-6 py-3 bg-transparent outline-none text-gray-700 placeholder-gray-400"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button type="submit" className="bg-rose-500 hover:bg-rose-600 text-white p-4 rounded-full transition duration-300">
            <Search className="w-5 h-5" />
          </button>
        </form>
      </div>

      {errorData && (
        <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-xl overflow-x-auto border border-red-200">
          <h3 className="font-bold mb-2">Error / Data Leak (Defect 260)</h3>
          <pre className="text-xs">{errorData}</pre>
        </div>
      )}

      {/* Property Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {properties.map((prop, idx) => (
          <Link to={`/property/${prop.ID}`} key={idx} className="group cursor-pointer">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl mb-3">
              <img 
                src={prop.IMAGE_URL || 'https://images.unsplash.com/photo-1560347876-aeef00ee58a4?auto=format&fit=crop&q=80&w=800'} 
                alt={prop.NAME || 'Property'} 
                className="object-cover w-full h-full group-hover:scale-105 transition duration-500"
              />
              <button className="absolute top-3 right-3 text-white hover:text-rose-500 transition">
                <svg className="w-6 h-6 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              </button>
            </div>
            <div className="font-semibold text-gray-900 truncate">{prop.LOCATION || 'Unknown Location'}</div>
            <div className="text-gray-500 text-sm truncate">{prop.NAME || 'Unknown Property'}</div>
            <div className="mt-1 flex items-center">
              <span className="font-semibold text-gray-900">${prop.PRICE?.toLocaleString() || '0'}</span>
              <span className="text-gray-500 ml-1">night</span>
            </div>
            {/* If SQL injection leaked other tables like USERNAME, show it */}
            {prop['USERNAME'] && (
              <div className="mt-2 text-xs text-red-500 break-all">
                Leaked User: {prop['USERNAME']} | {prop['PASSWORD_HASH']}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
