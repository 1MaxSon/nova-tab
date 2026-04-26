import { ChevronRightIcon } from "lucide-react";
import Clock from "@/newtab/components/clock";
import DateWithWeather from "@/newtab/components/date-with-weather";

export default function NovaTab() {
	return (
		<>
			<main className="fixed inset-0 z-10 flex flex-col items-center justify-center px-12 py-6">
				<div className="flex flex-col items-center">
					<Clock className="mb-3 animate-in duration-500" />
					<DateWithWeather className="mb-10 animate-in duration-500 delay-100" />
				</div>

				<div
					id="city-popover"
					className="fixed z-20 hidden w-70 rounded-[1.25rem] border border-white/12 bg-[#0e101a]/95 p-3 backdrop-blur-2xl shadow-[0_16px_48px_rgba(0,0,0,0.5)]"
				>
					<div id="city-input-wrap" className="flex gap-2">
						<input
							id="city-input"
							type="text"
							placeholder="Введите город..."
							autoComplete="off"
							className="flex-1 rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-sm text-white outline-none transition-colors duration-200 focus:border-white/25"
						/>
						<button
							id="city-confirm"
							type="button"
							className="rounded-xl bg-[#c9a96e] px-4 py-2 text-sm font-medium text-[#0b0d14] transition hover:opacity-90"
						>
							Найти
						</button>
					</div>
					<div id="city-suggestions" className="mt-2 flex flex-col gap-1"></div>
				</div>

				<div
					id="search-wrap"
					className="relative w-full max-w-135 mb-10 animate-in duration-500 delay-200"
				>
					<svg
						id="search-icon"
						width="17"
						height="17"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgba(255,255,255,0.45)]"
					>
						<title>Поиск</title>
						<circle cx="11" cy="11" r="8" />
						<line x1="21" y1="21" x2="16.65" y2="16.65" />
					</svg>
					<input
						id="search"
						type="text"
						placeholder="Поиск в интернете..."
						autoComplete="off"
						spellCheck="false"
						className="w-full rounded-full border border-white/10 bg-white/5 px-14 py-4 text-base text-white outline-none transition duration-200 focus:border-white/20 focus:bg-white/10 focus:shadow-[0_0_0_3px_rgba(201,169,110,0.12),0_8px_32px_rgba(0,0,0,0.3)]"
					/>
					<button
						id="search-btn"
						type="button"
						className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-[#c9a96e]/30 bg-[#c9a96e]/15 text-[#c9a96e] transition hover:bg-[#c9a96e]/20"
					>
						<ChevronRightIcon className="translate-x-px" />
					</button>
				</div>

				<section
					id="shortcuts-section"
					className="w-full animate-in duration-500 delay-300"
				>
					<div
						id="shortcuts-grid"
						className="grid auto-rows-fr grid-cols-[repeat(auto-fill,minmax(192px,1fr))] justify-center gap-3"
					></div>
				</section>
			</main>

			<div className="fixed inset-0 z-0 nova-gradient" />
			<div className="nova-bg-grain" />

			<div
				id="toolbar"
				className="fixed right-7 bottom-6 z-20 flex flex-col items-end gap-2.5 animate-in duration-1000 delay-400"
			>
				<button
					id="wallpaper-open"
					type="button"
					title="Сменить обои"
					className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/6 backdrop-blur-xl text-[rgba(255,255,255,0.45)] transition duration-200 hover:bg-white/12 hover:text-[#c9a96e]"
				>
					<svg
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.8"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<title>Сменить обои</title>
						<rect x="3" y="3" width="18" height="18" rx="2" />
						<circle cx="8.5" cy="8.5" r="1.5" />
						<polyline points="21 15 16 10 5 21" />
					</svg>
				</button>
			</div>

			<div
				id="wallpaper-modal"
				className="fixed inset-0 z-30 hidden items-center justify-center bg-black/65 backdrop-blur-xl p-6"
			>
				<div className="max-w-3xl overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#10141c]/92 p-7">
					<div className="flex items-center justify-between mb-5">
						<span className="text-[1.4rem] font-light tracking-wider text-white">
							Обои
						</span>
						<button
							id="wallpaper-close"
							type="button"
							className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/6 text-[rgba(255,255,255,0.65)] transition hover:bg-white/12 hover:text-white"
						>
							<svg
								width="14"
								height="14"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2.5"
								strokeLinecap="round"
							>
								<line x1="18" y1="6" x2="6" y2="18" />
								<line x1="6" y1="6" x2="18" y2="18" />
							</svg>
						</button>
					</div>
					<div id="wallpaper-grid" className="grid grid-cols-4 gap-2.5"></div>
					<div
						id="upload-zone"
						className="mt-4 rounded-[0.75rem] border border-dashed border-white/18 px-6 py-7 text-center text-[0.85rem] text-[rgba(255,255,255,0.55)] transition hover:border-[#c9a96e] hover:bg-[#c9a96e]/10 hover:text-[#c9a96e]"
					>
						<div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-[rgba(255,255,255,0.7)]">
							<svg
								width="22"
								height="22"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<polyline points="16 16 12 12 8 16" />
								<line x1="12" y1="12" x2="12" y2="21" />
								<path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
							</svg>
						</div>
						<div>Загрузить своё изображение</div>
						<div className="mt-1 text-[0.75rem] opacity-60">
							Перетащите или кликните · JPG, PNG, WEBP
						</div>
					</div>
					<input
						type="file"
						id="file-input"
						accept="image/*"
						className="hidden"
					/>
				</div>
			</div>

			<div
				id="add-modal"
				className="fixed inset-0 z-30 hidden items-center justify-center bg-black/65 backdrop-blur-xl p-6"
			>
				<div
					id="add-modal-inner"
					className="max-w-95 overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#10141c]/92 p-7"
				>
					<div className="flex items-center justify-between mb-5">
						<span className="text-[1.4rem] font-light tracking-wider text-white">
							Новый ярлык
						</span>
						<button
							type="button"
							className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/6 text-[rgba(255,255,255,0.65)] transition hover:bg-white/12 hover:text-white"
						>
							<svg
								width="14"
								height="14"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2.5"
								strokeLinecap="round"
							>
								<line x1="18" y1="6" x2="6" y2="18" />
								<line x1="6" y1="6" x2="18" y2="18" />
							</svg>
						</button>
					</div>
					<form id="add-form" className="grid gap-3">
						<input
							id="add-url"
							type="url"
							placeholder="https://example.com"
							required
							className="w-full rounded-xl border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors duration-200 focus:border-white/25"
						/>
						<input
							id="add-name"
							type="text"
							placeholder="Название (необязательно)"
							maxLength={20}
							className="w-full rounded-xl border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors duration-200 focus:border-white/25"
						/>
						<div className="grid grid-cols-2 gap-2 mt-1">
							<button
								type="button"
								id="cancel-add"
								className="rounded-xl border border-white/12 bg-white/5 px-4 py-3 text-sm font-medium text-[rgba(255,255,255,0.65)] transition hover:bg-white/10"
							>
								Отмена
							</button>
							<button
								type="submit"
								className="rounded-xl bg-[#c9a96e] px-4 py-3 text-sm font-medium text-[#0b0d14] transition hover:opacity-90"
							>
								Добавить
							</button>
						</div>
					</form>
				</div>
			</div>
		</>
	);
}
