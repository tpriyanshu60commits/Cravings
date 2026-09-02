import { platformIcon } from "./helpers";

const RestaurantSocialLinks = ({ socialMediaLinks }) => {
  if (!socialMediaLinks?.length) return null;

  return (
    <div className="bg-[#07221e]/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-teal-800/40 shadow-xl">
      <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight mb-3">
        Follow Us
      </h2>
      <div className="flex flex-wrap gap-2.5">
        {socialMediaLinks.map((link, idx) => (
          <a
            key={idx}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#092723] border border-teal-800/60 hover:border-orange-500 text-xs font-semibold text-[#c2dfd8] hover:text-white transition-all shadow-sm"
          >
            <span className="text-base">{platformIcon(link.platform)}</span>
            <span className="capitalize">{link.platform}</span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default RestaurantSocialLinks;
