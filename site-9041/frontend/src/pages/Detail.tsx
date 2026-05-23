import { useParams, Link } from 'react-router-dom';

export default function Detail() {
  const { id } = useParams();

  // Mock property data for simplicity
  const property = {
    name: "Luxury Villa with Infinity Pool",
    location: "Bali, Indonesia",
    price: 550000,
    rating: 4.96,
    reviews: 124,
    host: "Superhost",
    images: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1600607687931-cebf5871c0eb?auto=format&fit=crop&q=80&w=800",
    ]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-semibold mb-2">{property.name}</h1>
      <div className="flex items-center text-sm mb-6">
        <span className="font-semibold flex items-center">
          <svg className="w-4 h-4 mr-1 text-black" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
          {property.rating}
        </span>
        <span className="mx-2 underline cursor-pointer">{property.reviews} reviews</span>
        <span className="mx-2">•</span>
        <span className="underline cursor-pointer">{property.location}</span>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-12 rounded-2xl overflow-hidden h-[500px]">
        <div className="col-span-2 row-span-2">
          <img src={property.images[0]} className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition" alt="Main" />
        </div>
        <div className="col-span-1 row-span-1">
          <img src={property.images[1]} className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition" alt="Sub 1" />
        </div>
        <div className="col-span-1 row-span-1">
          <img src={property.images[2]} className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition" alt="Sub 2" />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-12">
        <div className="md:w-2/3">
          <h2 className="text-2xl font-semibold mb-4">Hosted by {property.host}</h2>
          <hr className="my-6" />
          <p className="text-gray-700 leading-relaxed mb-6">
            Experience ultimate luxury in this modern villa featuring an infinity pool overlooking the ocean. 
            Perfect for families or groups looking for a private getaway.
          </p>
        </div>

        <div className="md:w-1/3">
          <div className="sticky top-28 bg-white border border-gray-200 shadow-xl rounded-2xl p-6">
            <div className="flex items-end mb-4">
              <span className="text-2xl font-bold">${property.price.toLocaleString()}</span>
              <span className="text-gray-500 ml-1 mb-1">night</span>
            </div>
            
            <div className="border border-gray-400 rounded-xl mb-4 overflow-hidden">
              <div className="flex border-b border-gray-400">
                <div className="w-1/2 p-3 border-r border-gray-400">
                  <div className="text-xs font-bold">CHECK-IN</div>
                  <div className="text-sm">Add date</div>
                </div>
                <div className="w-1/2 p-3">
                  <div className="text-xs font-bold">CHECKOUT</div>
                  <div className="text-sm">Add date</div>
                </div>
              </div>
              <div className="p-3">
                <div className="text-xs font-bold">GUESTS</div>
                <div className="text-sm">1 guest</div>
              </div>
            </div>
            
            <Link to={`/checkout/${id || '1'}`}>
              <button className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-lg transition duration-200">
                Reserve
              </button>
            </Link>
            
            <div className="text-center text-sm text-gray-500 mt-4">You won't be charged yet</div>
          </div>
        </div>
      </div>
    </div>
  );
}
