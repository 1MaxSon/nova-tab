import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/assets/global.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import NovaTab from "@/newtab/nova-tab";

// biome-ignore lint/style/noNonNullAssertion: null
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<TooltipProvider>
			<NovaTab />
		</TooltipProvider>
	</StrictMode>,
);
