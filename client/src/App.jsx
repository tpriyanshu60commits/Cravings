import Header from "./components/Header";
import { BrowserRouter , Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ContactUs from "./pages/ContactUs";
import Home from "./pages/Home";
function App()
{
  return(
    <>
      <BrowserRouter>
      <Header/>
        <Routes>
          <Route path="/login" element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>
          <Route path="/" element={<Home/>}/>
          <Route path="/contactUs" element={<ContactUs/>}/>
        </Routes>
      </BrowserRouter>
    </>
  );
}
export default App;