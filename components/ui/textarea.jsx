"use client";

import * as React from "react";
// If you have a "cn" utility (e.g., from "lib/utils"), import it. Otherwise just remove it.
// import { cn } from "@/lib/utils";

const Textarea = React.forwardRef((props, ref) => {
  const { className, ...rest } = props;

  // If you do NOT have `cn`, just combine classes using a simple template string instead.
  // e.g.:
  // const combinedClassNames = `flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className || ""}`;

  return (
    <textarea
      ref={ref}
      // If you have cn(), use it. Otherwise, remove cn() and use the commented out version:
      // className={combinedClassNames}
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 shadow-sm ring-offset-background",
        "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...rest}
    />
  );
});

Textarea.displayName = "Textarea";

export { Textarea };
