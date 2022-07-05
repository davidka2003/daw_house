import React from "react";
import Mint from "./Components/Mint";
import { Routes, Route } from "react-router-dom";
import Unlockable from "./Components/Unlockable";
const App = () => {
  return (
    <>
      <Routes>
        <Route path={"/unblockable"} element={<Unlockable />}></Route>
        <Route path={"*"} element={<Mint />}></Route>
      </Routes>
    </>
  );
};
export default App;
