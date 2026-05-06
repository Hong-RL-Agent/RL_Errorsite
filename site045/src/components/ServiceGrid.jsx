import ServiceCard from './ServiceCard.jsx';

export default function ServiceGrid({ services, onOpenModal, onSelectService }) {
  return (
    <div className="service-grid" id="services">
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          onOpenModal={onOpenModal}
          onSelect={() => onSelectService(service)}
        />
      ))}
    </div>
  );
}
