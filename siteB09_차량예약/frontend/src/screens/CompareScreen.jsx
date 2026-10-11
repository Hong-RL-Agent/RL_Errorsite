import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, won } from '../api';
import { assetUrl } from '../api/media';
import { useFlow } from '../flows/BookingFlow';

const ROWS = [
  ['차종', (v) => v.model.categoryName], ['좌석', (v) => `${v.model.seats}인승`], ['연료', (v) => v.model.fuelName], ['변속기', (v) => v.model.transmissionName],
  ['일 대여료', (v) => won(v.dailyRate)], ['출력', (v) => `${v.specs.horsepower}마력`], ['트렁크', (v) => `${v.specs.trunkLiters}L`], ['연비', (v) => v.specs.efficiency],
  ['주행거리', (v) => `${v.odometer.toLocaleString('ko-KR')}km`], ['현재 위치', (v) => `${v.depot.city} ${v.depot.name}`],
];

export default function CompareScreen() {
  const { compare, toggleCompare } = useFlow();
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const key = compare.map((c) => c.id).join(',');

  useEffect(() => {
    let alive = true;
    Promise.all(compare.map((c) => api.vehicle(c.id))).then((r) => alive && setList(r.map((x) => x.data))).catch(() => {});
    return () => { alive = false; };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="screen">
      <h1>차량 비교</h1>
      {compare.length === 0 ? (
        <div className="empty">비교할 차량이 없어요. 검색 결과에서 ‘비교 담기’를 눌러 최대 3대까지 비교해 보세요.
          <p><button type="button" className="btn primary" onClick={() => navigate('/')}>차량 찾기</button></p></div>
      ) : (
        <div className="cmp-grid" style={{ gridTemplateColumns: `140px repeat(${list.length}, 1fr)` }}>
          <div />
          {list.map((v) => (
            <div className="cmp-head" key={v.id}>
              <img src={assetUrl(v.thumbnailUrl)} alt="" />
              <b>{v.model.make} {v.model.name}</b>
              <button type="button" className="link" onClick={() => toggleCompare({ id: v.id })}>비교 해제</button>
            </div>
          ))}
          {ROWS.map(([label, fn]) => (
            <React.Fragment key={label}>
              <div className="cmp-label">{label}</div>
              {list.map((v) => (<div className="cmp-cell" key={v.id}>{fn(v)}</div>))}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
