import {
	type ComponentProps,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { cn } from "@/lib/utils";

const Clock = ({
	className,
	...props
}: Omit<ComponentProps<"div">, "children">) => {
	const [hm, setHm] = useState("");
	const [seconds, setSeconds] = useState("");

	const intervalId = useRef<number | undefined>(undefined);

	const updateTime = useCallback(() => {
		const now = new Date();

		setHm(
			`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
		);

		setSeconds(String(now.getSeconds()).padStart(2, "0"));
	}, []);

	useEffect(() => {
		updateTime();
		intervalId.current = setInterval(updateTime, 1000);

		return () => {
			clearInterval(intervalId.current);
		};
	}, [updateTime]);

	return (
		<div className={cn(["text-center", className])} {...props}>
			<div className="flex items-baseline gap-0 text-[clamp(5rem,14vw,9.5rem)] font-thin tracking-[0.06em] text-white leading-none drop-shadow-[0_0_80px_rgba(201,169,110,0.12)]">
				<span>{hm}</span>
				<span className="ml-2 pb-3 w-12 text-[clamp(2rem,5vw,3.8rem)] font-thin tracking-wider text-[rgba(255,255,255,0.28)]">
					{seconds}
				</span>
			</div>
		</div>
	);
};

export default Clock;
