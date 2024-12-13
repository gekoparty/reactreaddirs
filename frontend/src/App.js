import "./App.css";
import SelectDirectoryForm from "./components/selectDirectoryForm";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import SavedDirectoryTable from "./components/screens/SavedDirectoryTable";
import ExistingDirectoryTable from "./components/screens/ExistingDirectoryTable";
import { StoreProvider } from "./store";
import HomeScreen from "./components/screens/HomeScreen";

function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <div className="App">
          <Routes default="false">
            <Route
              path="/saved-directories"
              element={<SavedDirectoryTable />}
            />
            <Route
              path="/existing-directories"
              element={<ExistingDirectoryTable />}
            />
            <Route path="/" element={<HomeScreen />} />
            <Route
              path="/selectDirectoryForm"
              element={<SelectDirectoryForm />}
              />
          </Routes>
        </div>
      </BrowserRouter>
    </StoreProvider>
  );
}
//
export default App;
