import React, { useContext } from "react";
import DirectoryTable from "../directoryTable"
import { Store } from "../../store";
import PageLayout from "../PageLayout";

const ExistingDirectoryTable = () => {
  const { state } = useContext(Store);
  const existingDirectories = state.existingDirectories || [];

  return (
    <PageLayout
      eyebrow="This session"
      title="Skipped names"
      subtitle="Names skipped during the latest save because they already existed or were duplicates in the scan."
    >
      <DirectoryTable
        title="Skipped names"
        directories={existingDirectories}
        emptyMessage="No skipped names in this session yet."
      />
    </PageLayout>
  );
};

export default ExistingDirectoryTable;
