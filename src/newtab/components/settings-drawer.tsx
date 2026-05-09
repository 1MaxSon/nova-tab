import { MapPinIcon, PlusIcon, SettingsIcon } from "lucide-react";
import { useStorage } from "@/components/providers/storage-provider";
import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import type { SettingsData } from "@/lib/storage";

const SettingsDrawer = () => {
	const {
		setSettings,
		storage: { settings },
	} = useStorage();

	const setSetting = <K extends keyof SettingsData>(
		key: K,
		value: SettingsData[K],
	) => {
		setSettings((prev) => ({
			...prev,
			[key]: value,
		}));
	};

	return (
		<Drawer direction="right">
			<DrawerTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="absolute top-2 right-2 opacity-60 hover:opacity-100"
				>
					<SettingsIcon />
				</Button>
			</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Settings</DrawerTitle>
					<DrawerDescription></DrawerDescription>
				</DrawerHeader>
				<div className="overflow-y-auto px-4">
					<FieldGroup>
						<Field>
							<FieldContent className="flex items-center justify-between flex-row">
								<FieldLabel htmlFor="transparentAddShortcut">
									<PlusIcon className="size-4" /> Make the add shortcut button
									transparent
								</FieldLabel>
								<Switch
									name="transparentAddShortcut"
									id="transparentAddShortcut"
									checked={settings.transparentAddShortcut}
									onCheckedChange={(checked) => {
										setSetting("transparentAddShortcut", checked);
									}}
								/>
							</FieldContent>
							<FieldDescription>
								It will become visible when hovering over
							</FieldDescription>
						</Field>
						<Field>
							<FieldContent className="flex items-center justify-between flex-row">
								<FieldLabel htmlFor="transparentChangeGeo">
									<MapPinIcon className="size-4" /> Make the change geo button
									transparent
								</FieldLabel>
								<Switch
									name="transparentChangeGeo"
									id="transparentChangeGeo"
									checked={settings.transparentChangeGeo}
									onCheckedChange={(checked) => {
										setSetting("transparentChangeGeo", checked);
									}}
								/>
							</FieldContent>
							<FieldDescription>
								It will become visible when hovering over
							</FieldDescription>
						</Field>
					</FieldGroup>
				</div>
				<DrawerFooter>
					<DrawerClose asChild>
						<Button>Close</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
};

export default SettingsDrawer;
