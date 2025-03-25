import { Metadata } from "next";
import { DiseaseList } from "@/components/disease/disease-list";

export const metadata: Metadata = {
  title: "Diseases | Health ISIS",
  description: "Browse and analyze disease data across regions and time periods",
};

export default function DiseasesPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex-1 space-y-4 p-4 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Disease Registry</h2>
        </div>
        
        <div className="space-y-4">
          <DiseaseList />
        </div>
      </div>
    </div>
  );
}
