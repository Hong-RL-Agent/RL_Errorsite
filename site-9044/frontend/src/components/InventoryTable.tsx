export default function InventoryTable({ items }: { items: any[] }) {
  // [Index 410] 결함: 콤마가 포함된 문자열을 그대로 상태로 관리
  const formatQuantity = (num: number) => new Intl.NumberFormat().format(num);

  const handleSave = async (id: number, quantityStr: string) => {
    // ❌ 에러 유도: 숫자로 파싱하지 않고 "1,250" 같은 문자열을 그대로 전송
    console.log(`[Index 410] Sending quantity: ${quantityStr}`);
    await fetch(`/api/inventory/update/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: quantityStr }) 
    });
  };

  return (
    <div className="overflow-x-auto bg-slate-900 rounded-xl border border-slate-800">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-800/50 text-slate-400 text-sm uppercase">
            <th className="p-4 border-b border-slate-800 font-semibold">제품 ID</th>
            <th className="p-4 border-b border-slate-800 font-semibold">제품명</th>
            <th className="p-4 border-b border-slate-800 font-semibold text-right">현재 재고</th>
            <th className="p-4 border-b border-slate-800 font-semibold text-center">액션</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-slate-800/30 transition-colors border-b border-slate-800/50 text-slate-300">
              <td className="p-4 font-mono text-blue-400">#TITAN-{item.id}</td>
              <td className="p-4 font-medium text-white">{item.name}</td>
              <td className="p-4 text-right font-bold text-emerald-400">
                {/* 콤마가 붙은 문자열로 표시 */}
                {formatQuantity(item.quantity)} EA
              </td>
              <td className="p-4 text-center">
                <button 
                  onClick={() => handleSave(item.id, formatQuantity(item.quantity))}
                  className="px-3 py-1 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded hover:bg-blue-600 hover:text-white transition-all text-xs"
                >
                  수량 수정
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}