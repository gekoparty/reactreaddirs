import React, { useEffect, useState } from "react";
import axios from "axios";
import PermanentDrawerLeft from "../PermanentDrawerLeft";
import DirectoryTable from "../DirectoryTable";

const SearchTable = () => {
  const [directories, setDirectories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDirectories = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get("/api/directories");
        setDirectories(response.data.directories);
      } catch (err) {
        setError("Error fetching directories: " + err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDirectories();
  }, []);

  return (
    <div style={{ display: "flex" }}>
      <PermanentDrawerLeft />
      <div style={{ flex: 1 }}>
        {loading ? (
          <p>Loading directories...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <DirectoryTable directories={directories} />
        )}
      </div>
    </div>
  );
};

export default SearchTable;