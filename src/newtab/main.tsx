import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/assets/global.css";
import { StorageProvider } from "@/components/providers/storage-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import NovaTab from "@/newtab/nova-tab";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<TooltipProvider>
			<StorageProvider>
				<NovaTab />
			</StorageProvider>
		</TooltipProvider>
	</StrictMode>,
);
