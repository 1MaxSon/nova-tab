import { DownloadIcon, UploadIcon } from "lucide-react";
import { type ChangeEvent, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldDescription } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { exportData, importData } from "@/lib/backup";

const BackupSection = () => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const runBackupAction = async (action: () => Promise<void>) => {
		setIsLoading(true);
		setError(null);

		try {
			await action();
		} catch (caughtError) {
			setError(
				caughtError instanceof Error
					? caughtError.message
					: "Не удалось выполнить операцию",
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleExport = () => {
		void runBackupAction(exportData);
	};

	const handleImport = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		event.target.value = "";

		if (!file) return;

		void runBackupAction(() => importData(file));
	};

	return (
		<Field>
			<FieldContent>
				<div className="grid grid-cols-2 gap-2">
					<Button
						type="button"
						variant="secondary"
						disabled={isLoading}
						onClick={handleExport}
					>
						{isLoading ? <Spinner /> : <DownloadIcon />}
						Экспортировать
					</Button>
					<Button
						type="button"
						variant="secondary"
						disabled={isLoading}
						onClick={() => fileInputRef.current?.click()}
					>
						{isLoading ? <Spinner /> : <UploadIcon />}
						Импортировать
					</Button>
				</div>
				<input
					ref={fileInputRef}
					type="file"
					accept=".json"
					className="hidden"
					onChange={handleImport}
				/>
			</FieldContent>
			<FieldDescription>
				{error ?? "Резервная копия включает настройки, закладки и город погоды"}
			</FieldDescription>
		</Field>
	);
};

export default BackupSection;
