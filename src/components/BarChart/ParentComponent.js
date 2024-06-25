import React, { useState } from "react";
import ChartTwo from "";

function ParentComponent() {
  const [title, setTitle] = useState("");

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  return (
    <div>
      <input
        type="text"
        value={title}
        onChange={handleTitleChange}
        placeholder="Enter title"
      />
      <ChartTwo title={title} />
    </div>
  );
}

export default ParentComponent;
