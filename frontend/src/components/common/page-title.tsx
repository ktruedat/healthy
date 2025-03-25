import React from "react";

interface PageTitleProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageTitle({ title, description, children }: PageTitleProps) {
  return (
    <div className="flex flex-col space-y-2">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {description && (
        <p className="text-muted-foreground text-sm">{description}</p>
      )}
      {children}
    </div>
  );
}
