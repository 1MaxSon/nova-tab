import { useCallback, useEffect, useEffectEvent, useRef } from "react";

export function useInterval(cb: () => void, ms: number) {
	const id = useRef<number | undefined>(undefined);
	const onInterval = useEffectEvent(cb);

	const handleClearInterval = useCallback(() => {
		window.clearInterval(id.current);
	}, []);

	useEffect(() => {
		id.current = window.setInterval(onInterval, ms);
		return handleClearInterval;
	}, [ms, handleClearInterval]);

	return handleClearInterval;
}
