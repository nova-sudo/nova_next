import React, { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";

function AliasInput({ initialAlias, onAliasChange }) {
  const [alias, setAlias] = useState(initialAlias || "");

  useEffect(() => {
    setAlias(initialAlias || "");
  }, [initialAlias]);
  
  const handleAliasChange = (event) => {
    const value = event.target.value;
    setAlias(value);
    onAliasChange(value);
  };

  return (
    <div className="mt-4">
      <TextField
        id="outlined-alias"
        label="Alias"
        value={alias}
        onChange={handleAliasChange}
        className="w-full"
        InputLabelProps={{
          style: { background: "white", padding: "0 4px", zIndex: 1 },
        }}
        required
        helperText="Your alias is a unique identifier for your profile. Use 5-20 lowercase letters or numbers. You can change it anytime."
      />
    </div>
  );
}

export default AliasInput;