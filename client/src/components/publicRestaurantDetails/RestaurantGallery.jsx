const RestaurantGallery = ({ images }) => {
  if (!images?.length) return null;

  return (
    <div className="bg-[#07221e]/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-teal-800/40 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
          Gallery
        </h2>
        <span className="text-[10px] font-bold text-[#ea580c] bg-orange-950/40 border border-orange-500/30 px-2.5 py-0.5 rounded-full">
          {images.length} Photos
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {images.map((img, idx) => (
          <div
            key={img.publicId || idx}
            className="w-full h-24 sm:h-28 rounded-2xl overflow-hidden bg-teal-950 border border-teal-800/40 group"
          >
            <img
              src={img.url}
              alt={`Restaurant photo ${idx + 1}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RestaurantGallery;
