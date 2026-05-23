import { createContext, useState, type ReactNode } from 'react'; // 💡 type 키워드 추가

export const AppContext = createContext<any>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [balance, setBalance] = useState(10000);
  
  return (
    <AppContext.Provider value={{ balance, setBalance }}>
      {children}
    </AppContext.Provider>
  );
};


