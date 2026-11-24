"use client";

import type { ReactNode } from "react";
import PortalFooter from "@/components/layout/portal-footer";
import PortalHeader from "@/components/layout/portal-header";

export default function PortalFrame({ children, signedIn = false }: { children: ReactNode; signedIn?: boolean }) {
  return <div className="portal-frame" id="top"><PortalHeader signedIn={signedIn} />{children}<PortalFooter /></div>;
}
