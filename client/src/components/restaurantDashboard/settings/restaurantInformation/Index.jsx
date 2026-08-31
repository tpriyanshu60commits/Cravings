import PersonalInformation from "./PersonalInformation";
import RestaurantInformation from "./RestaurantInformation";
import LegalInformation from "./LegalInformation";
const Index = () => {
  return (
    <>
      <div className="overflow-y-auto h-full p-2 space-y-2">
        <PersonalInformation />
        <RestaurantInformation />
        <LegalInformation />
      </div>
    </>
  );
};

export default Index;
