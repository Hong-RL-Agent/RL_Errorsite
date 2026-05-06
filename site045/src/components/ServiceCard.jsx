export default function ServiceCard({ service, onOpenModal, onSelect }) {
  return (
    <article className="service-card">
      <div className="service-image" style={{ backgroundImage: `url(${service.image})` }} />
      <div className="service-label">{service.category}</div>
      <h4>{service.name}</h4>
      <p>{service.recommended}</p>
      <div className="service-meta">
        <span>{service.duration}</span>
        <strong>{service.price}</strong>
      </div>
      <div className="service-actions">
        <button type="button" onClick={onOpenModal}>자세히 보기</button>
        <button type="button" className="primary" onClick={onSelect}>예약하기</button>
      </div>
    </article>
  );
}
